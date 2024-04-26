import { ChatLayout } from '@client/components/ChatLayout';
import styles from './ChatPage.module.scss';
import { useStrictRouteParams } from '@client/utils/routing';
import { z } from 'zod';
import { useChat, useChatMessagesMutation, useModels } from '@client/api';
import { MessagesHistory } from '@client/components/MessagesHistory';
import { useMemo } from 'react';

export const ChatPage = () => {
  const { id } = useStrictRouteParams({ id: z.coerce.number() });
  const { data: chatInfo } = useChat(id);
  const { data: providers } = useModels();
  const sendMessage = useChatMessagesMutation(id);

  const sortedMessages = useMemo(() => [...chatInfo.messages].sort((a, b) => a.createdAt - b.createdAt), [chatInfo.messages])
  const usedModel = useMemo(() => {
    const provider = providers.find(p => p.provider.id === chatInfo.chat.providerId);
    const model = provider?.models.find(m => m.id === chatInfo.chat.modelId);
    return model?.name;
  }, [providers, chatInfo.chat.modelId, chatInfo.chat.providerId])

  // TODO: show chat title here and also in tab title
  return (<ChatLayout
    onSend={(text) => {
      sendMessage.mutate({
        text,
        parentId: sortedMessages.at(-1)!.id,
      })
    }}
  >
    <ChatLayout.Title>{chatInfo.chat.title}</ChatLayout.Title>
    <ChatLayout.MessagesArea>
      <MessagesHistory
        messages={sortedMessages}
        modelName={usedModel}
      />
    </ChatLayout.MessagesArea>

  </ChatLayout>);
};
