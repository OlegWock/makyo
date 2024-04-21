import { OpenAPIHono } from '@hono/zod-openapi';
import { bearerAuth } from 'hono/bearer-auth';
import { cors } from 'hono/cors';
import { apiReference } from '@scalar/hono-api-reference';
import { prettyJSON } from 'hono/pretty-json'
import { usersRouter } from '@server/routes/users';
import { authRouter } from '@server/routes/auth';
import { configurationRouter } from '@server/routes/configuration';

const app = new OpenAPIHono();

if (!process.env.KATUKO_API_TOKEN) {
  console.error(`You must set KATUKO_API_TOKEN env variable`);
  process.exit(1);
}

app.use('/*', cors({
  origin: '*',
  allowHeaders: ['*'],
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  credentials: true,
}));
app.use('/api/*', bearerAuth({ token: process.env.KATUKO_API_TOKEN }));
app.use('/*', prettyJSON());

// Attach other routes by chaining calls on top of previous .route instead of calling app.route multiple times
const router = app
  .route('/', usersRouter)
  .route('/', authRouter)
  .route('/', configurationRouter);

app.openAPIRegistry.registerComponent('securitySchemes', 'BearerAuth', {
  type: 'http',
  scheme: 'bearer',
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

export type ApiType = typeof router;

export default {
  port: 8440,
  fetch: app.fetch,
}; 
