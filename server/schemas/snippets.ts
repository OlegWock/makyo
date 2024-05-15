import { z } from "zod";

export const SnippetSchema = z.object({
  id: z.number(),
  name: z.string(),
  shortcut: z.string(),
  text: z.string(),
  createdAt: z.number(),
}).openapi('Snippet');

export type SnippetSchemaType = z.infer<typeof SnippetSchema>;

export const SnippetInSchema = z.object({
  name: z.string(),
  shortcut: z.string(),
  text: z.string(),
});

export type SnippetInSchemaType = z.infer<typeof SnippetInSchema>;
