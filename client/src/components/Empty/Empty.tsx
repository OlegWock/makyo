import { HiOutlineInbox } from 'react-icons/hi2';
import styles from './Empty.module.scss';
import clsx from 'clsx';

export type EmptyProps = {
  className?: string;
  text?: string;
};

export const Empty = ({className, text}: EmptyProps) => {
  return (<div className={clsx(styles.Empty, className)}>
    <HiOutlineInbox />
    <div className={styles.text}>{text ?? 'No results here'}</div>
  </div>);
};
