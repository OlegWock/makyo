import { z } from "zod";

export const ProviderSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['local', 'cloud']),
})

export const ModelSchema = z.object({
  name: z.string(),
  id: z.string(),
}).openapi('Model');

export const ModelResponseSchema = z.array(z.object({
  provider: ProviderSchema,
  models: z.array(ModelSchema),
}));

export type ModelResponseSchemaType = z.infer<typeof ModelResponseSchema>;
