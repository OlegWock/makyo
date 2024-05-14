import { Ollama } from 'ollama';
import { Provider } from "@server/providers/provider";
import type { MessageForLLM, Model, ProviderChatOptions, ProviderChatParameters, ProviderType } from "@server/providers/provider";
import { convertMakyoMessagesForLLM } from '@server/providers/utils';
import { ollamaFetch } from '@server/providers/ollama/proxy';

class OllamaProvider extends Provider {
  id = 'ollama';
  name = 'Ollama';
  type: ProviderType = 'local';

  async #getConfiguration() {
    const host = process.env.MAKYO_OLLAMA_HOST ?? undefined;
    const localProxy = ['1', 'true'].includes(process.env.VITE_MAKYO_OLLAMA_USE_LOCAL_PROXY ?? '');
    if (!host && !localProxy) {
      return {
        enabled: false,
        host: '',
        models: [],
      };
    }

    try {
      console.log('Get ollama configuration. Is proxy active:', !!ollamaFetch.current);
      const ollama = new Ollama({ host, fetch: ollamaFetch.current ?? undefined });
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
    const ollama = new Ollama({ host: process.env.MAKYO_OLLAMA_HOST, fetch: ollamaFetch.current ?? undefined });
    const patchedMessages = convertMakyoMessagesForLLM(messages);
    if (system) {
      patchedMessages.unshift({ role: 'system', content: system });
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
