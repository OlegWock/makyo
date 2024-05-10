import { OpenAPIHono } from '@hono/zod-openapi';
import { cors } from 'hono/cors';
import { apiReference } from '@scalar/hono-api-reference';
import { prettyJSON } from 'hono/pretty-json'
import { authRouter, cookieAuthMiddleware } from '@server/routes/auth';
import { configurationRouter } from '@server/routes/configuration';
import { providersRouter } from '@server/routes/providers';
import { chatsRouter } from '@server/routes/chats';
import { subscriptionsRouter } from '@server/routes/subscription';
import { HTTPException } from 'hono/http-exception';
import { serveStatic } from './static';
import { resolve } from 'path';
import { bunWebSocket } from '@server/utils/websockets';

const app = new OpenAPIHono();

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
  .route('/', configurationRouter);

app.openAPIRegistry.registerComponent('securitySchemes', 'CookieAuth', {
  type: 'apiKey',
  in: 'cookie',
  name: 'token'
});

app.doc('/swagger.json', {
  openapi: '3.0.0',
  info: {
    version: '1.0.0',
    title: 'Makyo API',
  },
});

app.get(
  '/scalar',
  apiReference({
    spec: {
      url: '/swagger.json',
    },
    theme: 'kepler',
  }),
);

console.log('Will be serving content of', resolve(process.cwd(), process.env.MAKYO_FRONTEND_FILES_PATH!), 'as static files');
app.get('*', serveStatic({
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

export type ApiType = typeof router;

export default {
  port: 8440,
  fetch: app.fetch,
  websocket: bunWebSocket,
};
