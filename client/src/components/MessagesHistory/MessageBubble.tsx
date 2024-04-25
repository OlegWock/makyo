import Markdown from 'markdown-to-jsx';
import SyncLoader from "react-spinners/SyncLoader";
import { MessageSchemaType } from "@shared/api";
import styles from './MessagesHistory.module.scss';
import clsx from 'clsx';
import { CodeBlock } from '@client/components/MessagesHistory/CodeBlock';

export type MessageBubbleProps = {
  message: MessageSchemaType;
  senderName: string;
}

export const MessageBubble = ({ message, senderName }: MessageBubbleProps) => {
  const showPlaceholder = message.isGenerating && !message.text;
  return (<div className={clsx(styles.MessageBubble, styles[message.sender])}>
    <div className={styles.senderName}>{senderName}</div>
    {showPlaceholder
      ? (<SyncLoader loading className={styles.loader} color='var(--gray-4)' size={'0.5rem'} />)
      : <Markdown
        className={styles.content}
        options={{
          overrides: {
            code: CodeBlock,
          }
        }}
      >
        {message.text}
      </Markdown>}
    {/* TODO: show datetime of the message */}
  </div>)
};
