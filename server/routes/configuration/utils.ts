import { db } from "@server/db";
import { settings } from "@server/db/schema";
import { eq } from "drizzle-orm";

export const getConfigurationFromDb = async () => {
  const openai = await db.query.settings.findFirst({ where: eq(settings.key, 'openai') });
  const anthropic = await db.query.settings.findFirst({ where: eq(settings.key, 'anthropic') });

  return {
    openai: {
      enabled: !!openai?.value,
      apiKey: openai?.value ?? '',
    },
    anthropic: {
      enabled: !!anthropic?.value,
      apiKey: anthropic?.value ?? '',
    },
    ollama: {
      enabled: false,
      host: '',
      models: [],
    }
  };
};
