"use client"

import { createContext, useContext, useMemo, type ReactNode } from "react"

import { locales, translate, type MessageKey, type UiLanguage } from "./locales"

type TranslateFn = (key: MessageKey, vars?: Record<string, string | number>) => string

const TranslateContext = createContext<TranslateFn | null>(null)

export function LanguageProvider({
  language,
  children,
}: {
  language: UiLanguage
  children: ReactNode
}) {
  const t = useMemo<TranslateFn>(() => {
    const messages = locales[language].messages
    return (key, vars) => translate(messages, key, vars)
  }, [language])

  return <TranslateContext.Provider value={t}>{children}</TranslateContext.Provider>
}

export function useT(): TranslateFn {
  const t = useContext(TranslateContext)
  if (!t) throw new Error("useT must be used within a LanguageProvider")
  return t
}
