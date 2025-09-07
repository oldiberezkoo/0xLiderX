import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

export const JWT_SECRET = process.env.JWT_SECRET;
export const ACCESS_EXPIRES_IN = "15m";
export const REFRESH_EXPIRES_IN = "30d";
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET must be defined in environment variables");
}

export interface JwtVerifyResult {
  valid: boolean;
  expired: boolean;
  decoded: jwt.JwtPayload | null;
}

export function signAccessToken(payload: object): string {
  return jwt.sign(payload, JWT_SECRET!, { expiresIn: ACCESS_EXPIRES_IN });
}

export function signRefreshToken(payload: object): string {
  return jwt.sign(payload, JWT_SECRET!, { expiresIn: REFRESH_EXPIRES_IN });
}

export function verifyJwt(token: string): JwtVerifyResult {
  try {
    const decoded = jwt.verify(token, JWT_SECRET!) as jwt.JwtPayload;
    return {
      valid: true,
      expired: false,
      decoded,
    };
  } catch (error) {
    if (error instanceof Error) {
      return {
        valid: false,
        expired: error.message === "jwt expired",
        decoded: null,
      };
    }
    return {
      valid: false,
      expired: false,
      decoded: null,
    };
  }
}
