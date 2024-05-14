import { Provider } from "@server/providers/provider";
import type { Model, ProviderChatOptions, ProviderChatParameters, ProviderType } from "@server/providers/provider";
import Anthropic from '@anthropic-ai/sdk';
import { convertMakyoMessagesForLLM } from "@server/providers/utils";

class AnthropicProvider extends Provider {
  id = 'anthropic';
  name = 'Anthropic';
  type: ProviderType = 'cloud';

  async chat(modelId: string, { messages, system }: ProviderChatParameters, options?: ProviderChatOptions): Promise<string> {
    const anthropic = new Anthropic({
      apiKey: process.env.MAKYO_ANTHROPIC_KEY,
    });

    const patchedMessages = convertMakyoMessagesForLLM(messages);
    const stream = await anthropic.messages.stream({
      max_tokens: 2048,
      // @ts-ignore
      messages: patchedMessages,
      model: modelId,
      system,
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
    return !!process.env.MAKYO_ANTHROPIC_KEY;
  }

  async getModels(): Promise<Model[]> {
    return [
      {
        id: 'claude-3-opus-20240229',
        name: 'Claude 3 Opus',
        availableParameters: ['system', 'temperature'],
        defaultParameters: {
          system: undefined,
          temperature: undefined,
        },
      },
      {
        id: 'claude-3-sonnet-20240229',
        name: 'Claude 3 Sonnet',
        availableParameters: ['system', 'temperature'],
        defaultParameters: {
          system: undefined,
          temperature: undefined,
        },
      },
      {
        id: 'claude-3-haiku-20240307',
        name: 'Claude 3 Haiku',
        availableParameters: ['system', 'temperature'],
        defaultParameters: {
          system: undefined,
          temperature: undefined,
        },
      },
      {
        id: 'claude-2.1',
        name: 'Claude 2.1',
        availableParameters: ['system', 'temperature'],
        defaultParameters: {
          system: undefined,
          temperature: undefined,
        },
      },
      {
        id: 'claude-2.0',
        name: 'Claude 2',
        availableParameters: ['system', 'temperature'],
        defaultParameters: {
          system: undefined,
          temperature: undefined,
        },
      },
      {
        id: 'claude-instant-1.2',
        name: 'Claude Instant 1.2',
        availableParameters: ['system', 'temperature'],
        defaultParameters: {
          system: undefined,
          temperature: undefined,
        },
      },
    ];
  }
}

export const anthropicProvider = new AnthropicProvider();
