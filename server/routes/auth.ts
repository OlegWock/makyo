import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { MiddlewareHandler } from "hono";
import { getCookie, setCookie, setSignedCookie } from 'hono/cookie';
import { HTTPException } from 'hono/http-exception'

// TODO: current cookie auth requires site being hosted either on localhost or on http. Since we send token plaintext
// that's actually good, but might want to include check in AuthGate to show user a message

const AuthCheckSchema = z
  .object({
    valid: z.literal(true),
  })
  .openapi('AuthCheckResponse')

const loginRoute = createRoute({
  method: 'post',
  path: '/authenticate',
  summary: 'Authenticate',
  tags: ['Auth'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            token: z.string(),
          })
        }
      }
    }
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: AuthCheckSchema,
        },
      },
      description: 'Pass token, get secure cookie',
    },
  },
});

const verifyRoute = createRoute({
  method: 'get',
  path: '/api/auth/verify',
  summary: 'Verify auth cookie',
  tags: ['Auth'],
  security: [{ CookieAuth: [] }],
  responses: {
    200: {
      content: {
        'application/json': {
          schema: AuthCheckSchema,
        },
      },
      description: 'Check if cookie is in place',
    },
  },
});

const AUTH_COOKIE = 'token';

if (!process.env.KATUKO_API_TOKEN) {
  console.error(`You must set KATUKO_API_TOKEN env variable`);
  process.exit(1);
}

const safeCompare = (s1: string, s2: string) => {
  const hasher1 = new Bun.CryptoHasher("sha256");
  hasher1.update(s1);
  const hash1 = hasher1.digest('hex');
  const hasher2 = new Bun.CryptoHasher("sha256");
  hasher2.update(s2);
  const hash2 = hasher2.digest('hex');
  return hash1 === hash2;
}

const validateToken = (token: string | null) => {
  if (!token || !safeCompare(token, process.env.KATUKO_API_TOKEN!)) {
    const res = new Response("Unauthorized", {
      status: 401,
    });
    throw new HTTPException(401, { res });
  }
}

export const cookieAuthMiddleware = (): MiddlewareHandler => async (c, next) => {
  const tokenFromCookie = getCookie(c, AUTH_COOKIE) ?? null;
  validateToken(tokenFromCookie);

  return next();
};

export const authRouter = new OpenAPIHono()
  .openapi(loginRoute, (c) => {
    const { token } = c.req.valid('json');
    validateToken(token);

    setCookie(c, AUTH_COOKIE, token, {
      secure: true,
      httpOnly: true,
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 300),
    });
    return c.json({
      valid: true,
    } as const);
  })
  .openapi(verifyRoute, async (c) => {
    return c.json({
      valid: true
    } as const);
  });

