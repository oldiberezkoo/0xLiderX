import { type } from "arktype";
import i18next from "../languages/i18n.js";
export const AuthValidationResult = type({
  ok: "true",
  token: "string",
}).or({
  ok: "false",
  status: "number",
  message: "string",
});

export type AuthValidationResult = typeof AuthValidationResult.infer;

export async function validateAuthHeader(
  authHeader: string | null
): Promise<AuthValidationResult> {
  if (!authHeader) {
    return {
      ok: false,
      status: 400,
      message: i18next.t("AuthurinizationTokenRequired"),
    };
  }

  const match = /^Bearer\s+(.+)$/.exec(authHeader);
  if (!match) {
    return {
      ok: false,
      status: 401,
      message: i18next.t("AuthurinizationTokenFormatInvalid"),
    };
  }

  const token = match[1].trim();
  if (!token) {
    return {
      ok: false,
      status: 401,
      message: i18next.t("AuthurinizationTokenNull"),
    };
  }

  const result = { ok: true as const, token };
  const validated = AuthValidationResult(result);
  if (validated instanceof Error) {
    return {
      ok: false,
      status: 500,
      message: i18next.t("InternalValidationError"),
    };
  }

  return result;
}
