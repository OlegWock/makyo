import { ChatLayout } from '@client/components/ChatLayout';
import styles from './ChatPage.module.scss';
import { useStrictRouteParams } from '@client/utils/routing';
import { z } from 'zod';
import { useChat, useSendMessageMutation, useModels, useEditChatMutation } from '@client/api';
import { useMemo, useRef, useState } from 'react';
import { MessagesHistory } from './MessagesHistory';
import { ChatPageContextProvider } from './context';
import { buildTreeFromMessages, getLastMessage, useTreeChoices, walkOverAllMessagesInTree } from './tree';
import { withErrorBoundary } from '@client/components/ErrorBoundary';
import { Card } from '@client/components/Card';
import { ChatSettings, useChatSettings } from '@client/components/ChatSettings';
import { HiChevronRight, HiOutlineCog6Tooth, HiOutlinePencil } from 'react-icons/hi2';
import { Button } from '@client/components/Button';
import { useMount, usePageTitle } from '@client/utils/hooks';
import { Input } from '@client/components/Input';
import { useSearchParams } from '@client/components/Router/hooks';
import { produce } from 'immer';
import { Drawer } from '@client/components/Drawer';
import { useIsMobile } from '@client/utils/responsive';


export const ChatPage = withErrorBoundary(() => {
  const { id } = useStrictRouteParams({ id: z.coerce.number() });
  const { data: chatInfo } = useChat(id);
  const sendMessage = useSendMessageMutation(id);
  const editChat = useEditChatMutation(id);

  const [searchParams] = useSearchParams();
  const defaultScrollTo = searchParams.messageId ? parseInt(searchParams.messageId) : undefined;
  const ref = useRef<HTMLDivElement>(null);

  usePageTitle(chatInfo.chat.title);

  const tree = useMemo(() => buildTreeFromMessages(chatInfo.messages), [chatInfo.messages]);
  const [treeChoices, setTreeChoices] = useTreeChoices(tree);
  const lastMessage = getLastMessage(tree, treeChoices);

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(() => chatInfo.chat.title);

  const [settingsVisible, setSettingsVisible] = useState(false);
  // TODO: this is a bug probably. Chat settings depend 
  // on model (though currently all models have same settings),
  // so they should be reset if model changes
  const [chatSettings, updateChatSettings] = useChatSettings(chatInfo.chat);

  const isMobile = useIsMobile();

  useMount(() => {
    if (defaultScrollTo) {
      // TODO: walk tree upwards from defaultScrollTo and switch all preffered routes in treeChoices so this message will be visible
      walkOverAllMessagesInTree(tree, (node) => {
        if (node.message.id === defaultScrollTo) {
          console.log('Scroll to node', node);
          const nodeIndex = node.parent?.children.indexOf(node) ?? -1;
          console.log('Parent id', node.parent!.message.id);
          console.log('Index', nodeIndex);
          if (nodeIndex !== -1) {
            setTreeChoices((p) => produce(p, (draft) => {
              draft[node.parent!.message.id] = nodeIndex;
            }));
          }
          return false;
        }
      });

      setTimeout(() => {
        console.log('Triggering scrollt o message');
        ref.current?.querySelector(`[data-message-id="${defaultScrollTo}"]`)?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'center',
        });
      }, 50);
    }
  });


  const chatSettingsElement = (<ChatSettings
    settings={chatSettings}
    settingsUpdater={updateChatSettings}
    isSubmitting={editChat.isPending}
    onSubmit={async () => {
      await editChat.mutateAsync({
        parameters: {
          temperature: chatSettings.temperature.enabled ? chatSettings.temperature.value : undefined,
          system: chatSettings.system.enabled ? chatSettings.system.value : undefined,
        },
        model: {
          providerId: chatSettings.model!.providerId,
          modelId: chatSettings.model!.modelId,
        }
      });
      setSettingsVisible(false);
    }}
  />);


  return (<ChatPageContextProvider value={{ chatId: id, chatInfo, messagesTree: tree, treeChoices, setTreeChoices, providerId: chatInfo.chat.providerId }}>
    <div className={styles.ChatPage} ref={ref}>
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
              icon={(settingsVisible && !isMobile) ? <HiChevronRight /> : <HiOutlineCog6Tooth />}
            />
          </ChatLayout.TitleRightActions>
          <ChatLayout.MessagesArea>
            <MessagesHistory />
          </ChatLayout.MessagesArea>

        </ChatLayout>
      </Card>

      {isMobile && <Drawer open={settingsVisible} onOpenChange={setSettingsVisible}>
        {chatSettingsElement}
      </Drawer>}
      {(settingsVisible && !isMobile) && <Card className={styles.settingsCard}>
        {chatSettingsElement}
      </Card>}
    </div>
  </ChatPageContextProvider>);
});

ChatPage.displayName = 'ChatPage';
