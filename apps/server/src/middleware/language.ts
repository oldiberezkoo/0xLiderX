// middlewares/i18n.ts
import type { Context, Next } from "hono";
import i18next from "../languages/i18n.js";

/**
 * Парсит Accept-Language (включая q=) и возвращает массив языковых тегов
 * в порядке предпочтения: ["ru-RU","ru","en-US","en",...]
 */
function parseAcceptLanguage(header: string | null): string[] {
  if (!header) return [];
  return header
    .split(",")
    .map((part) => {
      const [range, qPart] = part.trim().split(";");
      let q = 1;
      if (qPart && qPart.startsWith("q=")) {
        const parsed = parseFloat(qPart.split("=")[1]);
        if (!Number.isNaN(parsed)) q = parsed;
      }
      return { range: range.trim(), q };
    })
    .filter((x) => x.range)
    .sort((a, b) => b.q - a.q)
    .map((x) => x.range);
}

/**
 * Выбирает первый доступный locale:
 *  1) точный тег (en-US)
 *  2) базовый тег (en)
 *  3) fallback
 */
function negotiateLocale(
  preferences: string[],
  hasBundle: (lng: string) => boolean,
  fallback: string
): string {
  for (const pref of preferences) {
    // пробуем точный
    if (hasBundle(pref)) return pref;
    // пробуем базовый (en-US -> en)
    const base = pref.split("-")[0];
    if (base && base !== pref && hasBundle(base)) return base;
  }
  return fallback;
}

export async function i18nMiddleware(c: Context, next: Next) {
  // 1) Убедиться, что i18next проинициализирован на старте приложения.
  //    Middleware не должен дожидаться инициализации каждый запрос.
  if (!(i18next as any).isInitialized) {
    // предупреждаем — но продолжаем с fallback
    console.warn(
      "[i18n] i18next not initialized — make sure to init at app startup"
    );
  }

  // 2) Поддерживаем стандартный заголовок и (опционально) X-Accept-Language
  //    (т.е. если у вас кастомный клиент — он тоже будет работать).
  const rawHeader =
    c.req.header("Accept-Language") ??
    c.req.header("X-Accept-Language") ??
    null;
  const prefs = parseAcceptLanguage(rawHeader);
  if (!(i18next as any).isInitialized) {
    console.warn("[i18n] i18next not initialized");
  }

  // 3) Определяем fallback (i18next может иметь fallbackLng: string | string[])
  const fallbackConfig = i18next.options?.fallbackLng;
  const fallback = Array.isArray(fallbackConfig)
    ? fallbackConfig[0]
    : String(fallbackConfig || "ru");

  // 4) Проверка наличия ресурсов в namespace 'translation' (изменить при необходимости)
  const hasBundle = (lng: string) =>
    i18next.hasResourceBundle(lng, "translation");

  // 5) Неготиэйтинг
  const chosen = negotiateLocale(prefs, hasBundle, fallback);

  // 6) HTTP-хэдеры — полезно для кэширования / прокси
  c.header("Content-Language", chosen);
  // Важно: Vary сигнализирует прокси/кэшам, что ответ зависит от Accept-Language
  c.header("Vary", "Accept-Language");

  // 7) Быстрая привязка t-функции для запроса — используем getFixedT чтобы не передавать lng каждый вызов
  const t = i18next.getFixedT(chosen, "translation");
  c.set("t", t);
  c.set("lang", chosen);

  await next();
}
