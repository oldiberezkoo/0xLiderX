import { Hono } from "hono";
import { logger } from "hono/logger";

import { i18nMiddleware } from "@/middleware/language";
import dotenv from "dotenv";
import { cors } from "hono/cors";
dotenv.config();

export const app = new Hono();
app.use(
  "*",
  cors({
    origin: [process.env.CORS_ORIGIN! as string],
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "OPTIONS", "UPDATE", "DELETE"],
    credentials: true,
  })
);

app.use("*", async (c, next) => {
  if (c.req.path !== "/api/online") {
    return logger()(c, next);
  }

  return next();
});

app.use("*", i18nMiddleware);
app.get("/", (c) => {
  return c.json({
    AuthorizationTokenRequired: c.var.t("AuthorizationTokenRequired"),
    InternalValidationError: c.var.t("InternalValidationError"),
  });
});
export default app;
