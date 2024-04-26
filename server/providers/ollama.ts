import { Ollama } from 'ollama';
import { MessageForLLM, Provider, ProviderChatOptions, ProviderType } from "@server/providers/provider";

class OllamaProvider extends Provider {
  id = 'ollama';
  name = 'Ollama';
  type: ProviderType = 'local';

  async #getConfiguration() {
    const host = process.env.KATUKO_OLLAMA_HOST ?? '';
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

  async chat(modelId: string, messages: MessageForLLM[], options?: ProviderChatOptions): Promise<string> {
    const ollama = new Ollama({ host: process.env.KATUKO_OLLAMA_HOST });
    const patchedMessages = messages.map(m => {
      return {
        role: m.sender === 'ai' ? 'assistant' : 'user',
        content: m.text,
      }
    });
    const responseGenerator = await ollama.chat({ model: modelId, messages: patchedMessages, stream: true });
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
    return conf.models.map(m => ({
      name: m.name,
      id: m.name,
    }));
  }
}

export const ollamaProvider = new OllamaProvider();
