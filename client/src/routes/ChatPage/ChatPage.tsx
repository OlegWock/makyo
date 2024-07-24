import styles from './ChatPage.module.scss';
import { useStrictRouteParams } from '@client/utils/routing';
import { z } from 'zod';
import { useChat, useEditChatMutation } from '@client/api';
import { useRef, useState } from 'react';
import { ChatPageContextProvider } from './context';
import { withErrorBoundary } from '@client/components/ErrorBoundary';
import { Card } from '@client/components/Card';
import { ChatSettings, useChatSettings } from '@client/components/ChatSettings';
import { HiChevronRight, HiOutlineCog6Tooth, HiOutlinePencil } from 'react-icons/hi2';
import { Button } from '@client/components/Button';
import { usePageTitle } from '@client/utils/hooks';
import { Input } from '@client/components/Input';
import { useSearchParams } from '@client/components/Router/hooks';
import { Drawer } from '@client/components/Drawer';
import { useIsMobile } from '@client/utils/responsive';
import { FlowHistory } from './FlowHistory';
import useMotionMeasure from 'react-use-motion-measure';
import './styles.scss';


export const ChatPage = withErrorBoundary(() => {
  const { id } = useStrictRouteParams({ id: z.coerce.number() });
  const { data: chatInfo } = useChat(id);
  const editChat = useEditChatMutation();

  const [searchParams] = useSearchParams();
  const defaultScrollTo = searchParams.messageId ? searchParams.messageId : undefined;

  const ref = useRef<HTMLDivElement>(null);

  usePageTitle(chatInfo.chat.title);

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(() => chatInfo.chat.title);

  const [settingsVisible, setSettingsVisible] = useState(false);
  // TODO: this is a bug probably. Chat settings depend 
  // on model (though currently all models have same settings),
  // so they should be reset if model changes
  const [chatSettings, updateChatSettings] = useChatSettings(chatInfo.chat);

  const isMobile = useIsMobile();

  const [viewportRef, viewportBounds] = useMotionMeasure();

  const chatSettingsElement = (<ChatSettings
    settings={chatSettings}
    settingsUpdater={updateChatSettings}
    isSubmitting={editChat.isPending}
    onSubmit={async () => {
      await editChat.mutateAsync({
        chatId: id,
        payload: {
          parameters: {
            temperature: chatSettings.temperature.enabled ? chatSettings.temperature.value : undefined,
            system: chatSettings.system.enabled ? chatSettings.system.value : undefined,
          },
          model: {
            providerId: chatSettings.model!.providerId,
            modelId: chatSettings.model!.modelId,
          }
        }
      });
      setSettingsVisible(false);
    }}
  />);


  return (<ChatPageContextProvider value={{
    chatId: id,
    chatInfo,
    viewportBounds,
    providerId: chatInfo.chat.providerId,
    defaultScrollTo,
  }}>
    <div className={styles.ChatPage} ref={ref}>
      <Card flexGrow withScrollArea={false}>
        <div className={styles.layout}>
          <div className={styles.header}>
            <div className={styles.leftActions}></div>
            <div className={styles.title}>
              <div className={styles.titleWrapper}>
                {isEditingTitle ? (<>
                  <Input className={styles.titleInput} value={titleDraft} onValueChange={setTitleDraft} autoFocus />
                  <Button
                    key='save'
                    size='medium'
                    variant='primary'
                    loading={editChat.isPending}
                    onClick={async () => {
                      await editChat.mutateAsync({ chatId: id, payload: { title: titleDraft } });
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
            </div>
            <div className={styles.rightActions}>
              <Button
                onClick={() => setSettingsVisible(p => !p)}
                variant='borderless'
                icon={(settingsVisible && !isMobile) ? <HiChevronRight /> : <HiOutlineCog6Tooth />}
              />
            </div>
          </div>
          <div className={styles.chat} ref={viewportRef}>
            <FlowHistory />
          </div>
        </div>
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
