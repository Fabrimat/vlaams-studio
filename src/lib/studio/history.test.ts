// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest"
import { sanitizeHistory, appendSession, loadHistory, clearHistory, HISTORY_CAP, type SessionRecord, computeStreak, computeWeekdayDots, lifetimeStats } from "@/lib/studio/history"

function record(overrides: Partial<SessionRecord> = {}): SessionRecord {
  return {
    id: "s1",
    startedAt: "2026-06-24T08:00:00.000Z",
    endedAt: "2026-06-24T08:08:00.000Z",
    durationSec: 480,
    level: "A2",
    scenarioId: "bakery-antwerp",
    scenarioTitle: "At the bakery in Antwerp",
    source: "manual",
    scores: { overall: 78, metrics: [] },
    corrections: [],
    materialsUsed: [],
    transcript: [],
    ...overrides,
  }
}

function onDay(iso: string): SessionRecord {
  return record({ id: iso, startedAt: `${iso}T09:00:00`, endedAt: `${iso}T09:08:00` })
}

afterEach(() => {
  if (typeof window !== "undefined") window.localStorage.clear()
})

describe("sanitizeHistory", () => {
  it("returns an empty array for non-array input", () => {
    expect(sanitizeHistory("nope")).toEqual([])
    expect(sanitizeHistory(null)).toEqual([])
  })
  it("drops entries missing required fields", () => {
    const result = sanitizeHistory([record(), { id: "bad" }])
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe("s1")
  })
  it("drops entries with a missing or non-string level", () => {
    const { level, ...noLevel } = record()
    expect(sanitizeHistory([noLevel, record({ level: 42 as unknown as SessionRecord["level"] })])).toEqual([])
  })
})

describe("appendSession", () => {
  it("prepends the newest record and persists it", () => {
    appendSession(record({ id: "a" }))
    const after = appendSession(record({ id: "b" }))
    expect(after.map((r) => r.id)).toEqual(["b", "a"])
    expect(loadHistory().map((r) => r.id)).toEqual(["b", "a"])
  })
  it("caps stored history at HISTORY_CAP", () => {
    let last: SessionRecord[] = []
    for (let i = 0; i < HISTORY_CAP + 5; i += 1) last = appendSession(record({ id: `s${i}` }))
    expect(last).toHaveLength(HISTORY_CAP)
  })
})

describe("clearHistory", () => {
  it("empties stored history", () => {
    appendSession(record())
    clearHistory()
    expect(loadHistory()).toEqual([])
  })
})

describe("computeStreak", () => {
  const today = new Date("2026-06-24T12:00:00")
  it("counts consecutive days ending today", () => {
    const recs = [onDay("2026-06-24"), onDay("2026-06-23"), onDay("2026-06-22")]
    expect(computeStreak(recs, today)).toBe(3)
  })
  it("breaks the streak on a skipped day", () => {
    const recs = [onDay("2026-06-24"), onDay("2026-06-22")]
    expect(computeStreak(recs, today)).toBe(1)
  })
  it("returns 0 when there is no session today or yesterday", () => {
    expect(computeStreak([onDay("2026-06-20")], today)).toBe(0)
  })
  it("allows the streak to start yesterday", () => {
    expect(computeStreak([onDay("2026-06-23")], today)).toBe(1)
  })
})

describe("computeWeekdayDots", () => {
  it("marks days of the current week (Mon-Sun) that have a session", () => {
    // 2026-06-24 is a Wednesday
    const dots = computeWeekdayDots([onDay("2026-06-22"), onDay("2026-06-24")], new Date("2026-06-24T12:00:00"))
    expect(dots).toHaveLength(7)
    expect(dots.map((d) => d.letter)).toEqual(["M", "D", "W", "D", "V", "Z", "Z"])
    expect(dots[0].active).toBe(true) // Monday 22nd
    expect(dots[2].active).toBe(true) // Wednesday 24th
    expect(dots[1].active).toBe(false) // Tuesday 23rd
  })
})

describe("lifetimeStats", () => {
  it("totals sessions, duration and best score", () => {
    const recs = [
      record({ id: "a", durationSec: 100, scores: { overall: 70, metrics: [] } }),
      record({ id: "b", durationSec: 200, scores: { overall: 85, metrics: [] } }),
    ]
    expect(lifetimeStats(recs)).toEqual({ totalSessions: 2, totalDurationSec: 300, bestOverall: 85 })
  })
  it("returns zeros for empty history", () => {
    expect(lifetimeStats([])).toEqual({ totalSessions: 0, totalDurationSec: 0, bestOverall: 0 })
  })
})
