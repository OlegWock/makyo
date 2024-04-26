import { MessageForLLM, Provider, ProviderChatOptions, ProviderType } from "@server/providers/provider";
import Anthropic from '@anthropic-ai/sdk';

class AnthropicProvider extends Provider {
  id = 'anthropic';
  name = 'Anthropic';
  type: ProviderType = 'cloud';

  async chat(modelId: string, messages: MessageForLLM[], options?: ProviderChatOptions): Promise<string> {
    const anthropic = new Anthropic({
      apiKey: process.env.KATUKO_ANTHROPIC_KEY,
    });

    // TODO: this code is same for all 3 providers, need to lift it up
    const patchedMessages = messages.map(m => {
      return {
        role: m.sender === 'ai' ? 'assistant' : 'user',
        content: m.text,
      } as const;
    });
    const stream = await anthropic.messages.stream({
      max_tokens: 2048,
      messages: patchedMessages,
      model: modelId,
    });

    let responseSoFar = '';
    stream.on('text', (text) => {
      responseSoFar += text;
      options?.onProgress?.(responseSoFar);
    });

    const response = await stream.finalText();
    return response;
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
