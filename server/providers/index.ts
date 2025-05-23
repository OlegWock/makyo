import { googleProvider } from "@server/providers/google";
import { anthropicProvider } from "./anthropic";
import { ollamaProvider } from "./ollama/ollama";
import { openaiProvider } from "./openai";
import { Provider } from "./provider";
import { HTTPException } from "hono/http-exception";

export type * from './provider'

export const allProviders = [
  ollamaProvider,
  openaiProvider,
  anthropicProvider,
  googleProvider,
];

const allProvidersById = Object.fromEntries(allProviders.map(p => [p.id, p]));

export const getProviderById = (id: string): Provider => {
  const provider = allProvidersById[id];
  if (!id) {
    throw new HTTPException(404, { message: 'Unknown provider'});
  }
  return provider;
}
