import Markdown from 'markdown-to-jsx';
import SyncLoader from "react-spinners/SyncLoader";
import { MessageSchemaType } from "@shared/api";
import styles from './MessageBubble.module.scss';
import clsx from 'clsx';
import { CodeBlock } from '@client/components/MessageBubble/CodeBlock';
import { Button } from '@client/components/Button';

export type MessageBubbleProps = {
  message: MessageSchemaType;
  senderName: string;
  totalVariants: number;
  currentVariantIndex: number;
  onSwitchVariant: (forward: boolean) => void;
  onRegenerate?: VoidFunction;
}

export const MessageBubble = ({ message, senderName, onRegenerate, onSwitchVariant, currentVariantIndex, totalVariants }: MessageBubbleProps) => {
  const showPlaceholder = message.isGenerating && !message.text;

  // TODO: markdown-to-jsx doesn't have option to preserve line breaks, need to either hack something or replace it with another library

  return (<div className={clsx(styles.MessageBubble, styles[message.sender])}>
    <div className={styles.senderName}>{senderName}</div>
    {showPlaceholder
      ? (<SyncLoader loading className={styles.loader} color='var(--gray-4)' size={'0.5rem'} />)
      : <>
        <Markdown
          className={styles.content}
          options={{
            overrides: {
              code: CodeBlock,
            }
          }}
        >
          {message.text}
        </Markdown>
        <div style={{ display: 'flex', gap: '1rem' }}>
          {!!onRegenerate && <Button onClick={onRegenerate} variant="text">Regenerate</Button>}
          {totalVariants > 1 && <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button variant="text" onClick={() => onSwitchVariant(false)}>Prev</Button>
            <span>{currentVariantIndex}/{totalVariants}</span>
            <Button variant="text" onClick={() => onSwitchVariant(true)}>Next</Button>
          </div>}
        </div>
      </>}
    {/* TODO: show datetime of the message */}
  </div>)
};
