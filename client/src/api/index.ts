
import { QueryClient } from '@tanstack/react-query';


// TODO: cache queries in local storage?
export const queryClient = new QueryClient();

export * from './client';
export * from './context';
export * from './queries';
