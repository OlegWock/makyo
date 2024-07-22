import { OpenRouterProvider, type OpenRouterModelDefinition } from "@server/providers/openrouter";

class OpenaiProvider extends OpenRouterProvider {
  id = 'openai';
  name = 'OpenAI';

  protected getOpenRouterModels(): OpenRouterModelDefinition[] {
    return [
      {id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini'},
      {id: 'openai/gpt-4o', name: 'GPT-4o'},
      {id: 'openai/gpt-4-turbo', name: 'GPT-4 Turbo'},
      {id: 'openai/gpt-3.5-turbo', name: 'GPT-3.5 Turbo'},
    ];
  }
}

export const openaiProvider = new OpenaiProvider();
