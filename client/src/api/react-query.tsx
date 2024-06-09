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
  broadcastChannel: 'makyo-react-query',
});

const queryPersister = createSyncStoragePersister({
  storage: window.localStorage,
});

export const QueryClientProvider = ({ children }: { children?: ReactNode }) => {
  const [showContent, setShowContent] = useState(false);

  // TODO: maybe remote persistence at all, if we got broken data once (e.g. due to error in mutation)
  // it's a lot harder to get app backworking when those data is persisted
  return (<PersistQueryClientProvider
    client={queryClient}
    persistOptions={{ persister: queryPersister, buster: import.meta.env.VITE_MAKYO_BUILDID }}
    onSuccess={() => {
      setShowContent(true);
      console.log("Restored queries cache");
    }}
  >
    {showContent && children}
  </PersistQueryClientProvider>);
};
