import { z } from "zod";

export const PersonaSchema = z.object({
  id: z.number(),
  name: z.string(),
  avatar: z.string(),
  system: z.string().nullable(),
  temperature: z.number().nullable(),
  providerId: z.string().nullable(),
  modelId: z.string().nullable(),
  createdAt: z.number(),
}).openapi('Persona');

export type PersonaSchemaType = z.infer<typeof PersonaSchema>;

export const PersonaInSchema = PersonaSchema.omit({id: true, createdAt: true});

export type PersonaInSchemaType = z.infer<typeof PersonaInSchema>;
