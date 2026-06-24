import { describe, expect, it } from "vitest"
import { metricsFromActivity, scoresFromPayload, metricLabels } from "@/lib/studio/scoring"

describe("metricsFromActivity", () => {
  it("produces three metrics with the canonical labels", () => {
    const { metrics } = metricsFromActivity({ durationSec: 480, learnerTurns: 5, correctionCount: 2 })
    expect(metrics.map((m) => m.label)).toEqual([...metricLabels])
  })
  it("clamps overall between 50 and 95", () => {
    const low = metricsFromActivity({ durationSec: 0, learnerTurns: 0, correctionCount: 99 })
    const high = metricsFromActivity({ durationSec: 6000, learnerTurns: 99, correctionCount: 0 })
    expect(low.overall).toBeGreaterThanOrEqual(50)
    expect(high.overall).toBeLessThanOrEqual(95)
  })
  it("is deterministic for the same input", () => {
    const a = metricsFromActivity({ durationSec: 300, learnerTurns: 4, correctionCount: 1 })
    const b = metricsFromActivity({ durationSec: 300, learnerTurns: 4, correctionCount: 1 })
    expect(a).toEqual(b)
  })
  it("keeps every metric score within 0..100", () => {
    const { metrics } = metricsFromActivity({ durationSec: 6000, learnerTurns: 99, correctionCount: 0 })
    for (const m of metrics) {
      expect(m.score).toBeGreaterThanOrEqual(0)
      expect(m.score).toBeLessThanOrEqual(100)
    }
  })
})

describe("scoresFromPayload", () => {
  const activity = { durationSec: 300, learnerTurns: 4, correctionCount: 1 }
  it("uses model scores when present", () => {
    const result = scoresFromPayload(
      { reason: "done", summary: "ok", scores: { overall: 88, pronunciation: 80, vocabulary: 90, confidence: 84 } },
      activity,
    )
    expect(result.overall).toBe(88)
    expect(result.metrics[0]).toEqual({ label: "Uitspraak", score: 80, note: expect.any(String) })
  })
  it("falls back to the activity heuristic when scores are absent", () => {
    const result = scoresFromPayload({ reason: "done", summary: "ok" }, activity)
    expect(result).toEqual(metricsFromActivity(activity))
  })
  it("falls back when payload is null", () => {
    expect(scoresFromPayload(null, activity)).toEqual(metricsFromActivity(activity))
  })
  it("clamps out-of-range model scores into 0..100", () => {
    const result = scoresFromPayload(
      { reason: "r", summary: "s", scores: { overall: 150, pronunciation: 120, vocabulary: -10, confidence: 50 } },
      activity,
    )
    expect(result.overall).toBe(100)
    for (const m of result.metrics) {
      expect(m.score).toBeGreaterThanOrEqual(0)
      expect(m.score).toBeLessThanOrEqual(100)
    }
  })
})
