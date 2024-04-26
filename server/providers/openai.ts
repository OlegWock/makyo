import { MessageForLLM, Provider, ProviderChatOptions, ProviderType } from "@server/providers/provider";
import OpenAI from 'openai';

class OpenaiProvider extends Provider {
  id = 'openai';
  name = 'OpenAI';
  type: ProviderType = 'cloud';

  async chat(modelId: string, messages: MessageForLLM[], options?: ProviderChatOptions): Promise<string> {
    const openai = new OpenAI({
      apiKey: process.env.KATUKO_OPENAI_KEY,
    });

    const patchedMessages = messages.map(m => {
      return {
        role: m.sender === 'ai' ? 'assistant' : 'user',
        content: m.text,
      } as const;
    });

    const stream = await openai.chat.completions.create({
      messages: patchedMessages,
      model: modelId,
      stream: true,
    });

    let response = '';
    for await (const chunk of stream) {
      if (chunk.choices[0]?.delta?.content) {
        response += chunk.choices[0].delta.content;
        options?.onProgress?.(response);
      }
    }

    return response;
  }

  async isEnabled() {
    return !!process.env.KATUKO_OPENAI_KEY;
  }
  
  async getModels() {
    return [
      { id: 'gpt-4-turbo', name: 'GPT-4 Turbo' },
      { id: 'gpt-4', name: 'GPT-4' },
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5  Turbo' },
    ];
  }
}

export const openaiProvider = new OpenaiProvider();
