import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { allProviders } from "@server/providers";
import { createProxiedFetch, ollamaFetch } from "@server/providers/ollama/proxy";
import { ModelResponseSchema } from "@server/schemas/provider";
import { upgradeWebSocket } from "@server/utils/websockets";


const getModels = createRoute({
  method: 'get',
  path: '/api/providers/models',
  summary: 'Get models',
  tags: ['Providers'],
  security: [{ CookieAuth: [] }],
  responses: {
    200: {
      content: {
        'application/json': {
          schema: ModelResponseSchema,
        },
      },
      description: 'Get current configuration',
    },
  },
});

export const providersRouter = new OpenAPIHono()
  .openapi(getModels, async (c) => {
    const promises = allProviders.map(async (provider) => {
      const enabled = await provider.isEnabled();
      if (!enabled) return null;
      return {
        provider: {
          id: provider.id,
          name: provider.name,
          type: provider.type,
        },
        models: await provider.getModels(),
      }
    });

    const response = await Promise.all(promises);
    return c.json(response.filter(Boolean));
  })
  .get(
    '/api/providers/ollama-proxy-ws',
    upgradeWebSocket((c) => {
      const { handlers, proxiedFetch, signal } = createProxiedFetch();
      if (!ollamaFetch.current) {
        ollamaFetch.current = proxiedFetch;

        signal.addEventListener('abort', () => {
          ollamaFetch.current = null;
        });
      }
      return handlers;
    }),
  );


