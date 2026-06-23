import type { MessageKey } from "@/lib/i18n/locales"
import type { FeedbackItem, Scenario } from "@/lib/practice-data"

export type StudioPanelType = "profile" | "settings" | "reset" | "setup" | "metric" | "grammar"

export function updateVocabularyGoals(currentGoals: string[], goal: string) {
  const exists = currentGoals.includes(goal)
  const nextGoals = exists ? currentGoals.filter((item) => item !== goal) : [...currentGoals, goal]

  return nextGoals.length ? nextGoals : [goal]
}

export function focusForScenario(scenario: Scenario) {
  return {
    selectedVocabularyGoals: [scenario.vocabularyGoals[0] ?? scenario.vocabulary[0] ?? "spreken"],
    focusedGrammar: scenario.grammarPoints[0] ?? null,
  }
}

export function panelTitleFor(
  panel: { type: StudioPanelType; metric?: FeedbackItem },
): MessageKey | string {
  if (panel.type === "profile") return "panel.title.profile"
  if (panel.type === "settings") return "panel.title.settings"
  if (panel.type === "reset") return "panel.title.reset"
  if (panel.type === "setup") return "panel.title.setup"
  if (panel.type === "grammar") return "panel.title.grammar"
  return panel.metric?.label ?? "panel.title.detailsFallback"
}

export function metricDetailFocus(metric: FeedbackItem) {
  return metric.label.toLowerCase()
}

export function cloneDefaultPreferences<T>(defaults: T): T {
  return JSON.parse(JSON.stringify(defaults)) as T
}
