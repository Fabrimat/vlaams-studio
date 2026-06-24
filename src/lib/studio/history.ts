import { useSyncExternalStore } from "react"
import type { CorrectionPayload, TranscriptTurn } from "@/lib/realtime/events"
import type { FeedbackItem, PracticeLevel } from "@/lib/practice-data"

export const historyStorageKey = "vlaams-studio-history-v1"
export const historyChangeEvent = "vlaams-studio-history-change"
export const HISTORY_CAP = 100

export type SessionRecord = {
  id: string
  startedAt: string
  endedAt: string
  durationSec: number
  level: PracticeLevel
  scenarioId: string
  scenarioTitle: string
  source: "voice" | "manual"
  scores: { overall: number; metrics: FeedbackItem[] }
  corrections: CorrectionPayload[]
  materialsUsed: string[]
  transcript: TranscriptTurn[]
  summary?: string
  nextStep?: string
}

function isRecord(value: unknown): value is SessionRecord {
  if (!value || typeof value !== "object") return false
  const r = value as Partial<SessionRecord>
  return (
    typeof r.id === "string" &&
    typeof r.startedAt === "string" &&
    typeof r.endedAt === "string" &&
    typeof r.durationSec === "number" &&
    typeof r.level === "string" && r.level.length > 0 &&
    typeof r.scenarioId === "string" &&
    typeof r.scenarioTitle === "string" &&
    (r.source === "voice" || r.source === "manual") &&
    typeof r.scores === "object" && r.scores !== null &&
    typeof (r.scores as { overall?: unknown }).overall === "number" &&
    Array.isArray(r.corrections) &&
    Array.isArray(r.materialsUsed) &&
    Array.isArray(r.transcript)
  )
}

export function sanitizeHistory(value: unknown): SessionRecord[] {
  if (!Array.isArray(value)) return []
  return value.filter(isRecord).slice(0, HISTORY_CAP)
}

export function loadHistory(): SessionRecord[] {
  if (typeof window === "undefined") return []
  try {
    return sanitizeHistory(JSON.parse(window.localStorage.getItem(historyStorageKey) ?? "[]"))
  } catch {
    return []
  }
}

function persist(records: SessionRecord[]) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(historyStorageKey, JSON.stringify(records))
  window.dispatchEvent(new Event(historyChangeEvent))
}

export function appendSession(record: SessionRecord): SessionRecord[] {
  if (typeof window === "undefined") return []
  const next = [record, ...loadHistory()].slice(0, HISTORY_CAP)
  persist(next)
  return next
}

export function clearHistory(): void {
  if (typeof window === "undefined") return
  persist([])
}

function subscribe(onChange: () => void) {
  if (typeof window === "undefined") return () => undefined
  window.addEventListener("storage", onChange)
  window.addEventListener(historyChangeEvent, onChange)
  return () => {
    window.removeEventListener("storage", onChange)
    window.removeEventListener(historyChangeEvent, onChange)
  }
}

function getSnapshot() {
  if (typeof window === "undefined") return "[]"
  return window.localStorage.getItem(historyStorageKey) ?? "[]"
}

export function useHistory(): SessionRecord[] {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, () => "[]")
  return sanitizeHistory(JSON.parse(snapshot))
}

const WEEKDAY_LETTERS = ["M", "D", "W", "D", "V", "Z", "Z"] // Mon..Sun (Dutch shorthand, per DESIGN.md)

function localDayKey(date: Date): string {
  const y = date.getFullYear()
  const m = `${date.getMonth() + 1}`.padStart(2, "0")
  const d = `${date.getDate()}`.padStart(2, "0")
  return `${y}-${m}-${d}`
}

function daySet(records: SessionRecord[]): Set<string> {
  return new Set(records.map((r) => localDayKey(new Date(r.startedAt))))
}

export function computeStreak(records: SessionRecord[], today: Date): number {
  const days = daySet(records)
  const cursor = new Date(today)
  // The streak may start today or yesterday (a not-yet-practiced today shouldn't reset it).
  if (!days.has(localDayKey(cursor))) cursor.setDate(cursor.getDate() - 1)
  let streak = 0
  while (days.has(localDayKey(cursor))) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

export function computeWeekdayDots(
  records: SessionRecord[],
  today: Date,
): Array<{ letter: string; active: boolean }> {
  const days = daySet(records)
  const monday = new Date(today)
  const offsetToMonday = (today.getDay() + 6) % 7 // Sun=0 -> 6, Mon=1 -> 0
  monday.setDate(today.getDate() - offsetToMonday)
  return WEEKDAY_LETTERS.map((letter, index) => {
    const day = new Date(monday)
    day.setDate(monday.getDate() + index)
    return { letter, active: days.has(localDayKey(day)) }
  })
}

export function lifetimeStats(records: SessionRecord[]) {
  return {
    totalSessions: records.length,
    totalDurationSec: records.reduce((sum, r) => sum + r.durationSec, 0),
    bestOverall: records.reduce((best, r) => Math.max(best, r.scores.overall), 0),
  }
}
