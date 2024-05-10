import { Ollama } from 'ollama';
import { MessageForLLM, Model, Provider, ProviderChatOptions, ProviderChatParameters, ProviderType } from "@server/providers/provider";
import { convertMakyoMessagesForLLM } from '@server/providers/utils';

class OllamaProvider extends Provider {
  id = 'ollama';
  name = 'Ollama';
  type: ProviderType = 'local';

  async #getConfiguration() {
    const host = process.env.MAKYO_OLLAMA_HOST ?? '';
    if (!host) {
      return {
        enabled: false,
        host: '',
        models: [],
      };
    }

    try {
      const ollama = new Ollama({ host });
      const { models } = await ollama.list();

      return {
        enabled: true,
        host,
        models: models.map((model) => ({ name: model.name })),
      }
    } catch (err) {
      console.error(err);
      return {
        enabled: false,
        host: '',
        models: [],
      };
    }
  }

  async chat(modelId: string, { messages, system, temperature }: ProviderChatParameters, options?: ProviderChatOptions): Promise<string> {
    const ollama = new Ollama({ host: process.env.MAKYO_OLLAMA_HOST });
    const patchedMessages = convertMakyoMessagesForLLM(messages);
    if (system) {
      patchedMessages.unshift({role: 'system', content: system});
    }
    const responseGenerator = await ollama.chat({ 
      model: modelId, 
      messages: patchedMessages, 
      stream: true,
      options: {
        temperature,
      }
    });
    let response = '';

    for await (const part of responseGenerator) {
      response += part.message.content;
      options?.onProgress?.(response);
    }

    return response;
  }

  async isEnabled() {
    const conf = await this.#getConfiguration();
    return conf.enabled;
  }
  async getModels() {
    const conf = await this.#getConfiguration();
    return conf.models.map((m): Model => ({
      name: m.name,
      id: m.name,
      availableParameters: ['system', 'temperature'],
      defaultParameters: {
        system: undefined,
        temperature: undefined,
      },
    }));
  }
}

export const ollamaProvider = new OllamaProvider();
