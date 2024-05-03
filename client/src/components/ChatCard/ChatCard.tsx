import { Link } from '@client/components/Link';
import styles from './ChatCard.module.scss';
import { ChatSchemaType } from '@shared/api';
import { useMemo } from 'react';
import dayjs from 'dayjs';
import { DropdownMenu } from '@client/components/DropdownMenu';
import { Button } from '@client/components/Button';
import { HiOutlineTrash } from 'react-icons/hi2';
import { HiOutlineDotsVertical } from 'react-icons/hi';
import { useDeleteChatMutation } from '@client/api';
import clsx from 'clsx';

export type ChatCardProps = {
  chat: ChatSchemaType,
};

export const ChatCard = ({ chat }: ChatCardProps) => {
  const date = useMemo(() => dayjs(chat.lastMessageAt).fromNow(), [chat.lastMessageAt]);
  const deleteChat = useDeleteChatMutation(chat.id);

  return (<div className={clsx(styles.ChatCard, deleteChat.isPending && styles.ghost)}>
    <div className={styles.titleWrapper}>
      <Link variant='unstyled' href={`/chats/${chat.id}`} className={styles.title}>{chat.title}</Link>
      <DropdownMenu
        menu={<>
          <DropdownMenu.Item
            type='danger-with-confirmation'
            icon={<HiOutlineTrash />}
            onSelect={() => deleteChat.mutate()}
          >
            Delete
          </DropdownMenu.Item>
        </>}
      >
        <Button className={styles.menuButton} size='small' variant='borderless' icon={<HiOutlineDotsVertical />} />
      </DropdownMenu>
    </div>

    <div className={styles.message}>{chat.lastMessageText || '\xa0'}</div>
    <div className={styles.datetime}>{date}</div>
  </div>);
};
