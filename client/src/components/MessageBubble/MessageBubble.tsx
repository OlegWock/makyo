import Markdown from 'markdown-to-jsx';
import SyncLoader from "react-spinners/SyncLoader";
import { MessageSchemaType } from "@shared/api";
import styles from './MessageBubble.module.scss';
import clsx from 'clsx';
import { CodeBlock } from '@client/components/MessageBubble/CodeBlock';
import { Button } from '@client/components/Button';
import { HiArrowPath, HiChevronLeft, HiChevronRight } from 'react-icons/hi2';
import { PiArrowsSplit } from "react-icons/pi";


export type MessageBubbleActionsProp = {
  variants?: {
    total: number;
    current: number;
    onSwitchVariant: (forward: boolean) => void;
  },
  onRegenerate?: VoidFunction;
  onDuplicate?: VoidFunction;
};

const MessageBubbleActions = ({ variants, onRegenerate, onDuplicate }: MessageBubbleActionsProp) => {
  return (<div className={styles.actionsWrapper}>
    {!!variants && <div className={styles.variants}>
      <Button variant="borderless" onClick={() => variants.onSwitchVariant(false)}><HiChevronLeft /></Button>
      <span>{variants.current}/{variants.total}</span>
      <Button variant="borderless" onClick={() => variants.onSwitchVariant(true)}><HiChevronRight /></Button>
    </div>}
    <div className={styles.spacer} />
    <div className={styles.actions}>
      {!!onRegenerate && <Button onClick={onRegenerate} variant="borderless"><HiArrowPath /></Button>}
      {!!onDuplicate && <Button onClick={onDuplicate} variant="borderless"><PiArrowsSplit /></Button>}
    </div>
  </div>)
}

export type MessageBubbleProps = {
  message: MessageSchemaType;
  senderName: string;
  actions?: MessageBubbleActionsProp;
}

export const MessageBubble = ({ message, senderName, actions }: MessageBubbleProps) => {
  const showPlaceholder = message.isGenerating && !message.text;

  // TODO: what actions we need to support:
  // * Regenerating response (ai only)
  // * Editing message without regenerating (ai and user)
  // * Editing message with regeneration (only user)
  // * Duplicating response (ai only)

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
        {!!actions && <MessageBubbleActions {...actions} />}
      </>}
    {/* TODO: show datetime of the message */}
  </div>)
};
