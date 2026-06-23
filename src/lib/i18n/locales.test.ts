import { describe, expect, it } from "vitest"

import { locales, baseLocale, translate, uiLanguages, isUiLanguage } from "./locales"

const baseKeys = Object.keys(locales[baseLocale].messages).sort()

describe("locale registry", () => {
  it("every registered locale has exactly the base key set", () => {
    for (const code of uiLanguages) {
      expect(Object.keys(locales[code].messages).sort()).toEqual(baseKeys)
    }
  })

  it("recognizes registered languages and rejects others", () => {
    expect(isUiLanguage("en")).toBe(true)
    expect(isUiLanguage("xx")).toBe(false)
  })
})

describe("translate", () => {
  it("returns the plain string when no vars", () => {
    expect(translate(locales.en.messages, "rail.settings")).toBe("Settings")
  })

  it("interpolates {tokens}", () => {
    expect(translate(locales.en.messages, "rail.progress.eyebrow", { level: "A2" })).toBe(
      "Progress A2",
    )
  })

  it("falls back to the base locale for a missing key", () => {
    const partial = { ...locales.en.messages } as Record<string, string>
    delete partial["rail.settings"]
    expect(translate(partial as typeof locales.en.messages, "rail.settings")).toBe("Instellingen")
  })
})
