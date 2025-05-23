import { z } from "zod";

export const ConfigurationSchema = z.object({
  openai: z.object({
    enabled: z.boolean(),
  }),
  google: z.object({
    enabled: z.boolean(),
  }),
  anthropic: z.object({
    enabled: z.boolean(),
  }),
  ollama: z.object({
    enabled: z.boolean(),
  }),
});
