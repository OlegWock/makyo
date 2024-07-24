import { z } from "zod";

export const SnippetSchema = z.object({
  id: z.number(),
  name: z.string(),
  shortcut: z.string(),
  text: z.string(),
  createdAt: z.number(),
});

export type SnippetSchemaType = z.infer<typeof SnippetSchema>;

export const SnippetInSchema = SnippetSchema.omit({id: true, createdAt: true});

export type SnippetInSchemaType = z.infer<typeof SnippetInSchema>;
