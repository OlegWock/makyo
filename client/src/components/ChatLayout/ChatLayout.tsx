import { Textarea } from '@client/components/Input';
import { Button } from '@client/components/Button';
import { HiOutlinePaperAirplane } from 'react-icons/hi2';
import styles from './ChatLayout.module.scss';
import { ReactNode, useState } from 'react';

export type ChatLayoutProps = {
  children?: ReactNode
  onSend?: (text: string) => void;
};

export const ChatLayout = ({ children, onSend }: ChatLayoutProps) => {
  const [text, setText] = useState('');
  return (<div className={styles.ChatLayout}>
    <div className={styles.chat}>
      {children}
      <div className={styles.scollAnchor} />
    </div>
    <div className={styles.messageArea}>
      <Textarea className={styles.textarea} rows={4} value={text} onValueChange={setText} />
      <div className={styles.messageActions}>
        <Button
          icon={<HiOutlinePaperAirplane />}
          iconPosition='after'
          onClick={() => {
            onSend?.(text);
            setText('');
          }}
        >
          Send
        </Button>
      </div>
    </div>
  </div>);
};
