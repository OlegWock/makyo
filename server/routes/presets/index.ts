import { Hono } from "hono";
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { db } from "@server/db";
import { persona, snippet } from "@server/db/schema";
import { PersonaInSchema } from "@server/schemas/personas";
import { SnippetInSchema } from "@server/schemas/snippets";
import { serialize } from "@server/utils/serialization";
import { transformStringToNumber } from "@server/utils/zod";
import { eq } from "drizzle-orm";


export const presetsRouter = new Hono()
  .get('/api/snippets', async (c) => {
    const snippetsFromDb = await db.select().from(snippet);
    return c.json(snippetsFromDb.map(serialize));
  })
  .put('/api/snippets', zValidator('json', SnippetInSchema), async (c) => {
    const snippetPayload = c.req.valid('json');
    const [snippetFromDb] = await db.insert(snippet).values(snippetPayload).returning();
    return c.json(serialize(snippetFromDb));
  })
  .patch(
    '/api/snippets/:snippetId',
    zValidator('param', z.object({ snippetId: z.string().transform(transformStringToNumber) })),
    zValidator('json', SnippetInSchema.partial()),
    async (c) => {
      const { snippetId } = c.req.valid('param');
      const snippetPayload = c.req.valid('json');
      const [snippetFromDb] = await db.update(snippet).set(snippetPayload).where(eq(snippet.id, snippetId)).returning();
      return c.json(serialize(snippetFromDb));
    }
  )
  .delete(
    '/api/snippets/:snippetId',
    zValidator('param', z.object({ snippetId: z.string().transform(transformStringToNumber) })),
    async (c) => {
      const { snippetId } = c.req.valid('param');
      await db.delete(snippet).where(eq(snippet.id, snippetId)).returning();
      const snippetsFromDb = await db.select().from(snippet);
      return c.json(snippetsFromDb.map(serialize));
    }
  )
  .get('/api/personas', async (c) => {
    const personasFromDb = await db.select().from(persona);
    return c.json(personasFromDb.map(serialize));
  })
  .put('/api/personas', zValidator('json', PersonaInSchema), async (c) => {
    const personaPayload = c.req.valid('json');
    if (personaPayload.isDefault) {
      await db.update(persona).set({ isDefault: false }).where(eq(persona.isDefault, true)).returning();
    }
    const [personaFromDb] = await db.insert(persona).values(personaPayload).returning();
    return c.json(serialize(personaFromDb));
  })
  .patch(
    '/api/personas/:personaId',
    zValidator('param', z.object({ personaId: z.string().transform(transformStringToNumber) })),
    zValidator('json', PersonaInSchema.partial()),
    async (c) => {
      const { personaId } = c.req.valid('param');
      const personaPayload = c.req.valid('json');
      if (personaPayload.isDefault) {
        await db.update(persona).set({ isDefault: false }).where(eq(persona.isDefault, true)).returning();
      }
      const [personaFromDb] = await db.update(persona).set(personaPayload).where(eq(persona.id, personaId)).returning();
      return c.json(serialize(personaFromDb));
    }
  )
  .delete(
    '/api/personas/:personaId',
    zValidator('param', z.object({ personaId: z.string().transform(transformStringToNumber) })),
    async (c) => {
      const { personaId } = c.req.valid('param');
      await db.delete(persona).where(eq(persona.id, personaId)).returning();
      const personasFromDb = await db.select().from(persona);
      return c.json(personasFromDb.map(serialize));
    }
  );



