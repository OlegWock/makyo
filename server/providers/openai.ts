import { MessageForLLM, Model, Provider, ProviderChatOptions, ProviderChatParameters, ProviderType } from "@server/providers/provider";
import { convertKatukoMessagesForLLM } from "@server/providers/utils";
import OpenAI from 'openai';

class OpenaiProvider extends Provider {
  id = 'openai';
  name = 'OpenAI';
  type: ProviderType = 'cloud';

  async chat(modelId: string, { messages, system }: ProviderChatParameters, options?: ProviderChatOptions): Promise<string> {
    const openai = new OpenAI({
      apiKey: process.env.KATUKO_OPENAI_KEY,
    });

    const patchedMessages = convertKatukoMessagesForLLM(messages);
    if (system) {
      patchedMessages.unshift({role: 'system', content: system});
    }

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

  async getModels(): Promise<Model[]> {
    return [
      {
        id: 'gpt-4-turbo',
        name: 'GPT-4 Turbo',
        availableParameters: ['system', 'temperature'],
        defaultParameters: {
          system: undefined,
          temperature: undefined,
        },
      },
      {
        id: 'gpt-4',
        name: 'GPT-4',
        availableParameters: ['system', 'temperature'],
        defaultParameters: {
          system: undefined,
          temperature: undefined,
        },
      },
      {
        id: 'gpt-3.5-turbo',
        name: 'GPT-3.5  Turbo',
        availableParameters: ['system', 'temperature'],
        defaultParameters: {
          system: undefined,
          temperature: undefined,
        },
      },
    ];
  }
}

export const openaiProvider = new OpenaiProvider();
