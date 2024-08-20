import { Provider, type Model, type ProviderChatOptions, type ProviderChatParameters, type ProviderType } from "@server/providers/provider";
import { convertMakyoMessagesForLLM } from "@server/providers/utils";
import OpenAI from "openai";

export type OpenRouterModelDefinition = {
  id: string,
  name: string,
}

export abstract class OpenRouterProvider extends Provider {
  abstract id: string;
  abstract name: string;

  type: ProviderType = 'cloud';

  async chat(modelId: string, { messages, system, temperature }: ProviderChatParameters, options?: ProviderChatOptions): Promise<string> {
    const openai = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: process.env.MAKYO_OPENROUTER_KEY,
    });

    const patchedMessages = convertMakyoMessagesForLLM(messages);
    if (system) {
      patchedMessages.unshift({ role: 'system', content: system });
    }

    let response = '';
    let retries = 3;

    while (retries > 0 && response === '') {
      try {
        const stream = await openai.chat.completions.create({
          messages: patchedMessages,
          model: modelId,
          temperature: temperature !== undefined ? temperature * 2 : undefined,
          stream: true,
        });

        for await (const chunk of stream) {
          if (chunk.choices[0]?.delta?.content) {
            response += chunk.choices[0].delta.content;
            options?.onProgress?.(response);
          }
        }

        if (response === '') {
          retries--;
          if (retries > 0) {
            await Bun.sleep(1000);
          }
        }
      } catch (error) {
        retries--;
        if (retries > 0) {
          await Bun.sleep(1000);
        } else {
          throw error;
        }
      }
    }

    if (response === '') {
      throw new Error('Failed to get a response after multiple attempts');
    }


    return response;
  }

  async isEnabled() {
    return !!process.env.MAKYO_OPENROUTER_KEY;
  }

  protected abstract getOpenRouterModels(): OpenRouterModelDefinition[];

  async getModels(): Promise<Model[]> {
    const orModels = this.getOpenRouterModels();
    return orModels.map(({ id, name }) => {
      return {
        id,
        name,
        availableParameters: ['system', 'temperature'],
        defaultParameters: {
          system: undefined,
          temperature: undefined,
        },
      };
    });
  }
}
