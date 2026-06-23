import { nl, type MessageKey } from "./messages/nl"
import { en } from "./messages/en"

export type { MessageKey }

export const baseLocale = "nl"

// Add a language: create messages/{code}.ts then add one entry here.
export const locales = {
  en: { nativeName: "English", messages: en },
  nl: { nativeName: "Nederlands", messages: nl },
} as const

export type UiLanguage = keyof typeof locales
export const uiLanguages = Object.keys(locales) as UiLanguage[]

export function isUiLanguage(value: string): value is UiLanguage {
  return value in locales
}

export function translate(
  messages: Record<MessageKey, string>,
  key: MessageKey,
  vars?: Record<string, string | number>,
): string {
  const template = messages[key] ?? locales[baseLocale].messages[key] ?? key
  if (!vars) return template
  return template.replace(/\{(\w+)\}/g, (match, token) =>
    token in vars ? String(vars[token]) : match,
  )
}
