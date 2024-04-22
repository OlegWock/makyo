import { number, z } from "zod";

export const ChatSchema = z.object({
  id: z.number(),
  title: z.string(),
  providerId: z.string(),
  modelId: z.string(),
  createdAt: z.number(),
}).openapi('Chat');

export type ChatSchemaType = z.infer<typeof ChatSchema>;

export const NewChatSchema = z.object({
  providerId: z.string(),
  modelId: z.string(),
  text: z.string(),
});

export type NewChatSchemaType = z.infer<typeof NewChatSchema>;

export const MessageSchema = z.object({
  id: z.number(),
  text: z.string(),
  isGenerating: z.boolean(),
  sender: z.enum(['user', 'ai']),
  parentId: z.number().nullable(),
  createdAt: z.number(),
}).openapi('Message');

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
