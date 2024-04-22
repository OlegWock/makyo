import { useChats } from '@client/api';
import styles from './ChatsPage.module.scss';
import { Link } from '@client/components/Link';

export const ChatsPage = () => {
  const {data: chats} = useChats();
  return (<div className={styles.ChatsPage}>
    {chats.map((chat) => {
      return (<div key={chat.id.toString()}><Link href={`/chats/${chat.id}`}>{chat.title}</Link></div>);
    })}
  </div>);
};
