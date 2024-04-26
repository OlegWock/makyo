import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { db } from "@server/db";
import { chat, message } from "@server/db/schema";
import { getProviderById } from "@server/providers";
import { getChatWithMessagesFromDb, regenerateResponseForMessage, sendMessageAndSave } from "@server/routes/chats/utils";
import { ChatSchema, ChatWithMessagesSchema, MessageSchema, NewChatSchema, NewMessageSchema } from "@server/schemas/chats";
import { generateName } from "@server/utils/misc";
import { createTitlePrompt } from "@server/utils/prompts";
import { serialize } from "@server/utils/serialization";
import { broadcastWSMessage } from "@server/utils/websockets";
import { transformStringToNumber } from "@server/utils/zod";
import { eq } from "drizzle-orm";

const getChats = createRoute({
  method: 'get',
  path: '/api/chats',
  security: [{ CookieAuth: [] }],
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.array(ChatSchema),
        },
      },
      description: 'Get all chats',
    },
  },
});

const createChat = createRoute({
  method: 'post',
  path: '/api/chats',
  security: [{ CookieAuth: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: NewChatSchema,
        },
      }
    }
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: ChatSchema,
        },
      },
      description: 'Get all chats',
    },
  },
});

const getChatWithMessages = createRoute({
  method: 'get',
  path: '/api/chats/{chatId}',
  security: [{ CookieAuth: [] }],
  request: {
    params: z.object({
      chatId: z.string().openapi({
        param: {
          name: 'chatId',
          in: 'path',
        },
      }).transform(transformStringToNumber)
    }),
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: ChatWithMessagesSchema,
        },
      },
      description: 'Get chat details with messages',
    },
  },
});

const sendMessage = createRoute({
  method: 'put',
  path: '/api/chats/{chatId}',
  security: [{ CookieAuth: [] }],
  request: {
    params: z.object({
      chatId: z.string().openapi({
        param: {
          name: 'chatId',
          in: 'path',
        },
      }).transform(transformStringToNumber)
    }),
    body: {
      content: {
        'application/json': {
          schema: NewMessageSchema,
        },
      }
    }
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: ChatWithMessagesSchema,
        },
      },
      description: 'Get all chats',
    },
  },
});

const regenerateResponse = createRoute({
  method: 'post',
  path: '/api/chats/{chatId}/{messageId}',
  security: [{ CookieAuth: [] }],
  request: {
    params: z.object({
      chatId: z.string().openapi({
        param: {
          name: 'chatId',
          in: 'path',
        },
      }).transform(transformStringToNumber),
      messageId: z.string().openapi({
        param: {
          name: 'messageId',
          in: 'path',
        },
      }).transform(transformStringToNumber)
    }),
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: MessageSchema,
        },
      },
      description: 'Get all chats',
    },
  },
})

export const chatsRouter = new OpenAPIHono()
  .openapi(getChats, async (c) => {
    const chats = await db.select().from(chat);
    return c.json(chats.map(c => serialize(c)));
  })
  .openapi(createChat, async (c) => {
    const { providerId, modelId, text } = c.req.valid('json');
    const provider = getProviderById(providerId);
    const modelSupported = provider.isModelSupported(modelId);
    if (!modelSupported) {
      throw new Error('unknown model');
    }

    const tmpName = text.length > 40 ? text.slice(0, 39) + '…' : text;
    const [newChat] = await db.insert(chat).values({ title: tmpName, providerId, modelId, lastMessageAt: new Date() }).returning();

    provider.chat(modelId, [{ sender: 'user', text: createTitlePrompt(text) }]).then((newTitle) => {
      broadcastWSMessage({
        type: 'updateChat',
        data: {
          chatId: newChat.id,
          title: newTitle,
        }
      });
      return db.update(chat).set({ title: newTitle }).where(eq(chat.id, newChat.id)).returning();
    });

    await sendMessageAndSave({
      provider,
      modelId,
      text,
      chatId: newChat.id,
      parentId: null,
    });

    return c.json(serialize(newChat));
  })
  .openapi(getChatWithMessages, async (c) => {
    const { chatId } = c.req.valid('param');
    return c.json(await getChatWithMessagesFromDb(chatId));
  })
  .openapi(sendMessage, async (c) => {
    const { chatId } = c.req.valid('param');
    const chatFromDb = await db.query.chat.findFirst({
      where: eq(chat.id, chatId)
    });
    if (!chatFromDb) {
      throw new Error('unknown chat');
    }
    const { parentId, text } = c.req.valid('json');
    const provider = getProviderById(chatFromDb.providerId);
    const modelId = chatFromDb.modelId;

    await sendMessageAndSave({
      provider,
      modelId,
      text,
      parentId: parentId,
      chatId,
    });
    return c.json(await getChatWithMessagesFromDb(chatId));
  })
  .openapi(regenerateResponse, async (c) => {
    const { chatId, messageId } = c.req.valid('param');
    const chatFromDb = await db.query.chat.findFirst({
      where: eq(chat.id, chatId)
    });
    if (!chatFromDb) {
      throw new Error('unknown chat');
    }
    const messageFromDb = await db.query.message.findFirst({
      where: eq(message.id, messageId)
    });
    if (!messageFromDb || messageFromDb.chatId !== chatId) {
      throw new Error('unknown message');
    }
    if (!messageFromDb.parentId || messageFromDb.sender === 'user') {
      throw new Error(`can't regenerate user messages`);
    }

    const provider = getProviderById(chatFromDb.providerId);
    const modelId = chatFromDb.modelId;

    const responseMessage = await regenerateResponseForMessage({
      provider,
      modelId,
      parentId: messageFromDb.parentId,
      chatId,
    });

    return c.json(serialize(responseMessage));
  });


