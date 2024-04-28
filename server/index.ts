import { OpenAPIHono } from '@hono/zod-openapi';
import { cors } from 'hono/cors';
import { apiReference } from '@scalar/hono-api-reference';
import { prettyJSON } from 'hono/pretty-json'
import { authRouter, cookieAuthMiddleware } from '@server/routes/auth';
import { configurationRouter } from '@server/routes/configuration';
import { providersRouter } from '@server/routes/providers';
import { chatsRouter } from '@server/routes/chats';
import { bunWebSocket, subscriptionsRouter } from '@server/routes/subscription';
import { Context, Env } from 'hono';
import { HTTPException } from 'hono/http-exception';

const app = new OpenAPIHono();

app.use('/*', cors({
  origin: ['http://localhost:8441'],
  allowHeaders: ['Content-Type'],
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  credentials: true,
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
    title: 'Katuko API',
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

app.get('*', (c) => {
  // TODO:
  return c.text('Should serve static resources!');
});

app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return c.json({
      code: err.status,
      message: err.message,
    }, err.status);
  }
  return c.res;
})

export type ApiType = typeof router;

export default {
  port: 8440,
  fetch: app.fetch,
  websocket: bunWebSocket,
};
