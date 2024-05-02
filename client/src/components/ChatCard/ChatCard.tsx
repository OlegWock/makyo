import { Link } from '@client/components/Link';
import styles from './ChatCard.module.scss';
import { ChatSchemaType } from '@shared/api';
import { useMemo } from 'react';
import dayjs from 'dayjs';

export type ChatCardProps = {
  chat: ChatSchemaType,
};

export const ChatCard = ({ chat }: ChatCardProps) => {
  const date = useMemo(() => dayjs(chat.lastMessageAt).fromNow(), [chat.lastMessageAt]);

  // TODO: three dots with dropdown menu with actions (rename, delete)
  return (<Link href={`/chats/${chat.id}`} className={styles.ChatCard}>
    <div className={styles.title}>{chat.title}</div>
    <div className={styles.message}>{chat.lastMessageText || '\xa0'}</div>
    <div className={styles.datetime}>{date}</div>
  </Link>);
};
