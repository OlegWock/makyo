import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { ollamaProvider } from "@server/providers/ollama/ollama";
import { OllamaModelResponseSchema } from "@server/schemas/ollama";


const getModels = createRoute({
  method: 'get',
  path: '/api/providers/ollama/models',
  summary: 'Get Ollama models',
  tags: ['Providers', 'Ollama'],
  security: [{ CookieAuth: [] }],
  responses: {
    200: {
      content: {
        'application/json': {
          schema: OllamaModelResponseSchema,
        },
      },
      description: 'Get Ollama models',
    },
  },
});

const removeModel = createRoute({
  method: 'delete',
  path: '/api/providers/ollama/models/{modelId}',
  summary: 'Delete Ollama model',
  tags: ['Providers', 'Ollama'],
  security: [{ CookieAuth: [] }],
  request: {
    params: z.object({
      modelId: z.string().openapi({
        param: {
          name: 'modelId',
          in: 'path',
        },
      }),
    }),
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: OllamaModelResponseSchema,
        },
      },
      description: 'Delete Ollama model',
    },
  },
});

export const ollamaRouter = new OpenAPIHono()
  .openapi(getModels, async (c) => {
    const models = await ollamaProvider.getModelsWithDetails();

    return c.json(
      models.map(m => ({
        id: m.name,
        name: m.name,
        size: m.size,
      }))
    );
  })
  .openapi(removeModel, async (c) => {
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
