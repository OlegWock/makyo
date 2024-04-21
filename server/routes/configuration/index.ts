import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { db } from "@server/db";
import { settings } from "@server/db/schema";
import { getConfigurationFromDb } from "@server/routes/configuration/utils";
import { ConfigurationSchema, ConfigurationUpdateSchema } from "@server/schemas/configuration";
import { eq } from "drizzle-orm";


const getConfiguration = createRoute({
  method: 'get',
  path: '/api/configuration',
  security: [{ BearerAuth: [] }],
  responses: {
    200: {
      content: {
        'application/json': {
          schema: ConfigurationSchema,
        },
      },
      description: 'Get current configuration',
    },
  },
});

const setConfiguration = createRoute({
  method: 'patch',
  path: '/api/configuration',
  security: [{ BearerAuth: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: ConfigurationUpdateSchema,
        }
      }
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: ConfigurationSchema,
        },
      },
      description: 'Update current configuration',
    },
  },
});

export const configurationRouter = new OpenAPIHono()
  .openapi(getConfiguration, async (c) => {
    return c.json(await getConfigurationFromDb());
  })
  .openapi(setConfiguration, async (c) => {
    const body = c.req.valid('json');
    if (body.openai) {
      await db.update(settings).set({value: body.openai.apiKey}).where(eq(settings.key, 'openai'));
    }
    if (body.anthropic) {
      await db.update(settings).set({value: body.anthropic.apiKey}).where(eq(settings.key, 'anthropic'));
    }
    return c.json(await getConfigurationFromDb());
  });


