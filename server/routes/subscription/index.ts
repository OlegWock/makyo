import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { sseEmitter } from "@server/utils/subscriptions";
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
      let eventListener: (messageStr: string) => void;
      
      return {
        onOpen(evt, ws) {
          eventListener = (messageStr) => {
            ws.send(messageStr);
          };
          sseEmitter.addListener('message', eventListener);
        },
        onMessage(evt, ws) {
          console.log('Got WS message', evt.data);
        },
        onClose(evt, ws) {
          sseEmitter.removeListener('message', eventListener);
        },
      };
    }),
  )
  .get(
    '/api/subscribe/sse',
    async (c) => {
      return streamSSE(c, async (stream) => {
        await stream.write('retry: 1000\n\n');
        const eventHandler = (messageStr: string) => {
          if (c.req.raw.signal.aborted) {
            sseEmitter.removeListener('message', eventHandler);
            return;
          }
          stream.write(`data: ${messageStr}\n\n`);
        };
        sseEmitter.addListener('message', eventHandler);
      });
    }
  );

openAPIHonoInstance.openAPIRegistry.registerPath(subscribeWS);
openAPIHonoInstance.openAPIRegistry.registerPath(subscribeSSE);

