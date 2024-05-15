import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { db } from "@server/db";
import { persona, snippet } from "@server/db/schema";
import { PersonaInSchema, PersonaSchema } from "@server/schemas/personas";
import { SnippetInSchema, SnippetSchema } from "@server/schemas/snippets";
import { serialize } from "@server/utils/serialization";
import { transformStringToNumber } from "@server/utils/zod";
import { eq } from "drizzle-orm";


const getPersonas = createRoute({
  method: 'get',
  path: '/api/personas',
  summary: 'Get personas',
  tags: ['Presets'],
  security: [{ CookieAuth: [] }],
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.array(PersonaSchema),
        },
      },
      description: 'Get all personas',
    },
  },
});

const createPersona = createRoute({
  method: 'put',
  path: '/api/personas',
  summary: 'Create persona',
  tags: ['Presets'],
  security: [{ CookieAuth: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: PersonaInSchema,
        }
      }
    }
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: PersonaSchema,
        },
      },
      description: 'Create persona',
    },
  },
});

const updatePersona = createRoute({
  method: 'patch',
  path: '/api/personas/{personaId}',
  summary: 'Update persona',
  tags: ['Presets'],
  security: [{ CookieAuth: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: PersonaInSchema.partial(),
        }
      }
    },
    params: z.object({
      personaId: z.string().openapi({
        param: {
          name: 'personaId',
          in: 'path',
        },
      }).transform(transformStringToNumber)
    }),
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: PersonaSchema,
        },
      },
      description: 'Update persona',
    },
  },
});

const deletePersona = createRoute({
  method: 'delete',
  path: '/api/personas/{personaId}',
  summary: 'Delete persona',
  tags: ['Presets'],
  security: [{ CookieAuth: [] }],
  request: {
    params: z.object({
      personaId: z.string().openapi({
        param: {
          name: 'personaId',
          in: 'path',
        },
      }).transform(transformStringToNumber)
    }),
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.array(PersonaSchema),
        },
      },
      description: 'Delete persona',
    },
  },
});

const getSnippets = createRoute({
  method: 'get',
  path: '/api/snippets',
  summary: 'Get snippets',
  tags: ['Presets'],
  security: [{ CookieAuth: [] }],
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.array(SnippetSchema),
        },
      },
      description: 'Get all snippets',
    },
  },
});

const createSnippet = createRoute({
  method: 'put',
  path: '/api/snippets',
  summary: 'Create snippet',
  tags: ['Presets'],
  security: [{ CookieAuth: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: SnippetInSchema,
        }
      }
    }
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: SnippetSchema,
        },
      },
      description: 'Create snippet',
    },
  },
});

const updateSnippet = createRoute({
  method: 'patch',
  path: '/api/snippets/{snippetId}',
  summary: 'Update snippet',
  tags: ['Presets'],
  security: [{ CookieAuth: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: SnippetInSchema.partial(),
        }
      }
    },
    params: z.object({
      snippetId: z.string().openapi({
        param: {
          name: 'snippetId',
          in: 'path',
        },
      }).transform(transformStringToNumber)
    }),
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: SnippetSchema,
        },
      },
      description: 'Update snippet',
    },
  },
});

const deleteSnippet = createRoute({
  method: 'delete',
  path: '/api/snippets/{snippetId}',
  summary: 'Delete snippet',
  tags: ['Presets'],
  security: [{ CookieAuth: [] }],
  request: {
    params: z.object({
      snippetId: z.string().openapi({
        param: {
          name: 'snippetId',
          in: 'path',
        },
      }).transform(transformStringToNumber)
    }),
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.array(SnippetSchema),
        },
      },
      description: 'Delete snippet',
    },
  },
});

export const presetsRouter = new OpenAPIHono()
  .openapi(getSnippets, async (c) => {
    const snippetsFromDb = await db.select().from(snippet);
    return c.json(snippetsFromDb.map(serialize));
  })
  .openapi(createSnippet, async (c) => {
    const snippetPayload = c.req.valid('json');
    const [snippetFromDb] = await db.insert(snippet).values(snippetPayload).returning();
    return c.json(serialize(snippetFromDb));
  })
  .openapi(updateSnippet, async (c) => {
    const { snippetId } = c.req.valid('param');
    const snippetPayload = c.req.valid('json');
    const [snippetFromDb] = await db.update(snippet).set(snippetPayload).where(eq(snippet.id, snippetId)).returning();
    return c.json(serialize(snippetFromDb));
  })
  .openapi(deleteSnippet, async (c) => {
    const { snippetId } = c.req.valid('param');
    await db.delete(snippet).where(eq(snippet.id, snippetId)).returning();
    const snippetsFromDb = await db.select().from(snippet);
    return c.json(snippetsFromDb.map(serialize));
  })
  .openapi(getPersonas, async (c) => {
    const personasFromDb = await db.select().from(persona);
    return c.json(personasFromDb.map(serialize));
  })
  .openapi(createPersona, async (c) => {
    const personaPayload = c.req.valid('json');
    const [personaFromDb] = await db.insert(persona).values(personaPayload).returning();
    return c.json(serialize(personaFromDb));
  })
  .openapi(updatePersona, async (c) => {
    const { personaId } = c.req.valid('param');
    const personaPayload = c.req.valid('json');
    const [personaFromDb] = await db.update(persona).set(personaPayload).where(eq(persona.id, personaId)).returning();
    return c.json(serialize(personaFromDb));
  })
  .openapi(deletePersona, async (c) => {
    const { personaId } = c.req.valid('param');
    await db.delete(persona).where(eq(persona.id, personaId)).returning();
    const personasFromDb = await db.select().from(persona);
    return c.json(personasFromDb.map(serialize));
  });



