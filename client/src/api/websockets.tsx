import { useApiClient } from "@client/api";
import { createStrictContext } from "@client/utils/context";
import { ChatSchemaType, ChatWithMessagesSchemaType } from "@shared/api";
import { safeCall } from "@shared/utils";
import { WSMessage } from "@shared/websockets";
import { useQueryClient } from "@tanstack/react-query";
import { ReactNode, useEffect, useMemo } from "react";


const wrapWebSocket = (websocket: WebSocket) => {
  const messageCallbacks = new Set<(val: WSMessage) => void>();
  const closeCallbacks = new Set<VoidFunction>();

  websocket.onopen = () => {

  }
  websocket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    messageCallbacks.forEach(cb => safeCall(() => cb(data as WSMessage)));
  }

  websocket.onclose = () => {
    closeCallbacks.forEach(cb => safeCall(() => cb()));
  }

  const onMessage = (cb: (val: WSMessage) => void): VoidFunction => {
    messageCallbacks.add(cb);
    return () => messageCallbacks.delete(cb);
  };
  const onClose = (cb: VoidFunction): VoidFunction => {
    closeCallbacks.add(cb);
    return () => closeCallbacks.delete(cb);
  };

  const close = () => {
    websocket.close();
  }

  return {
    onMessage,
    onClose,
    close,
  }
};

type KatukoWebsocket = ReturnType<typeof wrapWebSocket>;


const [WebsocketProviderInner, useWebSocket] = createStrictContext<KatukoWebsocket>('WebsocketsContext');

export { useWebSocket };

export const WebsocketProvider = ({ children }: { children: ReactNode }) => {
  const api = useApiClient();
  const queryClient = useQueryClient();
  const client = useMemo(() => {
    return wrapWebSocket(api.subscribe.$ws());
  }, [api]);

  useEffect(() => {
    return client.onMessage((message) => {
      console.log('WebSocket message', message);
      // TODO: need to bring immer here, it gets out of control D:
      if (message.type === 'updateMessage') {
        queryClient.setQueryData(['chats', message.data.chatId], (old: ChatWithMessagesSchemaType | undefined): ChatWithMessagesSchemaType | undefined => {
          if (!old) return old;

          return {
            ...old,
            messages: old.messages.map(m => {
              if (m.id === message.data.messageId) {
                return {
                  ...m,
                  text: message.data.text,
                  isGenerating: message.data.isGenerating ?? m.isGenerating,
                };
              }
              return m;
            }),
          };
        });
      } else if (message.type === 'updateChat') {
        queryClient.setQueryData(['chats', message.data.chatId], (old: ChatWithMessagesSchemaType | undefined): ChatWithMessagesSchemaType | undefined => {
          if (!old) return old;

          return {
            ...old,
            chat: {
              ...old.chat,
              title: message.data.title ?? old.chat.title,
            }
          };
        });
        queryClient.setQueryData(['chats'], (old: ChatSchemaType[] | undefined): ChatSchemaType[] | undefined => {
          if (!old) return old;

          return old.map((chat): ChatSchemaType => {
            if (chat.id === message.data.chatId) {
              return {
                ...chat,
                title: message.data.title ?? chat.title,
              }
            }
            return chat;
          });
        });
      }
    });
  }, [client]);

  return <WebsocketProviderInner value={client}>
    {children}
  </WebsocketProviderInner>
};
