import { ChatLayout } from '@client/components/ChatLayout';
import styles from './ChatPage.module.scss';
import { useStrictRouteParams } from '@client/utils/routing';
import { z } from 'zod';
import { useChat, useSendMessageMutation, useModels, useEditChatMutation } from '@client/api';
import { useMemo, useState } from 'react';
import { MessagesHistory } from './MessagesHistory';
import { ChatPageContextProvider } from './context';
import { useImmer } from 'use-immer';
import { buildTreeFromMessages, getLastMessage, PreferredTreeBranchesMap } from './tree';
import { withErrorBoundary } from '@client/components/ErrorBoundary';
import { Card } from '@client/components/Card';
import { ChatSettings, useChatSettings } from '@client/components/ChatSettings';
import { HiChevronRight, HiOutlineCog6Tooth, HiOutlinePencil } from 'react-icons/hi2';
import { Button } from '@client/components/Button';
import { usePageTitle } from '@client/utils/hooks';
import { Input } from '@client/components/Input';


export const ChatPage = withErrorBoundary(() => {
  const { id } = useStrictRouteParams({ id: z.coerce.number() });
  const { data: chatInfo } = useChat(id);
  const { data: providers } = useModels();
  const sendMessage = useSendMessageMutation(id);
  const editChat = useEditChatMutation(id);

  usePageTitle(chatInfo.chat.title);

  const usedModel = useMemo(() => {
    const provider = providers.find(p => p.provider.id === chatInfo.chat.providerId);
    const model = provider?.models.find(m => m.id === chatInfo.chat.modelId);
    return model?.name;
  }, [providers, chatInfo.chat.modelId, chatInfo.chat.providerId]);

  const tree = useMemo(() => buildTreeFromMessages(chatInfo.messages), [chatInfo.messages]);
  const [treeChoices, setTreeChoices] = useImmer<PreferredTreeBranchesMap>(() => new Map<number, number>());
  const lastMessage = getLastMessage(tree, treeChoices);

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(() => chatInfo.chat.title);

  const [settingsVisible, setSettingsVisible] = useState(false);
  const [chatSettings, updateChatSettings] = useChatSettings(chatInfo.chat);


  return (<ChatPageContextProvider value={{ chatId: id, messagesTree: tree, treeChoices, setTreeChoices, providerId: chatInfo.chat.providerId }}>
    <div className={styles.ChatPage}>
      <Card flexGrow withScrollArea={false}>
        <ChatLayout
          onSend={(text) => {
            sendMessage.mutate({
              text,
              parentId: lastMessage.message.id,
            })
          }}
        >
          <ChatLayout.Title>
            <div className={styles.titleWrapper}>
              {isEditingTitle ? (<>
                <Input className={styles.titleInput} value={titleDraft} onValueChange={setTitleDraft} autoFocus />
                <Button
                  key='save'
                  size='medium'
                  variant='primary'
                  loading={editChat.isPending}
                  onClick={async () => {
                    await editChat.mutateAsync({ title: titleDraft });
                    setIsEditingTitle(false);
                  }}
                >
                  Save
                </Button>
                <Button
                  size='medium'
                  onClick={() => setIsEditingTitle(false)}
                >
                  Cancel
                </Button>
              </>) : (<>
                {chatInfo.chat.title}
                <Button
                  key='edit'
                  variant='borderless'
                  className={styles.editButton}
                  icon={<HiOutlinePencil />}
                  size='small'
                  onClick={() => {
                    setIsEditingTitle(true);
                    setTitleDraft(chatInfo.chat.title);
                  }}
                />
              </>)}
            </div>

          </ChatLayout.Title>
          <ChatLayout.TitleRightActions>
            <Button
              onClick={() => setSettingsVisible(p => !p)}
              variant='borderless'
              icon={settingsVisible ? <HiChevronRight /> : <HiOutlineCog6Tooth />}
            />
          </ChatLayout.TitleRightActions>
          <ChatLayout.MessagesArea>
            <MessagesHistory
              modelName={usedModel}
            />
          </ChatLayout.MessagesArea>

        </ChatLayout>
      </Card>
      {settingsVisible && <Card className={styles.settingsCard}>
        <ChatSettings
          settings={chatSettings}
          settingsUpdater={updateChatSettings}
          isSubmitting={editChat.isPending}
          onSubmit={async () => {
            await editChat.mutateAsync({
              parameters: {
                temperature: chatSettings.temperature.enabled ? chatSettings.temperature.value : undefined,
                system: chatSettings.system.enabled ? chatSettings.system.value : undefined,
              }
            });
            setSettingsVisible(false);
          }}
        />
      </Card>}
    </div>
  </ChatPageContextProvider>);
});

ChatPage.displayName = 'ChatPage';
