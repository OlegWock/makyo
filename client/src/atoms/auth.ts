import { atomWithStorage } from 'jotai/utils';

export const apiKeyAtom = atomWithStorage('apiKey', {
  apiKey: '',
  lastCheck: 0,
}, undefined, { getOnInit: true });
