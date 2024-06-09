import { Link } from '@client/components/Link';
import styles from './ChatCard.module.scss';
import { ChatSchemaType } from '@shared/api';
import { useMemo } from 'react';
import dayjs from 'dayjs';
import { DropdownMenu } from '@client/components/DropdownMenu';
import { Button } from '@client/components/Button';
import { HiOutlineStar, HiOutlineTrash, HiStar } from 'react-icons/hi2';
import { HiOutlineDotsVertical } from 'react-icons/hi';
import { useDeleteChatMutation, useEditChatMutation } from '@client/api';
import clsx from 'clsx';
import { Card } from '@client/components/Card';

export type ChatCardProps = {
  chat: ChatSchemaType,
};

export const ChatCard = ({ chat }: ChatCardProps) => {
  const date = useMemo(() => dayjs(chat.lastMessageAt).fromNow(), [chat.lastMessageAt]);
  const deleteChat = useDeleteChatMutation();
  const editChat = useEditChatMutation();

  return (<Card className={clsx(styles.ChatCard, deleteChat.isPending && styles.ghost)} withScrollArea={false}>
    <div className={styles.titleWrapper}>
      <Link variant='unstyled' href={`/chats/${chat.id}`} className={styles.title}>
        {chat.isStarred && '⭐️ '}
        {chat.title}
      </Link>
      <DropdownMenu
        menu={<>
          <DropdownMenu.Item
            type='normal'
            icon={chat.isStarred ? <HiOutlineStar /> : <HiStar />}
            onSelect={() => editChat.mutate({ chatId: chat.id, payload: { isStarred: !chat.isStarred } })}
          >
            {chat.isStarred ? 'Unstar' : 'Star'}
          </DropdownMenu.Item>
          <DropdownMenu.Item
            type='danger-with-confirmation'
            icon={<HiOutlineTrash />}
            onSelect={() => deleteChat.mutate(chat.id)}
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
  </Card>);
};
