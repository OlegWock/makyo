import { QueryClient } from '@tanstack/react-query';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { broadcastQueryClient } from '@tanstack/query-broadcast-client-experimental';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { ReactNode, useState } from 'react';


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      retryDelay: 0.2,
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
    }
  }
});

broadcastQueryClient({
  queryClient,
  broadcastChannel: 'katuko-react-query',
});

const queryPersister = createSyncStoragePersister({
  storage: window.localStorage,
});

export const QueryClientProvider = ({ children }: { children?: ReactNode }) => {
  const [showContent, setShowContent] = useState(false);
  return (<PersistQueryClientProvider
    client={queryClient}
    persistOptions={{ persister: queryPersister }}
    onSuccess={() => {
      setShowContent(true);
      console.log("Restored queries cache");
    }}
  >
    {showContent && children}
  </PersistQueryClientProvider>);
};
