import { Hono } from "hono";
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { db } from "@server/db";
import { getMessageHistoryDownwards } from "@server/db/queries/messages";
import { chat, message } from "@server/db/schema";
import { getProviderById } from "@server/providers";
import { augmentChatWithLastMessage, augmentMessagesWithModelAndChatTitle, getChatWithMessagesFromDb, getMessageFromDb, regenerateResponseForMessage, sendMessageAndSave } from "@server/routes/chats/utils";
import { EditMessageSchema, NewChatSchema, NewMessageSchema, UpdateChatSchema } from "@server/schemas/chats";
import { createTitlePrompt } from "@server/utils/prompts";
import { omit, serialize } from "@server/utils/serialization";
import { broadcastSubscriptionMessage } from "@server/utils/subscriptions";
import { transformStringToNumber } from "@server/utils/zod";
import { and, eq, isNull, type InferInsertModel, like, inArray } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";


export const chatsRouter = new Hono()
  .get('/api/chats', async (c) => {
    const chats = await db.select().from(chat);
    const augmented = await Promise.all(chats.map(c => augmentChatWithLastMessage(c)));
    augmented.sort((a, b) => {
      if (a.isStarred === b.isStarred) return b.lastMessageAt - a.lastMessageAt;
      if (a.isStarred) return -1;
      return 1;
    });
    return c.json(augmented);
  })
  .get('/api/search', zValidator('query', z.object({ searchQuery: z.string() })), async (c) => {
    const { searchQuery } = c.req.valid('query');
    const [rawChats, rawMessages] = await Promise.all([
      db.select().from(chat).where(like(chat.title, `%${searchQuery}%`)),
      db.select().from(message).where(like(message.text, `%${searchQuery}%`)),
    ]);
    const chats = await Promise.all(rawChats.map(augmentChatWithLastMessage));
    const messages = await augmentMessagesWithModelAndChatTitle(rawMessages);
    const response = [
      ...chats.map(c => ({ ...c, type: 'chat' as const })),
      ...messages,
    ];
    return c.json(response);
  })
  .post('/api/chats', zValidator('json', NewChatSchema), async (c) => {
    const { providerId, modelId, text, parameters, personaId } = c.req.valid('json');
    const provider = getProviderById(providerId);
    const model = await provider.getModelById(modelId);
    if (!model) {
      throw new HTTPException(404, { message: 'unknown model' });
    }

    if (parameters && Object.keys(parameters).some(key => !model.availableParameters.includes(key))) {
      throw new HTTPException(400, { message: `selected model doesn't support one or more provided parameters` });
    }
    const tmpName = text.length > 70 ? text.slice(0, 70) + '…' : text;
    const [newChat] = await db.insert(chat).values({
      title: tmpName,
      providerId,
      modelId,
      personaId: personaId,
      temperature: parameters?.temperature,
      system: parameters?.system,
    }).returning();
    const { system, message: prompt } = createTitlePrompt(text);
    if (text.length > 70) {
      provider.chat(modelId, {
        messages: [{ sender: 'user', text: prompt }],
        system: system,
      }).then((newTitle) => {
        const title = newTitle.length > 70 ? newTitle.slice(0, 70) + '…' : newTitle;
        broadcastSubscriptionMessage({
          type: 'updateChat',
          data: {
            chatId: newChat.id,
            title: title,
          }
        });
        return db.update(chat).set({ title }).where(eq(chat.id, newChat.id)).returning();
      });
    }
    await sendMessageAndSave({
      provider,
      modelId,
      text,
      chatId: newChat.id,
      system: parameters?.system,
      temperature: parameters?.temperature,
      parentId: null,
    });
    return c.json(serialize(await augmentChatWithLastMessage(newChat)));
  })
  .get('/api/chats/:chatId', zValidator('param', z.object({ chatId: z.string().transform(transformStringToNumber) })), async (c) => {
    const { chatId } = c.req.valid('param');
    return c.json(await getChatWithMessagesFromDb(chatId));
  })
  .patch(
    '/api/chats/:chatId',
    zValidator('param', z.object({ chatId: z.string().transform(transformStringToNumber) })),
    zValidator('json', UpdateChatSchema),
    async (c) => {
      const { chatId } = c.req.valid('param');
      const { title, parameters, model: modelPayload, isStarred } = c.req.valid('json');
      let payload: Partial<InferInsertModel<typeof chat>> = { isStarred };
      if (title) payload.title = title;
      if (modelPayload) {
        const provider = getProviderById(modelPayload.providerId);
        const model = await provider.getModelById(modelPayload.modelId);
        if (!model) {
          throw new HTTPException(404, { message: 'unknow model' });
        }
        payload.providerId = provider.id;
        payload.modelId = model.id;
      }
      if (parameters) {
        payload.system = parameters.system ?? null;
        payload.temperature = parameters.temperature ?? null;
      }

      await db.update(chat).set(payload).where(eq(chat.id, chatId)).returning();

      return c.json(await getChatWithMessagesFromDb(chatId));
    })
  .delete('/api/chats/:chatId', zValidator('param', z.object({ chatId: z.string().transform(transformStringToNumber) })), async (c) => {
    const { chatId } = c.req.valid('param');
    await db.delete(chat).where(eq(chat.id, chatId));
    return c.json({});
  })
  .put(
    '/api/chats/:chatId',
    zValidator('param', z.object({ chatId: z.string().transform(transformStringToNumber) })),
    zValidator('json', NewMessageSchema),
    async (c) => {
      const { chatId } = c.req.valid('param');
      const chatFromDb = await db.query.chat.findFirst({
        where: eq(chat.id, chatId)
      });
      if (!chatFromDb) {
        throw new HTTPException(404, { message: 'unknown chat' });
      }
      const { parentId, text } = c.req.valid('json');
      const provider = getProviderById(chatFromDb.providerId);
      const modelId = chatFromDb.modelId;

      const { responseMessage } = await sendMessageAndSave({
        provider,
        modelId,
        text,
        parentId: parentId,
        chatId,
        system: chatFromDb.system ?? undefined,
        temperature: chatFromDb.temperature ?? undefined,
      });
      return c.json({
        ...(await getChatWithMessagesFromDb(chatId)),
        newMessage: serialize(omit(responseMessage, ['chatId'])),
      });
    })
  .post(
    '/api/chats/:chatId/:messageId/regenerate',
    zValidator('param', z.object({
      chatId: z.string().transform(transformStringToNumber),
      messageId: z.string().transform(transformStringToNumber)
    })),
    async (c) => {
      const { chatId, messageId } = c.req.valid('param');
      const { chatFromDb, messageFromDb } = await getMessageFromDb(chatId, messageId);
      if (!messageFromDb.parentId || messageFromDb.sender === 'user') {
        throw new HTTPException(400, { message: `can't regenerate user messages` });
      }

      const provider = getProviderById(chatFromDb.providerId);
      const modelId = chatFromDb.modelId;

      const responseMessage = await regenerateResponseForMessage({
        provider,
        modelId,
        parentId: messageFromDb.parentId,
        chatId,
        system: chatFromDb.system ?? undefined,
        temperature: chatFromDb.temperature ?? undefined,
      });

      return c.json(serialize(responseMessage));
    })
  .post(
    '/api/chats/:chatId/:messageId/duplicate',
    zValidator('param', z.object({
      chatId: z.string().transform(transformStringToNumber),
      messageId: z.string().transform(transformStringToNumber)
    })),
    async (c) => {
      const { chatId, messageId } = c.req.valid('param');
      const { messageFromDb } = await getMessageFromDb(chatId, messageId);
      if (!messageFromDb.parentId || messageFromDb.sender === 'user') {
        throw new HTTPException(400, { message: `can't duplicate user messages` });
      }

      const [messageCopy] = await db.insert(message).values(omit(messageFromDb, ['id', 'createdAt'])).returning();
      return c.json(serialize(messageCopy));
    })
  .patch(
    '/api/chats/:chatId/:messageId',
    zValidator('param', z.object({
      chatId: z.string().transform(transformStringToNumber),
      messageId: z.string().transform(transformStringToNumber)
    })),
    zValidator('json', EditMessageSchema),
    async (c) => {
      const { chatId, messageId } = c.req.valid('param');
      const { text, regenerateResponse } = c.req.valid('json');
      const { chatFromDb, messageFromDb } = await getMessageFromDb(chatId, messageId);
      if (messageFromDb.sender === 'ai' && regenerateResponse) {
        throw new HTTPException(400, { message: `regenerateResponse can be set to true only for user messages` });
      }

      if (regenerateResponse) {
        const provider = getProviderById(chatFromDb.providerId);
        const modelId = chatFromDb.modelId;
        await sendMessageAndSave({
          provider,
          modelId,
          text,
          parentId: messageFromDb.parentId,
          chatId,
          system: chatFromDb.system ?? undefined,
          temperature: chatFromDb.temperature ?? undefined,
        });
      } else {
        await db.update(message).set({ text }).where(eq(message.id, messageId)).returning();
      }

      return c.json(await getChatWithMessagesFromDb(chatId));
    })
  .delete(
    '/api/chats/:chatId/:messageId',
    zValidator('param', z.object({
      chatId: z.string().transform(transformStringToNumber),
      messageId: z.string().transform(transformStringToNumber)
    })),
    async (c) => {
      const { chatId, messageId } = c.req.valid('param');
      const { messageFromDb } = await getMessageFromDb(chatId, messageId);
      if (!messageFromDb.parentId) {
        const rootMessages = await db.select().from(message).where(and(
          eq(message.chatId, chatId),
          isNull(message.parentId),
        ));
        if (rootMessages.length === 1) {
          throw new HTTPException(400, { message: `can't delete single root message` });
        }
      }
      if (messageFromDb.sender === 'ai') {
        const parentId = messageFromDb.parentId!;
        const messagesWithSameParent = await db.select().from(message).where(and(
          eq(message.chatId, chatId),
          eq(message.parentId, parentId),
        ));
        if (messagesWithSameParent.length === 1) {
          throw new HTTPException(400, { message: `can't delete AI message if there are no alternative messages` });
        }
      }

      const messages = await getMessageHistoryDownwards(messageId);
      await db.delete(message).where(inArray(message.id, messages.map(m => m.id)));
      return c.json(await getChatWithMessagesFromDb(chatId));
    });


