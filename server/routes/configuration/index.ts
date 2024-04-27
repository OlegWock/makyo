import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { anthropicProvider } from "@server/providers/anthropic";
import { ollamaProvider } from "@server/providers/ollama";
import { openaiProvider } from "@server/providers/openai";
import { ConfigurationSchema } from "@server/schemas/configuration";


const getConfiguration = createRoute({
  method: 'get',
  path: '/api/configuration',
  summary: 'Get current configuration',
  tags: ['Settings'],
  security: [{ CookieAuth: [] }],
  responses: {
    200: {
      content: {
        'application/json': {
          schema: ConfigurationSchema,
        },
      },
      description: '',
    },
  },
});

export const configurationRouter = new OpenAPIHono()
  .openapi(getConfiguration, async (c) => {
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


