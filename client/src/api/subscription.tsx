import { useApiClient } from "@client/api";
import { createStrictContext } from "@client/utils/context";
import { ChatSchemaType, ChatWithMessagesSchemaType } from "@shared/api";
import { safeCall } from "@shared/utils";
import { SubscriptionMessage } from "@shared/subscription";
import { useQueryClient } from "@tanstack/react-query";
import { produce } from "immer";
import { ReactNode, useEffect, useMemo } from "react";
import { initiateLocalOllamaProxy, localOllamaProxyEnabled } from "@client/api/ollama-proxy";


// TODO: both websockets and SSE seem to be aborted exactly in a minute. Might need to implement regular pings
// https://stackoverflow.com/questions/49408031/websockets-in-chrome-and-firefox-disconnecting-after-one-minute-of-inactivity

type SubscriptionClient = {
  onMessage: (cb: (val: SubscriptionMessage) => void) => VoidFunction;
  onClose: (cb: (e: CloseEvent) => void) => VoidFunction;
  close: VoidFunction,
}

const wrapWebSocket = (websocket: WebSocket): SubscriptionClient => {
  const messageCallbacks = new Set<(val: SubscriptionMessage) => void>();
  const closeCallbacks = new Set<(e: CloseEvent) => void>();

  websocket.onopen = () => {

  };
  websocket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    messageCallbacks.forEach(cb => safeCall(() => cb(data as SubscriptionMessage)));
  };
  websocket.onerror = (err) => {
    console.log('Websocker error', err);
  };
  websocket.onclose = (e) => {
    closeCallbacks.forEach(cb => safeCall(() => cb(e)));
  };

  const onMessage = (cb: (val: SubscriptionMessage) => void): VoidFunction => {
    messageCallbacks.add(cb);
    return () => messageCallbacks.delete(cb);
  };
  const onClose = (cb: (e: CloseEvent) => void): VoidFunction => {
    closeCallbacks.add(cb);
    return () => closeCallbacks.delete(cb);
  };

  const close = () => {
    websocket.close();
  };

  return {
    onMessage,
    onClose,
    close,
  };
};

const wrapEventsSource = (evtSource: EventSource): SubscriptionClient => {
  const messageCallbacks = new Set<(val: SubscriptionMessage) => void>();
  const closeCallbacks = new Set<(e: CloseEvent) => void>();

  evtSource.onmessage = (event) => {
    const data = JSON.parse(event.data);
    messageCallbacks.forEach(cb => safeCall(() => cb(data as SubscriptionMessage)));
  };
  evtSource.onerror = (err) => {
    console.log('SSE error', err);
  };

  const onMessage = (cb: (val: SubscriptionMessage) => void): VoidFunction => {
    messageCallbacks.add(cb);
    return () => messageCallbacks.delete(cb);
  };
  const onClose = (cb: (e: CloseEvent) => void): VoidFunction => {
    closeCallbacks.add(cb);
    return () => closeCallbacks.delete(cb);
  };

  const close = () => {
    evtSource.close();
  };

  return {
    onMessage,
    onClose,
    close,
  };
};


const [SubscriptionProviderInner, useSubscriptionClient] = createStrictContext<SubscriptionClient>('SubscriptionContext');

export { useSubscriptionClient };

const USE_SSE = true;

export const SubscriptionProvider = ({ children }: { children: ReactNode }) => {
  const api = useApiClient();
  const queryClient = useQueryClient();

  const client = useMemo(() => {
    if (USE_SSE) {
      return wrapEventsSource(new EventSource(api.subscribe.sse.$url()))
    }
    return wrapWebSocket(api.subscribe.ws.$ws());
  }, [api]);

  useEffect(() => {
    return client.onMessage((message) => {
      console.log('Subscription message', message);

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
              if (message.data.error !== undefined) {
                m.error = message.data.error;
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

  

  return <SubscriptionProviderInner value={client}>
    {children}
  </SubscriptionProviderInner>
};
