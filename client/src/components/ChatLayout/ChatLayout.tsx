import { Textarea } from '@client/components/Input';
import { Button } from '@client/components/Button';
import { HiOutlinePaperAirplane } from 'react-icons/hi2';
import styles from './ChatLayout.module.scss';
import { ChangeEventHandler, KeyboardEvent, ReactNode, useState } from 'react';
import { createComponentWithSlotsFactory, SlotsPropsFromFactory } from '@client/components/slots';
import { useIsMobile } from '@client/utils/responsive';
import { useSnippets } from '@client/api';

const componentFactory = createComponentWithSlotsFactory({
  'MessagesArea': { required: false },
  'Title': { required: false },
  'TitleRightActions': { required: false },
  'TitleLeftActions': { required: false },
  'TextareaActions': { required: false },
});

export type ChatLayoutProps = {
  children?: ReactNode
  onSend?: (text: string) => void;
};

type ChatLayoutPropsWithSlots = ChatLayoutProps & SlotsPropsFromFactory<typeof componentFactory>;

export const ChatLayout = componentFactory('ChatLayout', ({ onSend, slots }: ChatLayoutPropsWithSlots) => {
  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend?.(text);
      setText('');
      return;
    }
  };

  const onChange: ChangeEventHandler<HTMLTextAreaElement> = (e) => {
    const target = e.target as HTMLTextAreaElement;
    const textBeforeCursor = target.value.slice(0, target.selectionStart);
    for (const snippet of snippets) {
      if (textBeforeCursor.endsWith(snippet.shortcut)) {
        console.log('Matched snippet shortcut!', snippet);
        const unfoldedText = 
          textBeforeCursor.slice(0, textBeforeCursor.length - snippet.shortcut.length) 
          + snippet.text
          + target.value.slice(target.selectionStart);
        console.log('Unfolded text', unfoldedText);
        setText(unfoldedText);
        e.preventDefault();
        return;
      }
    }

    setText(target.value);
  };

  const { data: snippets } = useSnippets();
  const [text, setText] = useState('');
  const isMobile = useIsMobile();

  return (<div className={styles.ChatLayout}>
    {!!(slots.Title || slots.TitleLeftActions || slots.TitleRightActions) && <div className={styles.header}>
      <div className={styles.leftActions}>
        {slots.TitleLeftActions}
      </div>
      <div className={styles.title}>
        {slots.Title}
      </div>
      <div className={styles.rightActions}>
        {slots.TitleRightActions}
      </div>
    </div>}
    <div className={styles.chat}>
      {slots.MessagesArea}
    </div>

    {/* ---------------------------- */}

    <div className={styles.messageArea}>
      <div className={styles.contentWrapper}>
        {!!slots.TextareaActions && <div className={styles.secondaryActions}>
          {slots.TextareaActions}
        </div>}

        <div className={styles.textareaWrapper}>
          {/* TODO: show autocomplete for snippets that start with / or @ */}
          <Textarea
            className={styles.textarea}
            autoFocus={!isMobile}
            minRows={1}
            maxRows={20}
            value={text}
            placeholder='Enter your message...'
            onValueChange={setText}
            onKeyDown={onKeyDown}
            onChange={onChange}
          />
          <Button
            className={styles.sendButton}
            icon={<HiOutlinePaperAirplane />}
            iconPosition='after'
            size='large'
            variant='primary'
            onClick={() => {
              onSend?.(text);
              setText('');
            }}
            children={isMobile ? undefined : 'Send'}
          />
        </div>
      </div>



    </div>
  </div>);
});
