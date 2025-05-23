import {
	OpenRouterProvider,
	type OpenRouterModelDefinition,
} from "@server/providers/openrouter";

class AnthropicProvider extends OpenRouterProvider {
	id = "anthropic";
	name = "Anthropic";

	protected getOpenRouterModels(): OpenRouterModelDefinition[] {
		return [
			{ id: "anthropic/claude-sonnet-4", name: "Claude 4 Sonnet" },
			{ id: "anthropic/claude-3.7-sonnet", name: "Claude 3.7 Sonnet" },
			{
				id: "anthropic/claude-3.7-sonnet:thinking",
				name: "Claude 3.7 Sonnet Thinking",
			},
		];
	}
}

export const anthropicProvider = new AnthropicProvider();
