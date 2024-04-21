import { z } from "zod";

const OpenaiApiKey = z.string().openapi({example: 'sk-proj-scr*******'});

const OpenaiConfigurationSchema = z
  .object({
    enabled: z.boolean(),
    apiKey: OpenaiApiKey
  })
  .openapi('OpenaiConfiguration');


const AnthropicApiKey = z.string().openapi({example: 'sk-ant-api*******'});

const AnthropicConfigurationSchema = z
  .object({
    enabled: z.boolean(),
    apiKey: AnthropicApiKey
  })
  .openapi('AnthropicConfiguration');

const OllamaModelSchema = z.object({
  name: z.string(),
}).openapi('OllamaModel')

const OllamaConfigurationSchema = z
  .object({
    enabled: z.boolean(),
    host: z.string(),
    models: z.array(OllamaModelSchema),
  })
  .openapi('OllamaConfiguration');


export const ConfigurationSchema = z
  .object({
    openai: OpenaiConfigurationSchema,
    anthropic: AnthropicConfigurationSchema,
    ollama: OllamaConfigurationSchema,
  })
  .openapi('Configuration');

export const ConfigurationUpdateSchema = z
  .object({
    openai: z.object({
      apiKey: OpenaiApiKey,
    }).optional(),
    anthropic: z.object({
      apiKey: AnthropicApiKey,
    }).optional()
  })
  .openapi('ConfigurationUpdate');

export type ConfigurationUpdateSchemaType = z.infer<typeof ConfigurationUpdateSchema>;
