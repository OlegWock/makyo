import { Hono } from "hono";
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';

import type { MiddlewareHandler } from "hono";
import { deleteCookie, getCookie, setCookie } from 'hono/cookie';
import { HTTPException } from 'hono/http-exception'


const AUTH_COOKIE = 'token';

if (!process.env.MAKYO_API_TOKEN) {
  console.error(`You must set MAKYO_API_TOKEN env variable`);
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
  if (!token || !safeCompare(token, process.env.MAKYO_API_TOKEN!)) {
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

export const authRouter = new Hono()
  .post(
    '/authenticate',
    zValidator('json', z.object({
      token: z.string(),
    })),
    (c) => {
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
  .post('/logout', async (c) => {
    deleteCookie(c, AUTH_COOKIE);
    return c.json({});
  })
  .get('/api/auth/verify', async (c) => {
    return c.json({
      valid: true
    } as const);
  });

