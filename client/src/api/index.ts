import { ApiType } from '@shared/api';
import { hc } from 'hono/client';

export const createApiClient = (apiKey: string) => {
  return hc<ApiType>('http://localhost:8440/', {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
    }
  }).api;
}
