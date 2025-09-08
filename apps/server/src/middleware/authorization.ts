import type { Context, Next } from "hono";
import { verifyJwt } from "../utiles/jwt.utils";
import i18next from "i18next";

export async function authenticate(c: Context, next: Next) {
  const auth = c.req.header("authorization");
  if (!auth) return c.text(i18next.t("AuthorizationTokenRequired"), 401);
  const [scheme, token] = auth.split(/\s+/);
  if (!/^Bearer$/i.test(scheme) || !token) {
    return c.text(i18next.t("AuthorizationTokenFormatInvalid"), 401);
  }

  const { decoded, expired, valid } = verifyJwt(token);

  if (expired) {
    return c.text(i18next.t("JWT_EXPIRED"), 401);
  }

  if (!valid || !decoded) {
    return c.text(i18next.t("JWT_INVALID"), 401);
  }

  c.set('user', decoded);
  await next();
}
