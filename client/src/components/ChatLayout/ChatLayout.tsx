import { Textarea } from '@client/components/Input';
import { Button } from '@client/components/Button';
import { HiOutlinePaperAirplane } from 'react-icons/hi2';
import styles from './ChatLayout.module.scss';
import { KeyboardEvent, ReactNode, Ref, useImperativeHandle, useState } from 'react';
import { createComponentWithSlotsFactory, SlotsPropsFromFactory } from '@client/components/slots';
import { useIsMobile } from '@client/utils/responsive';
import { WithSnippets } from '@client/components/WithSnippets';

const componentFactory = createComponentWithSlotsFactory({
  'MessagesArea': { required: false },
  'Title': { required: false },
  'TitleRightActions': { required: false },
  'TitleLeftActions': { required: false },
  'TextareaActions': { required: false },
});

export type ChatLayoutImperativeHandle = {
  setText: (val: string) => void,
};

export type ChatLayoutProps = {
  children?: ReactNode
  onSend?: (text: string) => void | Promise<boolean>;
  inputRef?: Ref<HTMLTextAreaElement>,
  imperativeHandle?: Ref<ChatLayoutImperativeHandle>,
};

type ChatLayoutPropsWithSlots = ChatLayoutProps & SlotsPropsFromFactory<typeof componentFactory>;

export const ChatLayout = componentFactory('ChatLayout', ({ onSend, inputRef, slots, imperativeHandle }: ChatLayoutPropsWithSlots) => {
  const onKeyDown = async (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const result = await onSend?.(text);
      if (result !== false) {
        setText('');
      }
      return;
    }
  };

  const [text, setText] = useState('');
  const isMobile = useIsMobile();

  useImperativeHandle(imperativeHandle, () => ({
    setText,
  }));

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
          <WithSnippets>
            <Textarea
              className={styles.textarea}
              autoFocus={!isMobile}
              minRows={1}
              maxRows={20}
              value={text}
              placeholder='Enter your message...'
              onKeyDown={onKeyDown}
              onValueChange={setText}
              ref={inputRef}
            />
          </WithSnippets>
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
            disabled={text.length === 0}
            children={isMobile ? undefined : 'Send'}
          />
        </div>
      </div>



    </div>
  </div>);
});
