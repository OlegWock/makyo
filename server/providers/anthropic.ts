import { MessageForLLM, Provider, ProviderChatOptions, ProviderType } from "@server/providers/provider";

class AnthropicProvider extends Provider {
  id = 'anthropic';
  name = 'Anthropic';
  type: ProviderType = 'cloud';

  chat(modelId: string, messages: MessageForLLM[], options?: ProviderChatOptions): Promise<string> {
    throw new Error("Method not implemented.");
  }
  async isEnabled() {
    return !!process.env.KATUKO_ANTHROPIC_KEY;
  }
  async getModels() {
    return [
      {id: 'claude-3-opus-20240229', name: 'Claude 3 Opus'},
      {id: 'claude-3-sonnet-20240229', name: 'Claude 3 Sonnet'},
      {id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku'},
      {id: 'claude-2.1', name: 'Claude 2.1'},
      {id: 'claude-2.0', name: 'Claude 2'},
      {id: 'claude-instant-1.2', name: 'Claude Instant 1.2'},
    ];
  }
}

export const anthropicProvider = new AnthropicProvider();
