import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { broadcastQueryClient } from '@tanstack/query-broadcast-client-experimental';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { ReactNode, useState } from 'react';
import toast from 'react-hot-toast';


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      retryDelay: 0.2,
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
    }
  },
  queryCache: new QueryCache({
    onError: (error) => toast.error(`Something went wrong: ${error.message}`),
  }),
  mutationCache: new MutationCache({
    onError: (error) => toast.error(`Something went wrong: ${error.message}`),
  }),
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
