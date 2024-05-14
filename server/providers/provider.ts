import { message } from "@server/db/schema";
import type { InferSelectModel } from "drizzle-orm";

export type ModelParameters = {
  system: string;
  temperature: number;
};

export type Model = {
  id: string;
  name: string;
  availableParameters: Array<keyof ModelParameters>;
  defaultParameters: Partial<ModelParameters>;
};

export type MessageForLLM = Pick<InferSelectModel<typeof message>, 'sender' | 'text'>;

export type ProviderType = 'local' | 'cloud';

export type ProviderChatParameters = {
  messages: MessageForLLM[],
} & Partial<ModelParameters>;

export type ProviderChatOptions = {
  onProgress?: (response: string) => void,
}

export abstract class Provider {
  abstract id: string;
  abstract name: string;
  abstract type: ProviderType;
  abstract isEnabled(): Promise<boolean>;
  abstract getModels(): Promise<Model[]>;

  abstract chat(modelId: string, params: ProviderChatParameters, options?: ProviderChatOptions): Promise<string>;

  async isModelSupported(modelId: string) {
    const models = await this.getModels();
    return models.some(m => m.id === modelId);
  }

  async getModelById(modelId: string) {
    const models = await this.getModels();
    return models.find(m => m.id === modelId);
  }
}
