import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { connectWebsocket, disconnectWebsocket, sseController } from "@server/utils/subscriptions";
import { createBunWebSocket } from 'hono/bun';
import { streamSSE } from 'hono/streaming';
import { v4 as uuid4 } from 'uuid';

const { upgradeWebSocket, websocket } = createBunWebSocket();

// There is some problem with not exported types from Hono which doesn't let us export websocket without any
export const bunWebSocket: any = websocket;

const subscribeWS = createRoute({
  method: 'get',
  path: '/api/subscribe/ws',
  summary: 'Websockets subscribe',
  tags: ["Subscription"],
  security: [{ CookieAuth: [] }],
  responses: {
    101: {
      description: 'Subscribe (through WebSockets) to notifications',
    },
  },
});

const subscribeSSE = createRoute({
  method: 'get',
  path: '/api/subscribe/sse',
  summary: 'Server-sent events subscribe',
  tags: ["Subscription"],
  security: [{ CookieAuth: [] }],
  responses: {
    200: {
      content: {
        'text/event-stream': {
          schema: z.any(),
        }
      },
      description: 'Subscribe (through Server Sent Events) to notifications',
    },
  },
});

const openAPIHonoInstance = new OpenAPIHono();

export const subscriptionsRouter = openAPIHonoInstance
  .get(
    '/api/subscribe/ws',
    upgradeWebSocket((c) => {
      const id = uuid4();
      return {
        onOpen(evt, ws) {
          connectWebsocket(id, ws);
        },
        onMessage(evt, ws) {
            console.log('Got WS message', evt.data);
        },
        onClose(evt, ws) {
          disconnectWebsocket(id, ws);
        },
      };
    }),
  )
  .get(
    '/api/subscribe/sse',
    async (c) => {
      return streamSSE(c, async (stream) => {
        await stream.writeln('retry: 1000\n\n');
        stream.pipe(sseController.getStreamCopy());
      });
    }
  );

openAPIHonoInstance.openAPIRegistry.registerPath(subscribeWS);
openAPIHonoInstance.openAPIRegistry.registerPath(subscribeSSE);

