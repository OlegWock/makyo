import { OpenRouterProvider, type OpenRouterModelDefinition } from "@server/providers/openrouter";

class AnthropicProvider extends OpenRouterProvider {
  id = 'anthropic';
  name = 'Anthropic';

  protected getOpenRouterModels(): OpenRouterModelDefinition[] {
    return [
      {id: 'anthropic/claude-3.5-sonnet:beta', name: 'Claude 3.5 Sonnet'},
      {id: 'anthropic/claude-3-opus:beta', name: 'Claude 3 Opus'},
      {id: 'anthropic/claude-3-sonnet:beta', name: 'Claude 3 Sonnet'},
      {id: 'anthropic/claude-3-haiku:beta', name: 'Claude 3 Haiku'},
    ];
  }
}

export const anthropicProvider = new AnthropicProvider();
