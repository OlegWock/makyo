import { Hono } from "hono";
import { anthropicProvider } from "@server/providers/anthropic";
import { ollamaProvider } from "@server/providers/ollama/ollama";
import { openaiProvider } from "@server/providers/openai";

export const configurationRouter = new Hono()
  .get('/api/configuration', async (c) => {
    return c.json({
      openai: {
        enabled: await openaiProvider.isEnabled()
      },
      anthropic: {
        enabled: await anthropicProvider.isEnabled()
      },
      ollama: {
        enabled: await ollamaProvider.isEnabled()
      },
    });
  });


