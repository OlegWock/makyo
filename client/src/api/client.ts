import { ApiType } from '@shared/api';
import { hc } from 'hono/client';

export const API_HOST = window.location.origin;
console.log('API host', API_HOST);

export const createApiClient = () => {
  return hc<ApiType>(API_HOST).api;
};

export const createHttpClient = () => {
  return hc<ApiType>(API_HOST);
};

export type ApiClient = ReturnType<typeof createApiClient>;
