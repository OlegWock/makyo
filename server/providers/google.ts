import { OpenRouterProvider, type OpenRouterModelDefinition } from "@server/providers/openrouter";

class GoogleProvider extends OpenRouterProvider {
  id = 'google';
  name = 'Google';

  protected getOpenRouterModels(): OpenRouterModelDefinition[] {
    return [
      {id: 'google/gemini-2.0-flash-001', name: 'Gemini 2 flash'},
      {id: 'google/gemini-2.5-pro-preview', name: 'Gemini 2.5 Pro'},
    ];
  }
}

export const googleProvider = new GoogleProvider();
