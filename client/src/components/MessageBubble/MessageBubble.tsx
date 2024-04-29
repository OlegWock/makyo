import Markdown from 'markdown-to-jsx';
import SyncLoader from "react-spinners/SyncLoader";
import { MessageSchemaType } from "@shared/api";
import styles from './MessageBubble.module.scss';
import clsx from 'clsx';
import { CodeBlock } from '@client/components/MessageBubble/CodeBlock';
import { Button } from '@client/components/Button';
import { HiArrowPath, HiChevronLeft, HiChevronRight, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi2';
import { PiArrowsSplit, PiCopyLight } from "react-icons/pi";
import { createStrictContext } from '@client/utils/context';
import { ReactNode, useState } from 'react';
import { iife } from '@shared/utils';
import { Textarea } from '@client/components/Input';


export type MessageBubbleActionsProp = {
  variants?: {
    total: number;
    current: number;
    onSwitchVariant: (forward: boolean) => void;
  },
  editing?: {
    allowRegenerateResponse: boolean;
    onEdit: (newText: string, regenerateResponse: boolean) => void;
  },
  onRegenerate?: VoidFunction;
  onDuplicate?: VoidFunction;
  onDelete?: VoidFunction;
};

export type MessageBubbleProps = {
  message: MessageSchemaType;
  senderName: ReactNode;
  actions?: MessageBubbleActionsProp;
}

const [Provider, useBubbleContext] = createStrictContext<MessageBubbleProps & {
  initiateEditing: VoidFunction,
}>('MessageBubbleContext');

const MessageBubbleActions = () => {
  const onCopy = () => {
    // TODO: show feedback on copy
    // TODO: consider copying rich text along with plaintext (so when pasted in Google Docs for example, it will preserve formatting)
    navigator.clipboard.writeText(message.text);
  };

  const { actions = {}, message, initiateEditing } = useBubbleContext();
  const { variants, editing, onRegenerate, onDuplicate, onDelete } = actions;


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
        {/* TODO: show tooltip for each action */}
        <Button onClick={onCopy} variant="borderless"><PiCopyLight /></Button>
        {!!onRegenerate && <Button onClick={onRegenerate} variant="borderless"><HiArrowPath /></Button>}
        {!!onDuplicate && <Button onClick={onDuplicate} variant="borderless"><PiArrowsSplit /></Button>}
        {!!editing && <Button onClick={initiateEditing} variant="borderless"><HiOutlinePencil /></Button>}
        {/* TODO: maybe require some kind of confirmation? */}
        {!!onDelete && <Button onClick={onDelete} variant="borderless"><HiOutlineTrash /></Button>}
      </div>
    </div>)
}

export const MessageBubble = (props: MessageBubbleProps) => {
  const { message, senderName, actions } = props;
  const [isEditing, setIsEditing] = useState(false);
  const [messageDraft, setMessageDraft] = useState(() => message.text);
  const showPlaceholder = message.isGenerating && !message.text;

  // TODO: markdown-to-jsx doesn't have option to preserve line breaks, need to either hack something or replace it with another library

  return (
    <Provider value={{
      ...props,
      initiateEditing: () => {
        setMessageDraft(message.text);
        setIsEditing(true);
      },
    }}>
      <div className={clsx(styles.MessageBubble, styles[message.sender])}>
        <div className={styles.senderName}>{senderName}</div>
        {iife(() => {
          if (showPlaceholder) {
            return (<SyncLoader loading className={styles.loader} color='var(--gray-4)' size={'0.5rem'} />);
          }

          if (isEditing && !!actions?.editing) {
            const { onEdit } = actions.editing;
            return (<>
              <Textarea
                className={styles.textarea}
                value={messageDraft}
                onValueChange={setMessageDraft}
                rows={10}
              />
              <div className={styles.editingActions}>
                <Button
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
                {actions.editing.allowRegenerateResponse && <Button
                  variant="primary"
                  onClick={() => {
                    onEdit(messageDraft, true);
                    setIsEditing(false);
                  }}
                >
                  Save and submit
                </Button>}
                <Button
                  variant="primary"
                  onClick={() => {
                    onEdit(messageDraft, false);
                    setIsEditing(false);
                  }}
                >
                  Save
                </Button>
              </div>
            </>);
          }

          return (<>
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
          </>);
        })}
        {/* TODO: show datetime of the message */}
      </div>
    </Provider>)
};
