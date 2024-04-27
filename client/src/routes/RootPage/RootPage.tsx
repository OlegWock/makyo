
import { navigate } from 'wouter/use-browser-location';
import { ChatLayout } from '@client/components/ChatLayout';
import styles from './RootPage.module.scss';
import { useModels, useNewChatMutation } from '@client/api';
import { useMemo } from 'react';
import { Select } from '@client/components/Select';
import { WithLabel } from '@client/components/WithLabel';
import { useAtom } from 'jotai/react';
import { lastUsedModelAtom } from '@client/atoms/chat';
import { withErrorBoundary } from '@client/components/ErrorBoundary';

export const RootPage = withErrorBoundary(() => {
  const newChat = useNewChatMutation();
  const { data: providers } = useModels();

  const options = useMemo(() => {
    return providers.flatMap(p => p.models.map(m => {
      return {
        providerId: p.provider.id,
        modelId: m.id,
        name: `${p.provider.name} > ${m.name}`,
      };
    }));
  }, [providers]);

  const [lastUsedModel, setLastUsedModel] = useAtom(lastUsedModelAtom);
  const selectedModel = options.find(o => o.providerId === lastUsedModel?.providerId && o.modelId === lastUsedModel?.modelId) || options[0];

  // TODO: when redirecting to /chats/{id}, there is a flick of white screen (from Suspense) and also text area loses focus
  return (<ChatLayout
    onSend={(text) => {
      newChat.mutateAsync({
        providerId: selectedModel.providerId,
        modelId: selectedModel.modelId,
        text,
      }).then((res) => {
        navigate(`/chats/${res.id}`);
      })
    }}
  >
    <ChatLayout.Title>New chat</ChatLayout.Title>
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
  </ChatLayout>);
});

RootPage.displayName = 'RootPage'
