import { ModelParametersSchema } from "@server/schemas/provider";
import { z } from "zod";

export const ChatSchema = z.object({
  id: z.number(),
  title: z.string(),
  providerId: z.string(),
  modelId: z.string(),
  createdAt: z.number(),
  lastMessageText: z.string(),
  lastMessageAt: z.number(),
  system: z.string().nullable(),
  temperature: z.number().nullable(),
}).openapi('Chat');

export type ChatSchemaType = z.infer<typeof ChatSchema>;

export const NewChatSchema = z.object({
  providerId: z.string(),
  modelId: z.string(),
  text: z.string(),
  parameters: ModelParametersSchema.partial().optional(),
});

export type NewChatSchemaType = z.infer<typeof NewChatSchema>;

export const UpdateChatSchema = z.object({
  title: z.string().optional(),
  parameters: ModelParametersSchema.partial().optional(),
});

export type UpdateChatSchemaType = z.infer<typeof UpdateChatSchema>;

export const MessageSchema = z.object({
  id: z.number(),
  text: z.string(),
  isGenerating: z.boolean(),
  sender: z.enum(['user', 'ai']),
  parentId: z.number().nullable(),
  createdAt: z.number(),
}).openapi('Message');

export type MessageSchemaType = z.infer<typeof MessageSchema>;

export const ChatWithMessagesSchema = z.object({
  chat: ChatSchema,
  messages: z.array(MessageSchema)
}).openapi('ChatWithMessages');

export type ChatWithMessagesSchemaType = z.infer<typeof ChatWithMessagesSchema>;

export const NewMessageSchema = z.object({
  parentId: z.number(),
  text: z.string(),
});

export type NewMessageSchemaType = z.infer<typeof NewMessageSchema>;

export const EditMessageSchema = z.object({
  text: z.string(),
  regenerateResponse: z.boolean().optional().default(false),
});

export type EditMessageSchemaType = z.infer<typeof EditMessageSchema>;
