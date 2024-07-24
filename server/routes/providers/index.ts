import { Hono } from "hono";
import { allProviders } from "@server/providers";
import { createProxiedFetch, ollamaFetch } from "@server/providers/ollama/proxy";
import { ollamaRouter } from "@server/routes/providers/ollama";
import { broadcastSubscriptionMessage } from "@server/utils/subscriptions";
import { upgradeWebSocket } from "@server/utils/websockets";


export const providersRouter = new Hono()
  .get('/api/providers/models', async (c) => {
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
        broadcastSubscriptionMessage({type: 'updateModels', data: {}});
        signal.addEventListener('abort', () => {
          ollamaFetch.current = null;
        });
      }
      return handlers;
    }),
  ).route('/', ollamaRouter);


