// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest"
import { sanitizeHistory, appendSession, loadHistory, clearHistory, HISTORY_CAP, type SessionRecord } from "@/lib/studio/history"

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
