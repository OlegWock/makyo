import { ChatLayout } from '@client/components/ChatLayout';
import styles from './ChatPage.module.scss';
import { useStrictRouteParams } from '@client/utils/routing';
import { z } from 'zod';
import { useChat, useSendMessageMutation, useModels } from '@client/api';
import { useMemo } from 'react';
import { MessagesHistory } from './MessagesHistory';
import { ChatPageContextProvider } from './context';
import { useImmer } from 'use-immer';
import { buildTreeFromMessages, getLastMessage, PreferredTreeBranchesMap } from './tree';
import { withErrorBoundary } from '@client/components/ErrorBoundary';

export const ChatPage = withErrorBoundary(() => {
  const { id } = useStrictRouteParams({ id: z.coerce.number() });
  const { data: chatInfo } = useChat(id);
  const { data: providers } = useModels();
  const sendMessage = useSendMessageMutation(id);

  const usedModel = useMemo(() => {
    const provider = providers.find(p => p.provider.id === chatInfo.chat.providerId);
    const model = provider?.models.find(m => m.id === chatInfo.chat.modelId);
    return model?.name;
  }, [providers, chatInfo.chat.modelId, chatInfo.chat.providerId]);

  const tree = useMemo(() => buildTreeFromMessages(chatInfo.messages), [chatInfo.messages]);
  const [treeChoices, setTreeChoices] = useImmer<PreferredTreeBranchesMap>(() => new Map<number, number>());
  const lastMessage = getLastMessage(tree, treeChoices);

  // TODO: show chat title here and also in tab title
  return (<ChatPageContextProvider value={{ chatId: id, messagesTree: tree, treeChoices, setTreeChoices }}>
    <ChatLayout
      onSend={(text) => {
        sendMessage.mutate({
          text,
          parentId: lastMessage.message.id,
        })
      }}
    >
      <ChatLayout.Title>{chatInfo.chat.title}</ChatLayout.Title>
      <ChatLayout.MessagesArea>
        <MessagesHistory
          modelName={usedModel}
        />
      </ChatLayout.MessagesArea>

    </ChatLayout>
  </ChatPageContextProvider>);
});

ChatPage.displayName = 'ChatPage';
