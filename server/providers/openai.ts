import { MessageForLLM, Provider, ProviderChatOptions, ProviderType } from "@server/providers/provider";

class OpenaiProvider extends Provider {
  id = 'openai';
  name = 'OpenAI';
  type: ProviderType = 'cloud';

  chat(modelId: string, messages: MessageForLLM[], options?: ProviderChatOptions): Promise<string> {
    throw new Error("Method not implemented.");
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
