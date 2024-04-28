
import { navigate } from 'wouter/use-browser-location';
import { ChatLayout } from '@client/components/ChatLayout';
import styles from './RootPage.module.scss';
import { useModels, useNewChatMutation } from '@client/api';
import { useMemo, useState } from 'react';
import { Select } from '@client/components/Select';
import { WithLabel } from '@client/components/WithLabel';
import { useAtom } from 'jotai/react';
import { lastUsedModelAtom } from '@client/atoms/chat';
import { withErrorBoundary } from '@client/components/ErrorBoundary';
import { Button } from '@client/components/Button';
import { HiOutlineCog6Tooth } from 'react-icons/hi2';
import { Card } from '@client/components/Card';
import { ChatSettings, useChatSettings } from '@client/components/ChatSettings';
import { usePageTitle } from '@client/utils/hooks';

export const RootPage = withErrorBoundary(() => {
  const newChat = useNewChatMutation();
  const { data: providers } = useModels();

  const options = useMemo(() => {
    return providers.flatMap(p => p.models.map(m => {
      return {
        ...m,
        providerId: p.provider.id,
        modelId: m.id,
        name: `${p.provider.name} > ${m.name}`,
      };
    }));
  }, [providers]);

  const [lastUsedModel, setLastUsedModel] = useAtom(lastUsedModelAtom);
  const selectedModel = options.find(o => o.providerId === lastUsedModel?.providerId && o.modelId === lastUsedModel?.modelId) || options[0];

  const [settingsVisible, setSettingsVisible] = useState(false);
  const [chatSettings, updateChatSettings] = useChatSettings(selectedModel.defaultParameters);

  usePageTitle('New chat');

  // TODO: when redirecting to /chats/{id}, there is a flick of white screen (from Suspense) and also text area loses focus
  return (<div className={styles.RootPage}>
    <Card flexGrow>
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
            icon={<HiOutlineCog6Tooth />}
          />
        </ChatLayout.TitleRightActions>
        <ChatLayout.MessagesArea>
        </ChatLayout.MessagesArea>
        <ChatLayout.TextareaActions>
          <WithLabel label='Model:'>
            <Select
              triggerClassname={styles.modelSelect}
              options={options}
              value={selectedModel}
              onChange={setLastUsedModel}
              getOptionKey={o => o.providerId + o.modelId}
              getOptionLabel={o => o.name}
            />
          </WithLabel>
        </ChatLayout.TextareaActions>
      </ChatLayout>
    </Card>
    {settingsVisible && <Card className={styles.settingsCard}>
      <ChatSettings settings={chatSettings} settingsUpdater={updateChatSettings} />  
    </Card>}
  </div>);
});

RootPage.displayName = 'RootPage'
