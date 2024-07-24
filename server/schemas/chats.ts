import { ModelParametersSchema } from "@server/schemas/provider";
import { z } from "zod";

export const ChatSchema = z.object({
  id: z.number(),
  title: z.string(),
  providerId: z.string(),
  modelId: z.string(),
  createdAt: z.number(),
  isStarred: z.boolean(),
  lastMessageText: z.string(),
  lastMessageAt: z.number(),
  personaId: z.number().nullable(),
  system: z.string().nullable(),
  temperature: z.number().nullable(),
});

export type ChatSchemaType = z.infer<typeof ChatSchema>;

export const NewChatSchema = z.object({
  providerId: z.string(),
  modelId: z.string(),
  text: z.string(),
  personaId: z.number().optional(),
  parameters: ModelParametersSchema.partial().optional(),
});

export type NewChatSchemaType = z.infer<typeof NewChatSchema>;

export const UpdateChatSchema = z.object({
  title: z.string().optional(),
  parameters: ModelParametersSchema.partial().optional(),
  isStarred: z.boolean().optional(),
  model: z.object({
    providerId: z.string(),
    modelId: z.string(),
  }).optional(),
});

export type UpdateChatSchemaType = z.infer<typeof UpdateChatSchema>;

export const MessageSchema = z.object({
  id: z.number(),
  text: z.string(),
  isGenerating: z.boolean(),
  error: z.string().nullable(),
  sender: z.enum(['user', 'ai']),
  senderName: z.string(),
  providerId: z.string().nullable(),
  parentId: z.number().nullable(),
  createdAt: z.number(),
});

export type MessageSchemaType = z.infer<typeof MessageSchema>;

export const ChatWithMessagesSchema = z.object({
  chat: ChatSchema,
  messages: z.array(MessageSchema)
});

export const SendMessageResponseSchema = ChatWithMessagesSchema.extend({
  newMessage: MessageSchema.optional(),
});

export type ChatWithMessagesSchemaType = z.infer<typeof ChatWithMessagesSchema>;
export type SendMessageResponseSchemaType = z.infer<typeof SendMessageResponseSchema>;

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


export const MessageSearchResultSchema = MessageSchema.extend({
  type: z.literal('message'),
  providerId: z.string(),
  modelId: z.string(),
  chatTitle: z.string(),
  chatId: z.number(),
});

export type MessageSearchResultSchemaType = z.infer<typeof MessageSearchResultSchema>;

export const SearchResultSchema = z.union([
  ChatSchema.extend({
    type: z.literal('chat'),
  }),
  MessageSearchResultSchema,
]);

export type SearchResultSchemaType = z.infer<typeof SearchResultSchema>;
