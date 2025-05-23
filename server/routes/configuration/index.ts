import { Hono } from "hono";
import { anthropicProvider } from "@server/providers/anthropic";
import { ollamaProvider } from "@server/providers/ollama/ollama";
import { openaiProvider } from "@server/providers/openai";
import { googleProvider } from "@server/providers/google";

export const configurationRouter = new Hono()
  .get('/api/configuration', async (c) => {
    return c.json({
      openai: {
        enabled: await openaiProvider.isEnabled()
      },
      anthropic: {
        enabled: await anthropicProvider.isEnabled()
      },
      google: {
        enabled: await googleProvider.isEnabled()
      },
      ollama: {
        enabled: await ollamaProvider.isEnabled()
      },
    });
  });


