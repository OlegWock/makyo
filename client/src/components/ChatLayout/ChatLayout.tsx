import { Textarea } from '@client/components/Input';
import { Button } from '@client/components/Button';
import { HiOutlinePaperAirplane } from 'react-icons/hi2';
import styles from './ChatLayout.module.scss';
import { ReactNode, useState } from 'react';
import { createComponentWithSlotsFactory, SlotsPropsFromFactory } from '@client/components/slots';

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
  const [text, setText] = useState('');
  return (<div className={styles.ChatLayout}>
    {!!slots.Title && <div className={styles.header}>
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

          <Textarea
            className={styles.textarea}
            autoFocus
            minRows={1}
            maxRows={20}
            value={text}
            placeholder='Enter your message...'
            onValueChange={setText}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                onSend?.(text);
                setText('');
              }
            }}
          />
          <Button
            icon={<HiOutlinePaperAirplane />}
            iconPosition='after'
            size='large'
            variant='primary'
            onClick={() => {
              onSend?.(text);
              setText('');
            }}
          >
            Send
          </Button>
        </div>
      </div>



    </div>
  </div>);
});
