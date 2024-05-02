import { useChats } from '@client/api';
import styles from './ChatsPage.module.scss';
import { withErrorBoundary } from '@client/components/ErrorBoundary';
import { Card } from '@client/components/Card';
import { usePageTitle } from '@client/utils/hooks';
import { ChatCard } from '@client/components/ChatCard';
import { ScrollArea } from '@client/components/ScrollArea';

export const ChatsPage = withErrorBoundary(() => {
  const { data: chats } = useChats();

  usePageTitle('All chats');

  return (<Card flexGrow>
    <div className={styles.ChatsPage}>
      <div className={styles.content}>
        {chats.map((chat) => {
          return (<ChatCard
            key={chat.id}
            chat={chat}
          />);
        })}
      </div>
    </div>
  </Card>);
});

ChatsPage.displayName = 'ChatsPage';
