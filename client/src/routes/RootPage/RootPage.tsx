import { ChatLayout } from '@client/components/ChatLayout';
import styles from './RootPage.module.scss';
import { useModels, useNewChatMutation } from '@client/api';
import { startTransition, useMemo, useState } from 'react';
import { Select } from '@client/components/Select';
import { WithLabel } from '@client/components/WithLabel';
import { useAtom } from 'jotai/react';
import { lastUsedModelAtom } from '@client/atoms/chat';
import { withErrorBoundary } from '@client/components/ErrorBoundary';
import { Button } from '@client/components/Button';
import { HiChevronRight, HiOutlineCog6Tooth } from 'react-icons/hi2';
import { Card } from '@client/components/Card';
import { ChatSettings, useChatSettings } from '@client/components/ChatSettings';
import { usePageTitle } from '@client/utils/hooks';
import { ProviderIcon } from '@client/components/icons';
import { useLocation } from 'wouter';
import { ModelSelect } from '@client/components/ModelSelect';
import { useIsMobile } from '@client/utils/responsive';
import { Drawer } from '@client/components/Drawer';

export const RootPage = withErrorBoundary(() => {
  const newChat = useNewChatMutation();
  const { data: providers } = useModels();

  const options = useMemo(() => {
    return providers.flatMap(p => p.models.map(m => {
      return {
        ...m,
        providerId: p.provider.id,
        modelId: m.id,
      };
    }));
  }, [providers]);

  const isMobile = useIsMobile();

  const [lastUsedModel, setLastUsedModel] = useAtom(lastUsedModelAtom);
  const selectedModel = options.find(o => o.providerId === lastUsedModel?.providerId && o.modelId === lastUsedModel?.modelId) || options[0];

  const [settingsVisible, setSettingsVisible] = useState(false);
  const [chatSettings, updateChatSettings] = useChatSettings(selectedModel.defaultParameters);

  const [_, navigate] = useLocation();

  usePageTitle('New chat');

  const chatSettingsElement = (<ChatSettings settings={chatSettings} settingsUpdater={updateChatSettings} />);

  return (<div className={styles.RootPage}>
    <Card flexGrow withScrollArea={false}>
      <ChatLayout
        onSend={(text) => {
          newChat.mutateAsync({
            providerId: selectedModel.providerId,
            modelId: selectedModel.modelId,
            text,
            parameters: {
              temperature: chatSettings.temperature.enabled ? chatSettings.temperature.value : undefined,
              system: chatSettings.system.enabled ? chatSettings.system.value : undefined,
            }
          }).then((res) => {
            navigate(`/chats/${res.id}`);
          })
        }}
      >
        <ChatLayout.Title>New chat</ChatLayout.Title>
        <ChatLayout.TitleRightActions>
          <Button
            onClick={() => setSettingsVisible(p => !p)}
            variant='borderless'
            icon={settingsVisible ? <HiChevronRight /> : <HiOutlineCog6Tooth />}
          />
        </ChatLayout.TitleRightActions>
        <ChatLayout.MessagesArea>
        </ChatLayout.MessagesArea>
        <ChatLayout.TextareaActions>
          <ModelSelect
            value={selectedModel}
            onChange={setLastUsedModel}
          />
        </ChatLayout.TextareaActions>
      </ChatLayout>
    </Card>

    {isMobile && <Drawer open={settingsVisible} onOpenChange={setSettingsVisible}>
      {chatSettingsElement}
    </Drawer>}
    {(settingsVisible && !isMobile) && <Card className={styles.settingsCard}>
      {chatSettingsElement}
    </Card>}
  </div>);
});

RootPage.displayName = 'RootPage'
