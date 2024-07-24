import { Hono } from "hono";
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { ollamaProvider } from "@server/providers/ollama/ollama";

export const ollamaRouter = new Hono()
  .get('/api/providers/ollama/models', async (c) => {
    const models = await ollamaProvider.getModelsWithDetails();

    return c.json(
      models.map(m => ({
        id: m.name,
        name: m.name,
        size: m.size,
      }))
    );
  })
  .delete(
    '/api/providers/ollama/models/:modelId',
    zValidator('param', z.object({modelId: z.string()})),
    async (c) => {
      const { modelId } = c.req.valid('param');

      await ollamaProvider.deleteModel(modelId);
      const models = await ollamaProvider.getModelsWithDetails();

      return c.json(
        models.map(m => ({
          id: m.name,
          name: m.name,
          size: m.size,
        }))
      );
    });
