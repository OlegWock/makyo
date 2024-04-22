import { anthropicProvider } from "@server/providers/anthropic";
import { ollamaProvider } from "@server/providers/ollama";
import { openaiProvider } from "@server/providers/openai";
import { Provider } from "@server/providers/provider";

export const allProviders = [
  ollamaProvider,
  openaiProvider,
  anthropicProvider,
];

const allProvidersById = Object.fromEntries(allProviders.map(p => [p.id, p]));

export const getProviderById = (id: string): Provider => {
  const provider = allProvidersById[id];
  if (!id) {
    throw new Error('Unknown provider');
  }
  return provider;
}
