import { ChatLayout } from '@client/components/ChatLayout';
import styles from './ChatPage.module.scss';
import { useStrictRouteParams } from '@client/utils/routing';
import { z } from 'zod';
import { useChat, useChatMessagesMutation, useModels } from '@client/api';
import { MessagesHistory } from '@client/components/MessagesHistory';
import { useMemo } from 'react';

export const ChatPage = () => {
  const { id } = useStrictRouteParams({ id: z.coerce.number() });
  const { data } = useChat(id);
  const { data: providers } = useModels();
  const sendMessage = useChatMessagesMutation(id);

  const sortedMessages = useMemo(() => [...data.messages].sort((a, b) => a.createdAt - b.createdAt), [data.messages])
  const usedModel = useMemo(() => {
    const provider = providers.find(p => p.provider.id === data.chat.providerId);
    const model = provider?.models.find(m => m.id === data.chat.modelId);
    return model?.name;
  }, [providers, data.chat.modelId, data.chat.providerId])

  return (<ChatLayout
    onSend={(text) => {
      sendMessage.mutate({
        text,
        parentId: sortedMessages.at(-1)!.id,
      })
    }}
  >
    <MessagesHistory
      messages={sortedMessages}
      modelName={usedModel}
    />
  </ChatLayout>);
};
