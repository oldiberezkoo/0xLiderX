// schema/user.arktype.ts
import { type } from "arktype";

export const roles = {
  user: "user",
  admin: "admin",
  manager: "manager",
  guest: "guest",
  developer: "developer",
} as const;

// Явно прописываем union литералов — это даёт корректную инференцию
export const Role = type(
  "'user' | 'admin' | 'manager' | 'guest' | 'developer'"
);
export type Role = typeof Role.infer;

// Основная схема пользователя
export const UserType = type({
  // валидируем e-mail и сразу нормализуем (trim + toLowerCase)
  email: type("string.email").pipe((s: string) => s.trim().toLowerCase()),

  // пароль — простой string (хешировать в mongoose pre-save)
  password: "string",

  // опционально
  "avatar?": "string",

  // дефолт true
  isActive: "boolean = true",

  name: "string",

  // enum + дефолт
  role: "'user' | 'admin' | 'manager' | 'guest' | 'developer' = 'guest'",

  // массив строк по умолчанию пустой
  refreshTokens: "string[] = []",

  // timestamps (опционально)
  "createdAt?": "date",
  "updatedAt?": "date",
});

export type User = typeof UserType.infer;
