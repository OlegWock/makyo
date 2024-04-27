import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { connectWebsocket, disconnectWebsocket } from "@server/utils/websockets";
import { createBunWebSocket } from 'hono/bun';
import { v4 as uuid4 } from 'uuid';

const { upgradeWebSocket, websocket } = createBunWebSocket();

// There is some problem with not exported types from Hono which doesn't let us export websocket without any
export const bunWebSocket: any = websocket;

const subscribe = createRoute({
  method: 'get',
  path: '/api/subscribe',
  summary: 'Websockets subscribe',
  tags: ["Websockers"],
  security: [{ CookieAuth: [] }],
  responses: {
    101: {
      description: 'Subscribe (through WebSockets) to notifications',
    },
  },
});

const openAPIHonoInstance = new OpenAPIHono();

export const websocketsRouter = openAPIHonoInstance
  .get(
    '/api/subscribe',
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
    })
  );

openAPIHonoInstance.openAPIRegistry.registerPath(subscribe);

