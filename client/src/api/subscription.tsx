import { useApiClient } from "@client/api";
import { createStrictContext } from "@client/utils/context";
import { ChatSchemaType, ChatWithMessagesSchemaType } from "@shared/api";
import { SubscriptionMessage } from "@shared/subscription";
import { useQueryClient } from "@tanstack/react-query";
import { produce } from "immer";
import { ReactNode, useEffect, useState } from "react";


type SubscriptionContextType = {
  status: 'connected' | 'disconnected' | 'connecting',
};



const [SubscriptionProviderInner, useSubscription] = createStrictContext<SubscriptionContextType>('SubscriptionContext');

export { useSubscription };


export const SubscriptionProvider = ({ children }: { children: ReactNode }) => {
  const { apiClient: api } = useApiClient();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<SubscriptionContextType["status"]>('connecting');

  useEffect(() => {
    const updateStatus = () => {
      if (client.readyState === EventSource.CONNECTING) setStatus('connecting');
      if (client.readyState === EventSource.OPEN) setStatus('connected');
      if (client.readyState === EventSource.CLOSED) setStatus('disconnected');
    };

    const attachListeners = (client: EventSource) => {
      // @ts-ignore
      window.sseClient = client;

      client.addEventListener('open', (e) => updateStatus());
      client.addEventListener('error', (e) => {
        setStatus('disconnected');
      });
      client.addEventListener('message', (event) => {
        lastMessageAt = Date.now();
        const message = JSON.parse(event.data) as SubscriptionMessage;
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
        } else if (message.type === 'updateModels') {
          console.log('Refetching available models');
          queryClient.refetchQueries({
            queryKey: [['models']]
          });
        }
      });
    };

    const recreateClient = () => {
      if (client) client.close();
      client = new EventSource(api.subscribe.sse.$url());
      attachListeners(client);
      updateStatus();
    };

    let client: EventSource;
    recreateClient();

    let lastMessageAt = 0;
    const reconnectTimer = setInterval(() => {
      if (lastMessageAt < Date.now() - 2000) {
        recreateClient();
      }
    }, 3000);

    return () => {
      client.close();
      clearInterval(reconnectTimer);
    }
  }, [api]);

  return <SubscriptionProviderInner value={{ status }}>
    {children}
  </SubscriptionProviderInner>
};
