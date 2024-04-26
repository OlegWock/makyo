import { ChatLayout } from '@client/components/ChatLayout';
import styles from './ChatPage.module.scss';
import { useStrictRouteParams } from '@client/utils/routing';
import { z } from 'zod';
import { useChat, useSendMessageMutation, useModels } from '@client/api';
import { useMemo } from 'react';
import { MessagesHistory } from './MessagesHistory';
import { ChatPageContextProvider } from '@client/routes/ChatPage/context';

export const ChatPage = () => {
  const { id } = useStrictRouteParams({ id: z.coerce.number() });
  const { data: chatInfo } = useChat(id);
  const { data: providers } = useModels();
  const sendMessage = useSendMessageMutation(id);

  const sortedMessages = useMemo(() => [...chatInfo.messages].sort((a, b) => a.createdAt - b.createdAt), [chatInfo.messages])
  const usedModel = useMemo(() => {
    const provider = providers.find(p => p.provider.id === chatInfo.chat.providerId);
    const model = provider?.models.find(m => m.id === chatInfo.chat.modelId);
    return model?.name;
  }, [providers, chatInfo.chat.modelId, chatInfo.chat.providerId])

  // TODO: show chat title here and also in tab title
  return (<ChatPageContextProvider value={{ chatId: id }}>
    <ChatLayout
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

    </ChatLayout>
  </ChatPageContextProvider>);
};
