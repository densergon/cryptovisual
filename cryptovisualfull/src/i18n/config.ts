import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import enTranslation from "./locales/en/translation.json";
import esTranslation from "./locales/es/translation.json";

export const resources = {
	en: { translation: enTranslation.translation },
	es: { translation: esTranslation.translation },
} as const;

i18n
	.use(LanguageDetector)
	.use(initReactI18next)
	.init({
		resources,
		fallbackLng: "en",
		supportedLngs: ["en", "es"],
		interpolation: {
			escapeValue: false,
		},
		detection: {
			order: ["navigator", "htmlTag", "path", "subdomain"],
			caches: ["localStorage"],
		},
	});

export default i18n;
