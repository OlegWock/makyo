import { atomWithStorage } from 'jotai/utils';

export const lastUsedModelAtom = atomWithStorage<{ providerId: string, modelId: string } | null>('lastUsedModel', null, undefined, { getOnInit: true });
