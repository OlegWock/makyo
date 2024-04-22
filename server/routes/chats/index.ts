import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { db } from "@server/db";
import { chat, message } from "@server/db/schema";
import { getProviderById } from "@server/providers";
import { getChatWithMessagesFromDb, sendMessageAndSave } from "@server/routes/chats/utils";
import { ChatSchema, ChatWithMessagesSchema, MessageSchema, NewChatSchema, NewMessageSchema } from "@server/schemas/chats";
import { generateName } from "@server/utils/misc";
import { omit, serialize } from "@server/utils/serialization";
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
  path: '/api/chats/{id}',
  security: [{ CookieAuth: [] }],
  request: {
    params: z.object({
      id: z.string().openapi({
        param: {
          name: 'id',
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
  path: '/api/chats/{id}',
  security: [{ CookieAuth: [] }],
  request: {
    params: z.object({
      id: z.string().openapi({
        param: {
          name: 'id',
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

    // TODO: generate proper title
    const [newChat] = await db.insert(chat).values({ title: generateName(), providerId, modelId }).returning();

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
    const { id } = c.req.valid('param');
    return c.json(await getChatWithMessagesFromDb(id));
  })
  .openapi(sendMessage, async (c) => {
    const { id } = c.req.valid('param');
    const chatFromDb = await db.query.chat.findFirst({
      where: eq(chat.id, id)
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
      chatId: id,
    });
    return c.json(await getChatWithMessagesFromDb(id));
  });


