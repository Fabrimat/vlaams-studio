import { afterEach, describe, expect, it, vi } from "vitest"

import { parsePreferencesSnapshot, defaultPreferences, resolveDefaultUiLanguage } from "@/lib/studio/preferences"

describe("preferences language fields", () => {
  it("defaults uiLanguage to en and translationLanguage to en", () => {
    expect(defaultPreferences.uiLanguage).toBe("en")
    expect(defaultPreferences.translationLanguage).toBe("en")
  })

  it("keeps a valid uiLanguage", () => {
    const snap = JSON.stringify({ ...defaultPreferences, uiLanguage: "nl" })
    expect(parsePreferencesSnapshot(snap).uiLanguage).toBe("nl")
  })

  it("clamps an invalid uiLanguage to the default", () => {
    const snap = JSON.stringify({ ...defaultPreferences, uiLanguage: "xx" })
    expect(parsePreferencesSnapshot(snap).uiLanguage).toBe("en")
  })

  it("clamps an unknown translationLanguage to the default", () => {
    const snap = JSON.stringify({ ...defaultPreferences, translationLanguage: "zz" })
    expect(parsePreferencesSnapshot(snap).translationLanguage).toBe("en")
  })
})

describe("resolveDefaultUiLanguage", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("returns nl for nl-BE browser language", () => {
    vi.stubGlobal("navigator", { language: "nl-BE" })
    expect(resolveDefaultUiLanguage()).toBe("nl")
  })

  it("returns en for en-US browser language", () => {
    vi.stubGlobal("navigator", { language: "en-US" })
    expect(resolveDefaultUiLanguage()).toBe("en")
  })

  it("returns en for an unsupported fr-FR browser language", () => {
    vi.stubGlobal("navigator", { language: "fr-FR" })
    expect(resolveDefaultUiLanguage()).toBe("en")
  })

  it("returns en when navigator is undefined", () => {
    vi.stubGlobal("navigator", undefined)
    expect(resolveDefaultUiLanguage()).toBe("en")
  })
})

describe("parsePreferencesSnapshot with browser language resolver", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("uses browser language when uiLanguage is absent from snapshot", () => {
    vi.stubGlobal("navigator", { language: "nl-BE" })
    const snap = JSON.stringify({ ...defaultPreferences, uiLanguage: undefined })
    expect(parsePreferencesSnapshot(snap).uiLanguage).toBe("nl")
  })

  it("preserves an explicitly stored valid uiLanguage regardless of browser language", () => {
    vi.stubGlobal("navigator", { language: "nl-BE" })
    const snap = JSON.stringify({ ...defaultPreferences, uiLanguage: "en" })
    expect(parsePreferencesSnapshot(snap).uiLanguage).toBe("en")
  })
})
