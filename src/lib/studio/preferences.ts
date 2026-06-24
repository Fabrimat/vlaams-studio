import { isUiLanguage, type UiLanguage } from "@/lib/i18n/locales"
import { isTranslationLanguage } from "@/lib/i18n/languages"
import { type FeedbackItem, type PracticeLevel, scenarios, seedFeedback } from "@/lib/practice-data"

export type PracticeProgress = Record<PracticeLevel, number>

export type PracticePreferences = {
  selectedLevel: PracticeLevel
  selectedScenarioId: string
  name: string
  progress: PracticeProgress
  streakDays: number
  sessionScore: number
  feedback: FeedbackItem[]
  useMaterialInSession: boolean
  activeMaterialIds: string[]
  selectedVocabularyGoals: string[]
  focusedGrammar: string | null
  correctionStyle: "gentle" | "direct"
  showCaptions: boolean
  uiLanguage: UiLanguage
  translationLanguage: string
}

export const defaultProgress: PracticeProgress = { A1: 0, A2: 0, B1: 0, B2: 0 }
export const defaultLevel: PracticeLevel = "A2"
export const defaultScenarioId = "bakery-antwerp"

export const defaultPreferences: PracticePreferences = {
  selectedLevel: defaultLevel,
  selectedScenarioId: defaultScenarioId,
  name: "",
  progress: defaultProgress,
  streakDays: 0,
  sessionScore: 0,
  feedback: seedFeedback,
  useMaterialInSession: true,
  activeMaterialIds: ["sample-bakery"],
  selectedVocabularyGoals: ["broodsoorten"],
  focusedGrammar: null,
  correctionStyle: "gentle",
  showCaptions: true,
  uiLanguage: "en",
  translationLanguage: "en",
}

export function resolveDefaultUiLanguage(): UiLanguage {
  if (typeof navigator !== "undefined" && typeof navigator.language === "string") {
    const primary = navigator.language.toLowerCase().split("-")[0]
    if (isUiLanguage(primary)) return primary
  }
  return "en"
}

export function sanitizeFeedback(items: unknown): FeedbackItem[] {
  if (!Array.isArray(items)) return seedFeedback

  const parsed = items.filter((item): item is FeedbackItem => {
    if (!item || typeof item !== "object") return false
    const candidate = item as Partial<FeedbackItem>
    return (
      typeof candidate.label === "string" &&
      typeof candidate.score === "number" &&
      typeof candidate.note === "string"
    )
  })

  return parsed.length ? parsed : seedFeedback
}

export function sanitizeStringArray(items: unknown, fallback: string[] = []) {
  if (!Array.isArray(items)) return fallback
  const parsed = items.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
  return parsed.length ? parsed : fallback
}

export function parsePreferencesSnapshot(snapshot: string): PracticePreferences {
  try {
    const parsed = JSON.parse(snapshot) as Partial<PracticePreferences>
    const selectedScenarioId =
      parsed.selectedScenarioId && scenarios.some((scenario) => scenario.id === parsed.selectedScenarioId)
        ? parsed.selectedScenarioId
        : defaultScenarioId
    const selectedScenario = scenarios.find((scenario) => scenario.id === selectedScenarioId)

    return {
      selectedLevel: selectedScenario?.level ?? defaultLevel,
      selectedScenarioId,
      name: typeof parsed.name === "string" ? parsed.name.trim() : defaultPreferences.name,
      progress: { ...defaultProgress, ...parsed.progress },
      streakDays:
        typeof parsed.streakDays === "number" && Number.isFinite(parsed.streakDays)
          ? parsed.streakDays
          : defaultPreferences.streakDays,
      sessionScore:
        typeof parsed.sessionScore === "number" && Number.isFinite(parsed.sessionScore)
          ? parsed.sessionScore
          : defaultPreferences.sessionScore,
      feedback: sanitizeFeedback(parsed.feedback),
      useMaterialInSession:
        typeof parsed.useMaterialInSession === "boolean"
          ? parsed.useMaterialInSession
          : defaultPreferences.useMaterialInSession,
      activeMaterialIds: Array.isArray(parsed.activeMaterialIds)
        ? parsed.activeMaterialIds.filter((id): id is string => typeof id === "string")
        : defaultPreferences.activeMaterialIds,
      selectedVocabularyGoals: sanitizeStringArray(
        parsed.selectedVocabularyGoals,
        defaultPreferences.selectedVocabularyGoals,
      ),
      focusedGrammar: typeof parsed.focusedGrammar === "string" ? parsed.focusedGrammar : null,
      correctionStyle: parsed.correctionStyle === "direct" ? "direct" : defaultPreferences.correctionStyle,
      showCaptions:
        typeof parsed.showCaptions === "boolean" ? parsed.showCaptions : defaultPreferences.showCaptions,
      uiLanguage:
        typeof parsed.uiLanguage === "string" && isUiLanguage(parsed.uiLanguage)
          ? parsed.uiLanguage
          : resolveDefaultUiLanguage(),
      translationLanguage:
        typeof parsed.translationLanguage === "string" && isTranslationLanguage(parsed.translationLanguage)
          ? parsed.translationLanguage
          : defaultPreferences.translationLanguage,
    }
  } catch {
    return defaultPreferences
  }
}

export function initialsFor(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return ""
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return (words[0][0] + words[words.length - 1][0]).toUpperCase()
}
