import { db } from "@server/db";
import { getMessageHistoryUpwards } from "@server/db/queries/messages";
import { chat, message } from "@server/db/schema";
import { type ModelParameters, Provider } from "@server/providers/provider"
import type { ChatSchemaType, ChatWithMessagesSchemaType, MessageSearchResultSchemaType } from "@server/schemas/chats";
import { omit, serialize } from "@server/utils/serialization";
import { broadcastSubscriptionMessage } from "@server/utils/subscriptions";
import { throttle } from "@shared/utils";
import { and, eq, desc, type InferSelectModel, inArray } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";


export const sendMessageAndSave = async ({ parentId, provider, modelId, text, chatId, temperature, system }: {
  provider: Provider,
  modelId: string,
  text: string,
  chatId: number,
  parentId?: number | null
} & Partial<ModelParameters>) => {
  const model = await provider.getModelById(modelId);
  if (!model) {
    throw new HTTPException(404, { message: 'unknown model' });
  }
  const { messagesHistory, responseMessage, userMessage } = await db.transaction(async (tx) => {
    const [userMessage] = await tx.insert(message).values({
      parentId: parentId ?? null,
      text: text,
      sender: 'user',
      senderName: 'User',
      chatId,
      isGenerating: false,
      createdAt: new Date(),
    }).returning();

    const messagesHistory = await getMessageHistoryUpwards(userMessage.id);

    const [responseMessage] = await tx.insert(message).values({
      parentId: userMessage.id,
      text: '',
      sender: 'ai',
      senderName: model.name,
      providerId: provider.id,
      chatId,
      isGenerating: true,
      createdAt: new Date(Date.now() + 1),
    }).returning();

    return { messagesHistory, responseMessage, userMessage };
  });

  let responseGenerated = false;
  provider.chat(
    modelId,
    {
      messages: messagesHistory,
      temperature,
      system,
    },
    {
      onProgress: throttle((response) => {
        if (responseGenerated) return;
        broadcastSubscriptionMessage({
          type: 'updateMessage',
          data: {
            messageId: responseMessage.id,
            chatId,
            text: response,
          }
        });
      }, 100),
    }
  ).then(response => {
    return db.update(message).set({
      text: response,
      isGenerating: false,
    }).where(eq(message.id, responseMessage.id)).returning();
  }).then(([responseMessage]) => {
    responseGenerated = true;
    broadcastSubscriptionMessage({
      type: 'updateMessage',
      data: {
        messageId: responseMessage.id,
        chatId,
        text: responseMessage.text,
        isGenerating: responseMessage.isGenerating,
      }
    });
    setTimeout(() => {
      broadcastSubscriptionMessage({
        type: 'updateMessage',
        data: {
          messageId: responseMessage.id,
          chatId,
          text: responseMessage.text,
          isGenerating: responseMessage.isGenerating,
        }
      });
    }, 200);
  }).catch((err) => {
    broadcastSubscriptionMessage({
      type: 'updateMessage',
      data: {
        messageId: responseMessage.id,
        chatId,
        text: '',
        error: err.toString(),
        isGenerating: false,
      }
    });
    return db.update(message).set({
      text: '',
      isGenerating: false,
      error: err.toString(),
    }).where(eq(message.id, responseMessage.id)).returning();
  });

  return { responseMessage, userMessage };
};

export const regenerateResponseForMessage = async ({ chatId, parentId, modelId, provider, temperature, system }: {
  provider: Provider,
  modelId: string,
  chatId: number,
  parentId: number,
} & Partial<ModelParameters>) => {
  const model = await provider.getModelById(modelId);
  if (!model) {
    throw new HTTPException(404, { message: 'unknown model' });
  }
  const [responseMessage] = await db.insert(message).values({
    parentId,
    text: '',
    sender: 'ai',
    senderName: model.name,
    providerId: provider.id,
    chatId,
    isGenerating: true,
    createdAt: new Date(),
  }).returning();

  const messagesHistory = await getMessageHistoryUpwards(parentId);

  let responseGenerated = false;
  provider.chat(
    modelId,
    {
      messages: messagesHistory,
      temperature,
      system,
    },
    {
      onProgress: throttle((response) => {
        if (responseGenerated) return;
        broadcastSubscriptionMessage({
          type: 'updateMessage',
          data: {
            messageId: responseMessage.id,
            chatId,
            text: response,
          }
        });
      }, 100),
    }
  ).then(response => {
    return db.update(message).set({
      text: response,
      isGenerating: false,
    }).where(eq(message.id, responseMessage.id)).returning();
  }).then(([responseMessage]) => {
    responseGenerated = true;
    broadcastSubscriptionMessage({
      type: 'updateMessage',
      data: {
        messageId: responseMessage.id,
        chatId,
        text: responseMessage.text,
        isGenerating: responseMessage.isGenerating,
      }
    });
    setTimeout(() => {
      broadcastSubscriptionMessage({
        type: 'updateMessage',
        data: {
          messageId: responseMessage.id,
          chatId,
          text: responseMessage.text,
          isGenerating: responseMessage.isGenerating,
        }
      });
    }, 200);
  }).catch((err) => {
    broadcastSubscriptionMessage({
      type: 'updateMessage',
      data: {
        messageId: responseMessage.id,
        chatId,
        text: '',
        error: err.toString(),
        isGenerating: false,
      }
    });
    return db.update(message).set({
      text: '',
      isGenerating: false,
      error: err.toString(),
    }).where(eq(message.id, responseMessage.id)).returning();
  });

  return responseMessage;
};

export const augmentChatWithLastMessage = async (chatFromDb: InferSelectModel<typeof chat>): Promise<ChatSchemaType> => {
  const [lastMessage] = await db.select().from(message).where(eq(message.chatId, chatFromDb.id)).orderBy(desc(message.createdAt)).limit(1);
  return serialize({
    ...chatFromDb,
    lastMessageAt: lastMessage.createdAt,
    lastMessageText: lastMessage.text,
  });
};

export const augmentMessagesWithModelAndChatTitle = async (messages: InferSelectModel<typeof message>[]): Promise<MessageSearchResultSchemaType[]> => {
  if (messages.length === 0) return [];
  const chatIds = [...new Set(messages.map(m => m.chatId))];
  const chats = await db.select().from(chat).where(inArray(chat.id, chatIds));
  const chatsMap = Object.fromEntries(chats.map(c => [c.id, c]));
  return messages.map(m => {
    return {
      ...serialize(m),
      chatTitle: chatsMap[m.chatId].title,
      providerId: chatsMap[m.chatId].providerId,
      modelId: chatsMap[m.chatId].modelId,
      type: 'message',
    }
  });
};

export const getChatWithMessagesFromDb = async (chatId: number): Promise<ChatWithMessagesSchemaType> => {
  const chatFromDb = await db.query.chat.findFirst({
    where: eq(chat.id, chatId)
  });
  if (!chatFromDb) {
    throw new HTTPException(404, { message: 'unknown chat' });
  }
  const messages = await db.select().from(message).where(eq(message.chatId, chatId)).orderBy(desc(message.createdAt));

  return {
    chat: serialize({
      ...chatFromDb,
      lastMessageAt: messages[0].createdAt,
      lastMessageText: messages[0].text,
    }),
    messages: messages.map(m => serialize(omit(m, ['chatId'])))
  };
};

export const getMessageFromDb = async (chatId: number, messageId: number) => {
  const chatFromDb = await db.query.chat.findFirst({
    where: eq(chat.id, chatId)
  });
  if (!chatFromDb) {
    throw new HTTPException(404, { message: 'unknown chat' });
  }
  const messageFromDb = await db.query.message.findFirst({
    where: and(
      eq(message.id, messageId),
      eq(message.chatId, chatId)
    )
  });
  if (!messageFromDb) {
    throw new HTTPException(404, { message: 'unknown message' });
  }

  return { chatFromDb, messageFromDb };
}
