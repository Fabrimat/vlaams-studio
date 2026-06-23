export const translationLanguages: { code: string; nativeName: string }[] = [
  { code: "en", nativeName: "English" },
  { code: "fr", nativeName: "Français" },
  { code: "de", nativeName: "Deutsch" },
  { code: "es", nativeName: "Español" },
  { code: "it", nativeName: "Italiano" },
  { code: "pt", nativeName: "Português" },
  { code: "pl", nativeName: "Polski" },
  { code: "uk", nativeName: "Українська" },
  { code: "ru", nativeName: "Русский" },
  { code: "tr", nativeName: "Türkçe" },
  { code: "ar", nativeName: "العربية" },
  { code: "zh", nativeName: "中文" },
]

export function isTranslationLanguage(value: string): boolean {
  return translationLanguages.some((language) => language.code === value)
}
