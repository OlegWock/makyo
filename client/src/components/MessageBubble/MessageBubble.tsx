import Markdown from 'markdown-to-jsx';
import SyncLoader from "react-spinners/SyncLoader";
import { MessageSchemaType } from "@shared/api";
import styles from './MessageBubble.module.scss';
import clsx from 'clsx';
import { CodeBlock } from '@client/components/MessageBubble/CodeBlock';
import { Button } from '@client/components/Button';
import { HiArrowPath, HiChevronLeft, HiChevronRight } from 'react-icons/hi2';
import { PiArrowsSplit, PiCopy, PiCopyLight } from "react-icons/pi";
import { createStrictContext } from '@client/utils/context';


export type MessageBubbleActionsProp = {
  variants?: {
    total: number;
    current: number;
    onSwitchVariant: (forward: boolean) => void;
  },
  onRegenerate?: VoidFunction;
  onDuplicate?: VoidFunction;
};

export type MessageBubbleProps = {
  message: MessageSchemaType;
  senderName: string;
  actions?: MessageBubbleActionsProp;
}

const [Provider, useBubbleContext] = createStrictContext<MessageBubbleProps>('MessageBubbleContext');

const MessageBubbleActions = () => {
  const onCopy = () => {
    // TODO: show feedback on copy
    // TODO: consider copying rich text along with plaintext (so when pasted in Google Docs for example, it will preserve formatting)
    navigator.clipboard.writeText(message.text);
  };

  const { actions = {}, message } = useBubbleContext();
  const { variants, onRegenerate, onDuplicate } = actions;
  return (
    <div className={styles.actionsWrapper}>
      {!!variants && <div className={styles.variants}>
        <Button
          variant="borderless"
          disabled={variants.current === 1}
          onClick={() => variants.onSwitchVariant(false)}
        >
          <HiChevronLeft />
        </Button>
        <span>{variants.current}/{variants.total}</span>
        <Button
          variant="borderless"
          disabled={variants.current === variants.total}
          onClick={() => variants.onSwitchVariant(true)}
        >
          <HiChevronRight />
        </Button>
      </div>}
      <div className={styles.spacer} />
      <div className={styles.actions}>
        {!!onRegenerate && <Button onClick={onRegenerate} variant="borderless"><HiArrowPath /></Button>}
        {!!onDuplicate && <Button onClick={onDuplicate} variant="borderless"><PiArrowsSplit /></Button>}
        <Button onClick={onCopy} variant="borderless"><PiCopyLight /></Button>
      </div>
    </div>)
}

export const MessageBubble = (props: MessageBubbleProps) => {
  const { message, senderName, actions } = props;
  const showPlaceholder = message.isGenerating && !message.text;

  // TODO: what actions we need to support:
  // * Regenerating response (ai only)
  // * Editing message without regenerating (ai and user)
  // * Editing message with regeneration (only user)
  // * Duplicating response (ai only)

  // TODO: copy message button

  // TODO: markdown-to-jsx doesn't have option to preserve line breaks, need to either hack something or replace it with another library

  return (
    <Provider value={{ ...props }}>
      <div className={clsx(styles.MessageBubble, styles[message.sender])}>
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
            <MessageBubbleActions />
          </>}
        {/* TODO: show datetime of the message */}
      </div>
    </Provider>)
};
