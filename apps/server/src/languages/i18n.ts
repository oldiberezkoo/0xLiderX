import i18next from "i18next";
import Backend from "i18next-fs-backend";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

await i18next.use(Backend).init({
  fallbackLng: "en",
  preload: ["en", "ru", "uz"],
  ns: ["translation"],
  defaultNS: "translation",
  backend: {
    loadPath: join(__dirname, "locales/{{lng}}/{{ns}}.json"),
  },
  interpolation: {
    escapeValue: false,
  },
});

export default i18next;
