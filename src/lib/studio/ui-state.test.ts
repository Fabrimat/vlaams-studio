import { describe, expect, it } from "vitest"

import { scenarios } from "@/lib/practice-data"
import {
  cloneDefaultPreferences,
  focusForScenario,
  metricDetailFocus,
  panelTitleFor,
  updateVocabularyGoals,
} from "@/lib/studio/ui-state"

describe("studio UI state helpers", () => {
  it("toggles vocabulary goals while keeping at least one selected", () => {
    expect(updateVocabularyGoals(["broodsoorten"], "prijzen")).toEqual(["broodsoorten", "prijzen"])
    expect(updateVocabularyGoals(["broodsoorten", "prijzen"], "prijzen")).toEqual(["broodsoorten"])
    expect(updateVocabularyGoals(["prijzen"], "prijzen")).toEqual(["prijzen"])
  })

  it("creates a setup focus from a selected scenario", () => {
    const focus = focusForScenario(scenarios[0])

    expect(focus).toEqual({
      selectedVocabularyGoals: ["broodsoorten"],
      focusedGrammar: "Vraagzinnen met 'zou graag'",
    })
  })

  it("clones default preferences for local reset without sharing references", () => {
    const defaults = { selectedVocabularyGoals: ["broodsoorten"], nested: { score: 78 } }
    const clone = cloneDefaultPreferences(defaults)

    clone.selectedVocabularyGoals.push("prijzen")
    clone.nested.score = 10

    expect(defaults).toEqual({ selectedVocabularyGoals: ["broodsoorten"], nested: { score: 78 } })
  })
})

describe("panelTitleFor", () => {
  it("maps panel types to message keys", () => {
    expect(panelTitleFor({ type: "settings" })).toBe("panel.title.settings")
    expect(panelTitleFor({ type: "reset" })).toBe("panel.title.reset")
  })

  it("uses the metric label for metric panels", () => {
    expect(panelTitleFor({ type: "metric", metric: { label: "Uitspraak", score: 1, note: "x" } })).toBe(
      "Uitspraak",
    )
  })
})

describe("metricDetailFocus", () => {
  it("returns the lowercased label for interpolation", () => {
    expect(metricDetailFocus({ label: "Uitspraak", score: 1, note: "x" })).toBe("uitspraak")
  })
})
