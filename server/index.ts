import { cors } from 'hono/cors';
import { prettyJSON } from 'hono/pretty-json'
import { authRouter, cookieAuthMiddleware } from '@server/routes/auth';
import { configurationRouter } from '@server/routes/configuration';
import { providersRouter } from '@server/routes/providers';
import { chatsRouter } from '@server/routes/chats';
import { subscriptionsRouter } from '@server/routes/subscription';
import { HTTPException } from 'hono/http-exception';
import { serveStatic } from './static';
import { etag } from 'hono/etag'
import { resolve } from 'path';
import { bunWebSocket } from '@server/utils/websockets';
import { presetsRouter } from '@server/routes/presets';
import { compress } from 'bun-compression';
import { Hono } from 'hono';
import { broadcastSubscriptionMessage } from '@server/utils/subscriptions';

const app = new Hono();

app.use('/*', cors({
  origin: '*',
  allowHeaders: ['Content-Type'],
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
}));
app.use('/*', prettyJSON());
app.use('/api/*', cookieAuthMiddleware());

// Attach other routes by chaining calls on top of previous .route instead of calling app.route multiple times
const router = app
  .route('/', authRouter)
  .route('/', providersRouter)
  .route('/', chatsRouter)
  .route('/', subscriptionsRouter)
  .route('/', presetsRouter)
  .route('/', configurationRouter);

console.log('Will be serving content of', resolve(process.cwd(), process.env.MAKYO_FRONTEND_FILES_PATH!), 'as static files');
app.get('*', etag(), compress(), serveStatic({
  root: resolve(process.cwd(), process.env.MAKYO_FRONTEND_FILES_PATH!),
  fallbackPath: 'index.html',
  onNotFound(path, c) {
    console.log('Not found', path);
  },
}));

app.onError((err, c) => {
  console.log('Err', err);
  if (err instanceof HTTPException) {
    return c.json({
      code: err.status,
      message: err.message,
    }, err.status);
  }
  return c.res;
});

setInterval(() => {
  broadcastSubscriptionMessage({ type: 'heartbeat', data: {} });
}, 1000);

export type ApiType = typeof router;

export default {
  port: 8440,
  fetch: app.fetch,
  websocket: {
    ...bunWebSocket,
    idleTimeout: 960, // max value (seconds)
    maxPayloadLength: 1024 * 1024 * 128,
  },
};
