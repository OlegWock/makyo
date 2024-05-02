import SyncLoader from "react-spinners/SyncLoader";
import { MessageSchemaType } from "@shared/api";
import styles from './MessageBubble.module.scss';
import clsx from 'clsx';
import { CodeBlock } from '@client/components/MessageBubble/CodeBlock';
import { Button } from '@client/components/Button';
import { HiArrowPath, HiChevronLeft, HiChevronRight, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi2';
import { PiArrowsSplit, PiCopyLight } from "react-icons/pi";
import { createStrictContext } from '@client/utils/context';
import { ReactNode, RefObject, useRef, useState } from 'react';
import { iife } from '@shared/utils';
import { Textarea } from '@client/components/Input';
import { LocalToastTarget, useLocalToast } from 'react-local-toast';
import { Tooltip } from '@client/components/Tooltip';
import ReactMarkdown from 'react-markdown';
import { rehypePlugins, remarkPlugins } from '@client/components/MessageBubble/markdown';


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
  ref: RefObject<HTMLDivElement>,
}>('MessageBubbleContext');

const MessageBubbleActions = () => {
  const onCopy = async () => {
    const isFirefox = navigator.userAgent.includes('Firefox');
    if (isFirefox) {
      // Firefox doesn't fully supports clipboard api
      await navigator.clipboard.writeText(message.text)
    } else {
      const payload: Record<string, Blob> = {
        "text/plain": new Blob([message.text], { type: "text/plain" }),
      };
      if (ref.current) {
        payload['text/html'] = new Blob([ref.current.innerHTML], { type: "text/html" });
      }
      const data = new ClipboardItem(payload);
      await navigator.clipboard.write([data]);
    }
    showToast(`copy-${message.id}`, 'Copied!', { placement: 'bottom' });
  };

  const { actions = {}, message, initiateEditing, ref } = useBubbleContext();
  const { variants, editing, onRegenerate, onDuplicate, onDelete } = actions;
  const { showToast } = useLocalToast();

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
        <LocalToastTarget name={`copy-${message.id}`}>
          <Tooltip text='Copy message' side='bottom'>
            <Button onClick={onCopy} variant="borderless"><PiCopyLight /></Button>
          </Tooltip>
        </LocalToastTarget>
        {!!onRegenerate && <Tooltip
          side='bottom'
          text='Regenerate response'
        >
          <Button onClick={onRegenerate} variant="borderless"><HiArrowPath /></Button>
        </Tooltip>}
        {!!onDuplicate && <Tooltip
          side='bottom'
          text='Duplicate message'
        >
          <Button onClick={onDuplicate} variant="borderless"><PiArrowsSplit /></Button>
        </Tooltip>}
        {!!editing && <Tooltip
          side='bottom'
          text='Edit message'
        >
          <Button onClick={initiateEditing} variant="borderless"><HiOutlinePencil /></Button>
        </Tooltip>}
        {/* TODO: maybe require some kind of confirmation? Local toast with button? */}
        {!!onDelete && <Tooltip
          side='bottom'
          text='Delete message and its descendants'
        >
          <Button onClick={onDelete} variant="borderless"><HiOutlineTrash /></Button>
        </Tooltip>}
      </div>
    </div>)
}

export const MessageBubble = (props: MessageBubbleProps) => {
  const { message, senderName, actions } = props;
  const [isEditing, setIsEditing] = useState(false);
  const [messageDraft, setMessageDraft] = useState(() => message.text);
  const showPlaceholder = message.isGenerating && !message.text;
  const ref = useRef<HTMLDivElement>(null);

  return (
    <Provider value={{
      ...props,
      ref,
      initiateEditing: () => {
        setMessageDraft(message.text);
        setIsEditing(true);
      },
    }}>
      <div className={clsx(styles.MessageBubble, styles[message.sender])}>
        <div className={styles.senderName}>{senderName}</div>
        {iife(() => {
          if (showPlaceholder) {
            return (<SyncLoader loading className={styles.loader} color='var(--gray-4)' size='0.5rem' />);
          }

          if (isEditing && !!actions?.editing) {
            const { onEdit } = actions.editing;
            return (<>
              <Textarea
                className={styles.textarea}
                value={messageDraft}
                onValueChange={setMessageDraft}
                minRows={3}
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
            <div
              ref={ref}
              className={styles.content}
            >
              <ReactMarkdown
                remarkPlugins={remarkPlugins}
                rehypePlugins={rehypePlugins}
                children={message.text}
                components={{
                  code: CodeBlock,
                }}
              />
            </div>
            <MessageBubbleActions />
          </>);
        })}
      </div>
    </Provider>)
};
