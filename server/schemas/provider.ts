import { z } from "zod";

export const ProviderSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['local', 'cloud']),
});

export const ModelParametersSchema = z.object({
  system: z.string(),
  temperature: z.number(),
});

export type ModelParametersSchemaType = z.infer<typeof ModelParametersSchema>;

export const ModelSchema = z.object({
  name: z.string(),
  id: z.string(),
  availableParameters: z.array(ModelParametersSchema.keyof()),
  defaultParameters: ModelParametersSchema.partial(),
});

export type ModelSchemaType = z.infer<typeof ModelSchema>;

export const ModelResponseSchema = z.array(z.object({
  provider: ProviderSchema,
  models: z.array(ModelSchema),
}));

export type ModelResponseSchemaType = z.infer<typeof ModelResponseSchema>;
