import SyncLoader from "react-spinners/SyncLoader";
import { KeyboardEvent } from 'react';
import { MessageSchemaType } from "@shared/api";
import styles from './MessageBubble.module.scss';
import clsx from 'clsx';
import { Button } from '@client/components/Button';
import { HiArrowPath, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi2';
import { PiArrowsSplit, PiCopyLight } from "react-icons/pi";
import { createStrictContext } from '@client/utils/context';
import { ReactNode, RefObject, useRef, useState } from 'react';
import { iife } from '@shared/utils';
import { Textarea } from '@client/components/Input';
import { Tooltip } from '@client/components/Tooltip';
import { Markdown } from '@client/components/Markdown';
import { ToastTarget, useLocalToast } from "@client/components/LocalToast";
import { WithSnippets } from "@client/components/WithSnippets";
import { SelectionMenu } from "@client/components/SelectionMenu";


export type MessageBubbleActionsProp = {
  copy?: boolean;
  editing?: {
    allowRegenerateResponse: boolean;
    onEdit: (newText: string, regenerateResponse: boolean) => void;
  },
  onRegenerate?: VoidFunction;
  onDuplicate?: VoidFunction;
  onDelete?: VoidFunction;
  onSend?: (message: string) => void;
};

export type MessageBubbleProps = {
  message: MessageSchemaType;
  senderName: ReactNode;
  actions?: MessageBubbleActionsProp;
}

const [Provider, useBubbleContext] = createStrictContext<MessageBubbleProps & {
  initiateEditing: VoidFunction,
  ref: RefObject<HTMLDivElement | null>,
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

    showToast(`copy-${message.id}`, 'success', 'Copied!', { placement: 'top' });
  };

  const { actions = {}, message, initiateEditing, ref } = useBubbleContext();
  const { editing, onRegenerate, onDuplicate, onDelete, copy = true } = actions;
  const { showToast, showConfirm } = useLocalToast();

  return (<div className={styles.actions}>
    {copy && <ToastTarget name={`copy-${message.id}`}>
        <Button onClick={onCopy} variant="borderless"><PiCopyLight /></Button>
    </ToastTarget>}
    {!!onRegenerate && <Tooltip
      side='top'
      text='Regenerate response'
    >
      <Button onClick={onRegenerate} variant="borderless"><HiArrowPath /></Button>
    </Tooltip>}
    {!!onDuplicate && <Tooltip
      side='top'
      text='Duplicate message'
    >
      <Button onClick={onDuplicate} variant="borderless"><PiArrowsSplit /></Button>
    </Tooltip>}
    {!!editing && <Tooltip
      side='top'
      text='Edit message'
    >
      <Button onClick={initiateEditing} variant="borderless"><HiOutlinePencil /></Button>
    </Tooltip>}
    {!!onDelete && <ToastTarget name={`delete-${message.id}`}><Tooltip
      side='top'
      text='Delete message'
    >
      <Button onClick={() => {
        showConfirm(`delete-${message.id}`, 'Please confirm you want to delete this message and all its descendants', {
          onConfirm: () => onDelete(),
          destructive: true,
          duration: 5000,
        });
      }} variant="borderless"><HiOutlineTrash /></Button>
    </Tooltip>
    </ToastTarget>}
  </div>);
}

export const MessageBubble = (props: MessageBubbleProps) => {
  const onSelectionAction = (text: string, send: boolean) => {
    if (send) props.actions?.onSend?.(text);
    else setReplyMessageDraft(text);
  };

  const onKeyDown = async (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (replyMessageDraft.length === 0) return;
      props.actions?.onSend?.(replyMessageDraft);
      setReplyMessageDraft('');
    }
  };

  const { message, senderName, actions } = props;
  const [isEditing, setIsEditing] = useState(false);
  const [editMessageDraft, setEditMessageDraft] = useState(() => message.text);
  const [replyMessageDraft, setReplyMessageDraft] = useState('');
  const showPlaceholder = message.isGenerating && !message.text;
  const ref = useRef<HTMLDivElement>(null);

  return (
    <Provider value={{
      ...props,
      ref,
      initiateEditing: () => {
        setEditMessageDraft(message.text);
        setIsEditing(true);
      },
    }}>
      <div className={clsx(styles.MessageBubble, styles[message.sender], "nodrag")} data-message-id={message.id} onMouseDownCapture={e => e.stopPropagation()}>
        <div className={styles.senderName}>{senderName}</div>
        {iife(() => {
          if (isEditing && !!actions?.editing) {
            const { onEdit } = actions.editing;
            return (<>
              <WithSnippets>
                <Textarea
                  className={styles.editTextarea}
                  value={editMessageDraft}
                  onValueChange={setEditMessageDraft}
                  minRows={3}
                />
              </WithSnippets>
              <div className={styles.editingActions}>
                <Button
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
                {actions.editing.allowRegenerateResponse && <Button
                  variant="primary"
                  onClick={() => {
                    onEdit(editMessageDraft, true);
                    setIsEditing(false);
                  }}
                >
                  Save and submit
                </Button>}
                <Button
                  variant="primary"
                  onClick={() => {
                    onEdit(editMessageDraft, false);
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
              {iife(() => {
                if (showPlaceholder) return <SyncLoader loading className={styles.loader} color='var(--gray-4)' size='0.5rem' />;
                if (message.error) return <div className={styles.errorAlert}>{message.error}</div>;
                return <Markdown content={message.text} />;
              })}
            </div>

            <div className={styles.footer}>
              {!!actions?.onSend && !message.error && <WithSnippets>
                <Textarea
                  className={styles.messageTextarea}
                  value={replyMessageDraft}
                  onValueChange={setReplyMessageDraft}
                  onKeyDown={onKeyDown}
                  minRows={1}
                  maxRows={40}
                  placeholder="Reply"
                  data-reply-textarea={message.id}
                />
              </WithSnippets>}
              <div className={styles.footerActions}>
                <MessageBubbleActions />
                {!!actions?.onSend && !message.error && <Button
                  variant="primary"
                  disabled={replyMessageDraft.length === 0}
                  onClick={() => {
                    actions.onSend?.(replyMessageDraft)
                    setReplyMessageDraft('');
                  }}
                >
                  Send
                </Button>}
              </div>
            </div>
            <SelectionMenu targetRef={ref} onClick={onSelectionAction} />
          </>);
        })}
      </div>
    </Provider>)
};
