
import { QueryClient } from '@tanstack/react-query';


// TODO: cache queries in local storage?
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      retryDelay: 0.2,
    }
  }
});

export * from './client';
export * from './context';
export * from './queries';
