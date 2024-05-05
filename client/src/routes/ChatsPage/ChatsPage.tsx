import { useChats, useSearch } from '@client/api';
import styles from './ChatsPage.module.scss';
import { withErrorBoundary } from '@client/components/ErrorBoundary';
import { Card } from '@client/components/Card';
import { usePageTitle } from '@client/utils/hooks';
import { ChatCard } from '@client/components/ChatCard';
import { Suspense, useDeferredValue } from 'react';
import { Input } from '@client/components/Input';
import { MessageCard } from '@client/components/MessageCard';
import { useSearchParams } from '@client/components/Router/hooks';
import { Empty } from '@client/components/Empty';

const SearchResults = ({ query }: { query: string }) => {
  const search = useSearch(query);
  return <>
    {search.data.length === 0 && <Empty />}
    {search.data.map(r => {
      if (r.type === 'chat') {
        return (<ChatCard
          key={'chat' + r.id}
          chat={r}
        />);
      }
      return (<MessageCard key={'message' + r.id} message={r} />);
    })}
  </>
};

export const ChatsPage = withErrorBoundary(() => {
  const [params, setParams] = useSearchParams();
  const deferredSearchQuery = useDeferredValue(params.query ?? '');

  const { data: chats } = useChats();

  usePageTitle('All chats');

  return (<Card flexGrow>
    <div className={styles.ChatsPage}>
      <div className={styles.content}>
        <div className={styles.title}>All chats</div>
        <Input
          value={params.query ?? ''}
          onValueChange={(val) => setParams({ query: val })}
          className={styles.search}
          placeholder='Search...'
        />
        <Suspense>
          {!!params.query ? <SearchResults query={deferredSearchQuery} /> : <>
            {chats.length === 0 && <div>
              <Empty text='No chats yet' />
            </div>}
            {chats.map((chat) => {
              return (<ChatCard
                key={chat.id}
                chat={chat}
              />);
            })}
          </>}
        </Suspense>
      </div>
    </div>
  </Card>);
});

ChatsPage.displayName = 'ChatsPage';
