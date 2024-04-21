import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";

const AuthCheckSchema = z
  .object({
    valid: z.literal(true),
  })
  .openapi('AuthCheckSchema')

const route = createRoute({
  method: 'get',
  path: '/api/auth/validate',
  security: [{ BearerAuth: [] }],
  responses: {
    200: {
      content: {
        'application/json': {
          schema: AuthCheckSchema,
        },
      },
      description: 'Check token validity',
    },
  },
});

export const authRouter = new OpenAPIHono()
  .openapi(route, (c) => {
    return c.json({
      valid: true,
    } as const);
  });


