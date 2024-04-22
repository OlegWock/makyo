
import { navigate } from 'wouter/use-browser-location';
import { ChatLayout } from '@client/components/ChatLayout';
import styles from './RootPage.module.scss';
import { useNewChatMutation } from '@client/api';

export const RootPage = () => {
  const newChat = useNewChatMutation();

  return (<ChatLayout
    onSend={(text) => {
      newChat.mutateAsync({
        // TODO: proper select for models
        providerId: 'ollama',
        modelId: 'llama3:latest',
        text,
      }).then((res) => {
        navigate(`/chats/${res.id}`);
      })
    }}
  />);
};
