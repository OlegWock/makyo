import { useApiClient } from "@client/api";
import { createStrictContext } from "@client/utils/context";
import { ChatSchemaType, ChatWithMessagesSchemaType } from "@shared/api";
import { safeCall } from "@shared/utils";
import { WSMessage } from "@shared/websockets";
import { useQueryClient } from "@tanstack/react-query";
import { produce } from "immer";
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

      if (message.type === 'updateMessage') {
        queryClient.setQueryData(['chats', message.data.chatId], (old: ChatWithMessagesSchemaType | undefined): ChatWithMessagesSchemaType | undefined => {
          if (!old) return old;

          return produce(old, (draft) => {
            draft.messages.forEach(m => {
              if (m.id !== message.data.messageId) return;

              m.text = message.data.text;
              if (message.data.isGenerating !== undefined) {
                m.isGenerating = message.data.isGenerating;
              }
            })
          });
        });
      } else if (message.type === 'updateChat') {
        queryClient.setQueryData(['chats', message.data.chatId], (old: ChatWithMessagesSchemaType | undefined): ChatWithMessagesSchemaType | undefined => {
          if (!old) return old;

          return produce(old, (draft) => {
            if (message.data.title) {
              draft.chat.title = message.data.title;
            }
          });
        });
        queryClient.setQueryData(['chats'], (old: ChatSchemaType[] | undefined): ChatSchemaType[] | undefined => {
          if (!old) return old;

          return produce(old, (draft) => {
            const chat = draft.find(c => c.id === message.data.chatId);
            if (chat && message.data.title) {
              chat.title = message.data.title;
            }
          });
        });
      }
    });
  }, [client]);

  return <WebsocketProviderInner value={client}>
    {children}
  </WebsocketProviderInner>
};
