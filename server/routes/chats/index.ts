import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { db } from "@server/db";
import { getMessageHistoryDownwards } from "@server/db/queries/messages";
import { chat, message } from "@server/db/schema";
import { getProviderById } from "@server/providers";
import { augmentChatWithLastMessage, augmentMessagesWithModelAndChatTitle, getChatWithMessagesFromDb, getMessageFromDb, regenerateResponseForMessage, sendMessageAndSave } from "@server/routes/chats/utils";
import { ChatSchema, ChatWithMessagesSchema, EditMessageSchema, MessageSchema, NewChatSchema, NewMessageSchema, SearchResultSchema, UpdateChatSchema } from "@server/schemas/chats";
import { createTitlePrompt } from "@server/utils/prompts";
import { omit, serialize } from "@server/utils/serialization";
import { broadcastSubscriptionMessage } from "@server/utils/subscriptions";
import { transformStringToNumber } from "@server/utils/zod";
import { and, eq, inArray, isNull, InferInsertModel, like } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";

const getChats = createRoute({
  method: 'get',
  path: '/api/chats',
  summary: 'Get all chats',
  tags: ['Chats'],
  security: [{ CookieAuth: [] }],
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.array(ChatSchema),
        },
      },
      description: '',
    },
  },
});

const search = createRoute({
  method: 'get',
  path: '/api/search',
  summary: 'Search chats and messages',
  tags: ['Chats'],
  security: [{ CookieAuth: [] }],
  request: {
    query: z.object({
      searchQuery: z.string().openapi({
        param: {
          name: 'searchQuery',
          in: 'query',
        },
      })
    })
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.array(SearchResultSchema),
        },
      },
      description: '',
    },
  },
});

const createChat = createRoute({
  method: 'post',
  path: '/api/chats',
  summary: 'Create new chat',
  tags: ['Chats'],
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
      description: '',
    },
  },
});

const getChatWithMessages = createRoute({
  method: 'get',
  path: '/api/chats/{chatId}',
  summary: 'Get chat details with messages',
  tags: ['Chats'],
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
      description: '',
    },
  },
});

const editChat = createRoute({
  method: 'patch',
  path: '/api/chats/{chatId}',
  summary: 'Update chat parameters',
  tags: ['Chats'],
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
          schema: UpdateChatSchema,
        }
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
      description: '',
    },
  },
});

const deleteChat = createRoute({
  method: 'delete',
  path: '/api/chats/{chatId}',
  summary: 'Delete chat',
  tags: ['Chats'],
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
          schema: z.object({}),
        },
      },
      description: '',
    },
  },
});

const sendMessage = createRoute({
  method: 'put',
  path: '/api/chats/{chatId}',
  summary: 'Send message',
  tags: ['Chats'],
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
      description: '',
    },
  },
});

const regenerateResponse = createRoute({
  method: 'post',
  path: '/api/chats/{chatId}/{messageId}/regenerate',
  summary: 'Regenerate AI response',
  tags: ['Chats'],
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
      description: '',
    },
  },
});

const duplicateResponse = createRoute({
  method: 'post',
  path: '/api/chats/{chatId}/{messageId}/duplicate',
  summary: 'Duplicate AI message',
  tags: ['Chats'],
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
      description: '',
    },
  },
});

const editMessage = createRoute({
  method: 'patch',
  path: '/api/chats/{chatId}/{messageId}',
  summary: 'Edit message',
  tags: ['Chats'],
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
    body: {
      content: {
        'application/json': {
          schema: EditMessageSchema,
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
      description: '',
    },
  },
});

const deleteMessage = createRoute({
  method: 'delete',
  path: '/api/chats/{chatId}/{messageId}',
  summary: 'Delete message',
  tags: ['Chats'],
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
          schema: ChatWithMessagesSchema,
        },
      },
      description: '',
    },
  },
});


export const chatsRouter = new OpenAPIHono()
  .openapi(getChats, async (c) => {
    const chats = await db.select().from(chat);
    const augmented = await Promise.all(chats.map(c => augmentChatWithLastMessage(c)));
    augmented.sort((a, b) => b.lastMessageAt - a.lastMessageAt);
    return c.json(augmented);
  })
  .openapi(search, async (c) => {
    const { searchQuery } = c.req.valid('query');
    const [rawChats, rawMessages] = await Promise.all([
      db.select().from(chat).where(like(chat.title, `%${searchQuery}%`)),
      db.select().from(message).where(like(message.text, `%${searchQuery}%`)),
    ]);
    const chats = await Promise.all(rawChats.map(augmentChatWithLastMessage));
    const messages = await augmentMessagesWithModelAndChatTitle(rawMessages);
    const response = [
      ...chats.map(c => ({...c, type: 'chat' as const})),
      ...messages,
    ];
    return c.json(response);
  })
  .openapi(createChat, async (c) => {
    const { providerId, modelId, text, parameters } = c.req.valid('json');
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
  .openapi(getChatWithMessages, async (c) => {
    const { chatId } = c.req.valid('param');
    return c.json(await getChatWithMessagesFromDb(chatId));
  })
  .openapi(editChat, async (c) => {
    const { chatId } = c.req.valid('param');
    const { title, parameters } = c.req.valid('json');
    let payload: Partial<InferInsertModel<typeof chat>> = {};
    if (title) payload.title = title;
    if (parameters) {
      payload.system = parameters.system ?? null;
      payload.temperature = parameters.temperature ?? null;
    }

    await db.update(chat).set(payload).where(eq(chat.id, chatId)).returning();

    return c.json(await getChatWithMessagesFromDb(chatId));
  })
  .openapi(deleteChat, async (c) => {
    const { chatId } = c.req.valid('param');
    await db.delete(chat).where(eq(chat.id, chatId));
    return c.json({});
  })
  .openapi(sendMessage, async (c) => {
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

    await sendMessageAndSave({
      provider,
      modelId,
      text,
      parentId: parentId,
      chatId,
      system: chatFromDb.system ?? undefined,
      temperature: chatFromDb.temperature ?? undefined,
    });
    return c.json(await getChatWithMessagesFromDb(chatId));
  })
  .openapi(regenerateResponse, async (c) => {
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
  .openapi(duplicateResponse, async (c) => {
    const { chatId, messageId } = c.req.valid('param');
    const { messageFromDb } = await getMessageFromDb(chatId, messageId);
    if (!messageFromDb.parentId || messageFromDb.sender === 'user') {
      throw new HTTPException(400, { message: `can't duplicate user messages` });
    }

    const [messageCopy] = await db.insert(message).values(omit(messageFromDb, ['id', 'createdAt'])).returning();
    return c.json(serialize(messageCopy));
  })
  .openapi(editMessage, async (c) => {
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
  .openapi(deleteMessage, async (c) => {
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
    await db.delete(message).where(eq(message.id, messageId));
    return c.json(await getChatWithMessagesFromDb(chatId));
  });


