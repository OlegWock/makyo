import { ApiType } from '@shared/api';
import { hc } from 'hono/client';

console.log('API host', import.meta.env.VITE_KATUKO_API_HOST);

export const createApiClient = (apiKey: string) => {
  return hc<ApiType>(import.meta.env.VITE_KATUKO_API_HOST || 'http://localhost:8440/', {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
    }
  }).api;
};
