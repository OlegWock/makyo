import { message } from "@server/db/schema";
import { InferSelectModel } from "drizzle-orm";

export type Model = {
  id: string;
  name: string;
}

export type MessageForLLM = Pick<InferSelectModel<typeof message>, 'sender' | 'text'>;

export type ProviderType = 'local' | 'cloud';

export type ProviderChatOptions = {
  onProgress?: (response: string) => void,
}

export abstract class Provider {
  abstract id: string;
  abstract name: string;
  abstract type: ProviderType;
  abstract isEnabled(): Promise<boolean>;
  abstract getModels(): Promise<Model[]>;

  abstract chat(modelId: string, messages: MessageForLLM[], options?: ProviderChatOptions): Promise<string>;

  async isModelSupported(modelId: string) {
    const models = await this.getModels();
    return models.some(m => m.id === modelId);
  }
}
