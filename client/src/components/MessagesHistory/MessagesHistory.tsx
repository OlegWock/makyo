import { useMemo, useRef } from 'react';
import { MessageSchemaType } from '@shared/api';
import styles from './MessagesHistory.module.scss';
import { MessageBubble } from './MessageBubble';
import { useMount } from '@client/utils/hooks';

export type MessagesHistoryProps = {
  messages: MessageSchemaType[];
  modelName?: string;
};

export const MessagesHistory = ({ messages: messagesFromProps, modelName }: MessagesHistoryProps) => {
  const messages = useMemo(() => [...messagesFromProps].reverse(), [messagesFromProps]);

  const wrapperRef = useRef<HTMLDivElement>(null);

  useMount(() => {
    wrapperRef.current?.scrollTo({top: wrapperRef.current.scrollHeight});
  })

  return (<div className={styles.MessagesHistory} ref={wrapperRef}>
    <div className={styles.messagesWrapper}>
      {messages.map(m => {
        const sender = m.sender === 'user' ? 'User' : modelName ?? 'LLM';
        return (<MessageBubble senderName={sender} message={m} key={m.id} />);
      })}
    </div>
    {/* <pre>{JSON.stringify(messages, null, 4)}</pre> */}
  </div>);
};
