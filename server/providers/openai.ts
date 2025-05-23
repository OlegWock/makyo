import { OpenRouterProvider, type OpenRouterModelDefinition } from "@server/providers/openrouter";

class OpenaiProvider extends OpenRouterProvider {
  id = 'openai';
  name = 'OpenAI';

  protected getOpenRouterModels(): OpenRouterModelDefinition[] {
    return [
      {id: 'openai/gpt-4o-mini', name: 'GPT 4o Mini'},
      {id: 'openai/gpt-4o', name: 'GPT 4o'},
      {id: 'openai/o3', name: 'GPT o3'},
      {id: 'openai/o3-mini', name: 'GPT o3 mini'},
      {id: 'openai/o3-mini-high', name: 'GPT o3 mini high'},
    ];
  }
}

export const openaiProvider = new OpenaiProvider();
