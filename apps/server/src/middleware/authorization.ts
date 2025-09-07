import type { Context, Next } from "hono";
import { verifyJwt } from "../utiles/jwt.utils";
import i18next from "i18next";

export async function authenticate(c: Context, next: Next) {
  const accessToken = c.req.header("Authorization")?.split(" ")[1];
  if (!accessToken) {
    return c.text(i18next.t("AuthorizationTokenRequired"), 401);
  }

  const { decoded, expired } = verifyJwt(accessToken);

  if (expired) {
    return c.text(i18next.t("JWT_EXPIRED"), 401);
  }

  if (!decoded) {
    return c.text(i18next.t("JWT_INVALID"), 401);
  }

  c.set('user', decoded);
  await next();
}
