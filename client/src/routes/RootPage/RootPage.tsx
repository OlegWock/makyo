
import { navigate } from 'wouter/use-browser-location';
import { ChatLayout } from '@client/components/ChatLayout';
import styles from './RootPage.module.scss';
import { useModels, useNewChatMutation } from '@client/api';
import { useMemo, useState } from 'react';
import { Select } from '@client/components/Select';

export const RootPage = () => {
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

  const [selectedModel, setSelectedModel] = useState(options[0]);

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
    <div className={styles.modelSelect}>
      <div>
        <div>Select model:</div>
        <Select
          options={options}
          value={selectedModel}
          onChange={setSelectedModel}
          getOptionKey={o => o.providerId + o.modelId}
          getOptionLabel={o => o.name}
        />
      </div>
    </div>
  </ChatLayout>);
};
