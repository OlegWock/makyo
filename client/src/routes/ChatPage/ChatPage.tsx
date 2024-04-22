import { ChatLayout } from '@client/components/ChatLayout';
import styles from './ChatPage.module.scss';
import { useStrictRouteParams } from '@client/utils/routing';
import { z } from 'zod';
import { useChat, useChatMessagesMutation } from '@client/api';

export const ChatPage = () => {
  const { id } = useStrictRouteParams({ id: z.coerce.number() });
  const { data } = useChat(id);
  const sendMessage = useChatMessagesMutation(id);

  return (<ChatLayout
    onSend={(text) => {
      sendMessage.mutate({
        text,
        parentId: data.messages.at(-1)!.id,
      })
    }}
  >
    <pre>{JSON.stringify(data, null, 4)}</pre>
  </ChatLayout>);
};
