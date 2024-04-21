import { Textarea } from '@client/components/Input';
import styles from './RootPage.module.scss';
import { Button } from '@client/components/Button';
import { HiOutlinePaperAirplane } from 'react-icons/hi2';

export const RootPage = () => {
  return (<div className={styles.RootPage}>
    <div className={styles.chat}></div>
    <div className={styles.messageArea}>
      <Textarea className={styles.textarea} rows={4} />
      <div className={styles.messageActions}>
        <Button icon={<HiOutlinePaperAirplane />} iconPosition='after'>Send</Button>
      </div>
    </div>
  </div>);
};
