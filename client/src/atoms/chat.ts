import { atomWithStorage } from 'jotai/utils';

export const lastUsedModelAtom = atomWithStorage<{ providerId: string, modelId: string } | null>('lastUsedModel', null, undefined, { getOnInit: true });
export const lastInteractedMessageAtom = atomWithStorage<Record<number, string | undefined>>('lastInteractedMessage', {}, undefined, { getOnInit: true });
