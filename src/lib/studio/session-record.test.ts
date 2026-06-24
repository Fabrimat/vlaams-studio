import { describe, expect, it } from "vitest"
import { buildSessionRecord, collectCorrections, countLearnerTurns } from "@/lib/studio/session-record"
import { scenarios } from "@/lib/practice-data"
import type { TranscriptTurn } from "@/lib/realtime/events"

const scenario = scenarios[0]
const turns: TranscriptTurn[] = [
  { id: "t1", speaker: "Tutor", status: "final", text: "Goeiemorgen" },
  { id: "y1", speaker: "You", status: "final", text: "Ik wil brood" },
  {
    id: "c1",
    speaker: "Correction",
    status: "final",
    text: "Ik wil graag brood",
    correction: { original: "Ik wil brood", corrected: "Ik wil graag brood", reason: "beleefdheid" },
  },
]

describe("collectCorrections", () => {
  it("returns only correction payloads", () => {
    expect(collectCorrections(turns)).toHaveLength(1)
    expect(collectCorrections(turns)[0].corrected).toBe("Ik wil graag brood")
  })
})

describe("countLearnerTurns", () => {
  it("counts final You turns", () => {
    expect(countLearnerTurns(turns)).toBe(1)
  })
})

describe("buildSessionRecord", () => {
  it("assembles a full record with duration and scores", () => {
    const record = buildSessionRecord({
      id: "rec-1",
      startedAt: "2026-06-24T08:00:00.000Z",
      endedAt: "2026-06-24T08:05:00.000Z",
      scenario,
      source: "manual",
      transcript: turns,
      payload: { reason: "done", summary: "Mooi gewerkt", nextStep: "Oefen prijzen" },
      materialsUsed: ["bakkerij-dialogen.pdf"],
    })
    expect(record.id).toBe("rec-1")
    expect(record.durationSec).toBe(300)
    expect(record.level).toBe(scenario.level)
    expect(record.scenarioTitle).toBe(scenario.title)
    expect(record.corrections).toHaveLength(1)
    expect(record.summary).toBe("Mooi gewerkt")
    expect(record.nextStep).toBe("Oefen prijzen")
    expect(record.scores.overall).toBeGreaterThan(0)
    expect(record.scores.metrics).toHaveLength(3)
  })
})
