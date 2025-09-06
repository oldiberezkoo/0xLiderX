import type { Context, Next } from "hono";
import i18next from "../languages/i18n.js";

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

function negotiateLocale(
  preferences: string[],
  hasBundle: (lng: string) => boolean,
  fallback: string
): string {
  for (const pref of preferences) {
    if (hasBundle(pref)) return pref;
    const base = pref.split("-")[0];
    if (base && base !== pref && hasBundle(base)) return base;
  }
  return fallback;
}

export async function i18nMiddleware(c: Context, next: Next) {
  if (!(i18next as any).isInitialized) {
    console.warn(
      "[i18n] i18next not initialized — make sure to init at app startup"
    );
  }
  const rawHeader =
    c.req.header("Accept-Language") ??
    c.req.header("X-Accept-Language") ??
    null;
  const prefs = parseAcceptLanguage(rawHeader);
  if (!(i18next as any).isInitialized) {
    console.warn("[i18n] i18next not initialized");
  }

  const fallbackConfig = i18next.options?.fallbackLng;
  const fallback = Array.isArray(fallbackConfig)
    ? fallbackConfig[0]
    : String(fallbackConfig || "ru");

  const hasBundle = (lng: string) =>
    i18next.hasResourceBundle(lng, "translation");

  const chosen = negotiateLocale(prefs, hasBundle, fallback);

  c.header("Content-Language", chosen);
  c.header("Vary", "Accept-Language");

  const t = i18next.getFixedT(chosen, "translation");
  c.set("t", t);
  c.set("lang", chosen);

  await next();
}
