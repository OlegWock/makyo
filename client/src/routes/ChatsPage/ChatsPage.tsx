import { useChats, useSearch } from '@client/api';
import styles from './ChatsPage.module.scss';
import { withErrorBoundary } from '@client/components/ErrorBoundary';
import { Card } from '@client/components/Card';
import { usePageTitle } from '@client/utils/hooks';
import { ChatCard } from '@client/components/ChatCard';
import { RefObject, Suspense, useDeferredValue, useMemo, useRef } from 'react';
import { Input } from '@client/components/Input';
import { MessageCard } from '@client/components/MessageCard';
import { useSearchParams } from '@client/components/Router/hooks';
import { Empty } from '@client/components/Empty';
import { Virtuoso, ListProps } from 'react-virtuoso'
import { ChatSchemaType, MessageSearchResultSchemaType, SearchResultSchemaType } from '@shared/api';
import clsx from 'clsx';


const VirtuosoList = (props: ListProps) => {
  return (<div className={clsx(styles.searchResultsList)} {...props} />)
}

const VirtualizedResults = ({ items }: { items: (SearchResultSchemaType | ChatSchemaType)[] }) => {
  if (items.length === 0) return <Empty />;

  return (<Virtuoso
    className={styles.searchResultsWrapper}
    totalCount={items.length}
    components={{ List: VirtuosoList }}
    itemContent={index => {
      const r = items[index];
      const type = 'type' in r ? r.type : 'chat';
      return type === 'chat'
        ? <ChatCard key={type + r.id} chat={r as ChatSchemaType} />
        : <MessageCard key={type + r.id} message={r as MessageSearchResultSchemaType} />;
    }}
  />);
};

const SearchResults = ({ query }: { query: string }) => {
  const search = useSearch(query);
  return (<VirtualizedResults items={search.data} />);
};

export const ChatsPage = withErrorBoundary(() => {
  const [params, setParams] = useSearchParams();
  const deferredSearchQuery = useDeferredValue(params.query ?? '');

  const { data: chats } = useChats();
  const sortedChats = useMemo(() => chats.sort((a, b) => {
    if (a.isStarred === b.isStarred) return b.lastMessageAt - a.lastMessageAt;
    if (a.isStarred) return -1;
    return 1;
  }), [chats]);

  usePageTitle('All chats');

  return (<Card flexGrow withScrollArea={false}>
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
          {!!params.query
            ? <SearchResults query={deferredSearchQuery} />
            : <VirtualizedResults items={sortedChats} />
          }
        </Suspense>
      </div>
    </div>
  </Card>);
});

ChatsPage.displayName = 'ChatsPage';
