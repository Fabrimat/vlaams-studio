import { describe, expect, it } from "vitest"

import { parsePreferencesSnapshot, defaultPreferences } from "@/lib/studio/preferences"

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
