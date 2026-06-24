import type { FeedbackItem } from "@/lib/practice-data"
import type { SessionEndPayload } from "@/lib/realtime/events"

export const metricLabels = ["Uitspraak", "Woordenschat", "Zelfvertrouwen"] as const

export type Activity = { durationSec: number; learnerTurns: number; correctionCount: number }

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n))

function noteFor(score: number): string {
  if (score >= 80) return "Sterk werk, blijf zo doorgaan."
  if (score >= 60) return "Goed bezig, je groeit."
  return "Blijf oefenen, je komt er wel."
}

function toMetrics(pronunciation: number, vocabulary: number, confidence: number): FeedbackItem[] {
  const scores = [pronunciation, vocabulary, confidence]
  return metricLabels.map((label, i) => ({
    label,
    score: clamp(Math.round(scores[i]), 0, 100),
    note: noteFor(scores[i]),
  }))
}

export function metricsFromActivity(a: Activity) {
  const engagement = Math.min(20, a.learnerTurns * 4)
  const durationBonus = Math.min(12, (a.durationSec / 60) * 2)
  const correctionPenalty = Math.min(15, a.correctionCount * 3)
  const overall = clamp(Math.round(60 + engagement + durationBonus - correctionPenalty), 50, 95)
  return {
    overall,
    metrics: toMetrics(overall - 5, overall + 3, overall - 8),
  }
}

export function scoresFromPayload(payload: SessionEndPayload | null, a: Activity) {
  const s = payload?.scores
  if (s) {
    return { overall: clamp(Math.round(s.overall), 0, 100), metrics: toMetrics(s.pronunciation, s.vocabulary, s.confidence) }
  }
  return metricsFromActivity(a)
}
