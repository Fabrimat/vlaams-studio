import type { Scenario } from "@/lib/practice-data"
import type { TranscriptTurn } from "@/lib/realtime/events"

export function buildManualTranscript(scenario: Scenario): TranscriptTurn[] {
  const grammar = scenario.grammarPoints[0] ?? "zinsbouw"
  const learnerLine = `Ik wil graag oefenen met ${scenario.vocabulary[0] ?? "deze woorden"}.`
  const correctedLine = `Ik zou graag oefenen met ${scenario.vocabulary[0] ?? "deze woorden"}.`

  return [
    { id: `${scenario.id}-manual-tutor-1`, speaker: "Tutor", status: "final", text: scenario.starter },
    { id: `${scenario.id}-manual-you-1`, speaker: "You", status: "final", text: learnerLine },
    {
      id: `${scenario.id}-manual-correction-1`,
      speaker: "Correction",
      status: "final",
      text: correctedLine,
      correction: {
        original: learnerLine,
        corrected: correctedLine,
        reason: "Gebruik de beleefde vorm 'zou graag' in een gesprek.",
        grammarPoint: grammar,
        retryPrompt: "Zeg de verbeterde zin nog eens rustig.",
      },
    },
    {
      id: `${scenario.id}-manual-tutor-2`,
      speaker: "Tutor",
      status: "final",
      text: "Goed geprobeerd. Laten we verdergaan met de oefening.",
    },
    {
      id: `${scenario.id}-manual-system-1`,
      speaker: "System",
      status: "tool",
      text: "Oefensessie zonder live stem afgerond. Voeg een OPENAI_API_KEY toe voor een echt gesprek.",
    },
  ]
}
