import { db } from "@server/db";
import { getMessageHistoryUpwards } from "@server/db/queries/messages";
import { chat, message } from "@server/db/schema";
import { Provider } from "@server/providers/provider"
import { ChatWithMessagesSchemaType } from "@server/schemas/chats";
import { omit, serialize } from "@server/utils/serialization";
import { broadcastWSMessage } from "@server/utils/websockets";
import { throttle } from "@shared/utils";
import { eq } from "drizzle-orm";

export const sendMessageAndSave = async ({ parentId, provider, modelId, text, chatId }: {
  provider: Provider,
  modelId: string,
  text: string,
  chatId: number,
  parentId?: number | null
}) => {
  const [userMessage] = await db.insert(message).values({
    parentId: parentId ?? null,
    text: text,
    sender: 'user',
    chatId,
    isGenerating: false,
    createdAt: new Date(),
  }).returning();

  const messagesHistory = await getMessageHistoryUpwards(userMessage.id);

  const [responseMessage] = await db.insert(message).values({
    parentId: userMessage.parentId,
    text: '',
    sender: 'ai',
    chatId,
    isGenerating: true,
    createdAt: new Date(Date.now() + 1),
  }).returning();


  provider.chat(
    modelId,
    messagesHistory,
    {
      onProgress: throttle((response) => {
        broadcastWSMessage({
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
    broadcastWSMessage({
      type: 'updateMessage',
      data: {
        messageId: responseMessage.id,
        chatId,
        text: responseMessage.text,
        isGenerating: responseMessage.isGenerating,
      }
    });
  });

  return responseMessage;
}

export const getChatWithMessagesFromDb = async (chatId: number): Promise<ChatWithMessagesSchemaType> => {
  const chatFromDb = await db.query.chat.findFirst({
    where: eq(chat.id, chatId)
  });
  if (!chatFromDb) {
    throw new Error('unknown chat');
  }
  const messages = await db.select().from(message).where(eq(message.chatId, chatId));

  return {
    chat: serialize(chatFromDb),
    messages: messages.map(m => serialize(omit(m, ['chatId'])))
  };
};