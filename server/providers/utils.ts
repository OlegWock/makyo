import type { MessageForLLM } from "@server/providers/provider";

type Role = 'assistant' | 'user' | 'system';
export const convertMakyoMessagesForLLM = (messages: MessageForLLM[]) => {
  return messages.map(m => {
    return {
      role: (m.sender === 'ai' ? 'assistant' : 'user') as Role,
      content: m.text,
    } as const;
  });
}
