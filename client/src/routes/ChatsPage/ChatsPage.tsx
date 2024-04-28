import { useChats } from '@client/api';
import styles from './ChatsPage.module.scss';
import { Link } from '@client/components/Link';
import { withErrorBoundary } from '@client/components/ErrorBoundary';
import { Card } from '@client/components/Card';
import { usePageTitle } from '@client/utils/hooks';

export const ChatsPage = withErrorBoundary(() => {
  const { data: chats } = useChats();

  usePageTitle('All chats');
  
  return (<Card flexGrow>
    <div className={styles.ChatsPage}>
      {chats.map((chat) => {
        return (<div key={chat.id.toString()}><Link href={`/chats/${chat.id}`}>{chat.title}</Link></div>);
      })}
    </div>
  </Card>);
});

ChatsPage.displayName = 'ChatsPage';
