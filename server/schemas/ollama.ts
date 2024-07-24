import { z } from "zod";


export const OllamaModelSchema = z.object({
  name: z.string(),
  id: z.string(),
  size: z.number(),
});


export const OllamaModelResponseSchema = z.array(OllamaModelSchema);

export type OllamaModelResponseSchemaType = z.infer<typeof OllamaModelResponseSchema>;
