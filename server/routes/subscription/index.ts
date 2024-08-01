import { Hono } from "hono";
import { broadcastSubscriptionMessage, sseEmitter } from "@server/utils/subscriptions";
import { upgradeWebSocket } from "@server/utils/websockets";
import { streamSSE } from 'hono/streaming';
import { v4 as uuid4 } from 'uuid';


const openAPIHonoInstance = new Hono();

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
        let canceled = false;
        await stream.write('retry: 1000\n\n');
        const eventHandler = (messageStr: string) => {
          if (c.req.raw.signal.aborted) {
            sseEmitter.removeListener('message', eventHandler);
            canceled = true;
            return;
          }
          stream.write(`data: ${messageStr}\n\n`);
        };
        sseEmitter.addListener('message', eventHandler);

        // Fun fact: on Linux (in Docker) connection will be closed once function returns
        // so we need to have sleep cycle here (but on Mac, everything works without it!)
        while (!canceled) {
          await Bun.sleep(1000);
        }
      });
    }
  );

