import type { Scenario } from "@/lib/practice-data"
import type { CorrectionPayload, SessionEndPayload, TranscriptTurn } from "@/lib/realtime/events"
import type { SessionRecord } from "@/lib/studio/history"
import { scoresFromPayload } from "@/lib/studio/scoring"

export function collectCorrections(turns: TranscriptTurn[]): CorrectionPayload[] {
  return turns.flatMap((turn) => (turn.speaker === "Correction" && turn.correction ? [turn.correction] : []))
}

export function countLearnerTurns(turns: TranscriptTurn[]): number {
  return turns.filter((turn) => turn.speaker === "You" && turn.status === "final").length
}

type BuildSessionRecordInput = {
  id: string
  startedAt: string
  endedAt: string
  scenario: Scenario
  source: "voice" | "manual"
  transcript: TranscriptTurn[]
  payload: SessionEndPayload | null
  materialsUsed: string[]
}

export function buildSessionRecord(input: BuildSessionRecordInput): SessionRecord {
  const corrections = collectCorrections(input.transcript)
  const durationSec = Math.max(
    0,
    Math.round((new Date(input.endedAt).getTime() - new Date(input.startedAt).getTime()) / 1000),
  )
  const scores = scoresFromPayload(input.payload, {
    durationSec,
    learnerTurns: countLearnerTurns(input.transcript),
    correctionCount: corrections.length,
  })

  return {
    id: input.id,
    startedAt: input.startedAt,
    endedAt: input.endedAt,
    durationSec,
    level: input.scenario.level,
    scenarioId: input.scenario.id,
    scenarioTitle: input.scenario.title,
    source: input.source,
    scores,
    corrections,
    materialsUsed: input.materialsUsed,
    transcript: input.transcript,
    ...(input.payload?.summary ? { summary: input.payload.summary } : {}),
    ...(input.payload?.nextStep ? { nextStep: input.payload.nextStep } : {}),
  }
}
