import { describe, expect, it } from "vitest"

import { buildRealtimeInstructions, buildRealtimeSessionConfig } from "@/lib/realtime/session-config"

describe("Realtime session config", () => {
  it("uses GPT Realtime 2 with low reasoning, transcription, and tools", () => {
    const config = buildRealtimeSessionConfig({
      level: "A2",
      scenarioId: "tram-stop",
      materialIds: ["lesson-1"],
      mode: "roleplay",
    })

    expect(config.model).toBe("gpt-realtime-2")
    expect(config.reasoning.effort).toBe("low")
    expect(config.audio.output.voice).toBe("marin")
    expect(config.audio.input.transcription).toEqual({
      model: "gpt-realtime-whisper",
      language: "nl",
    })
    expect(config.tools.map((tool) => tool.name)).toEqual([
      "search_lesson_materials",
      "record_correction",
      "end_practice_session",
    ])
  })

  it("includes the selected level, scenario, and active materials in instructions", () => {
    const instructions = buildRealtimeInstructions({
      level: "B1",
      scenarioId: "doctor-appointment",
      materialIds: ["lesson-a", "lesson-b"],
      mode: "roleplay",
    })

    expect(instructions).toContain("CEFR level B1")
    expect(instructions).toContain("At the doctor appointment")
    expect(instructions).toContain("lesson-a, lesson-b")
    expect(instructions).toContain("End the practice only when it naturally makes sense")
    expect(instructions).toContain("call end_practice_session")
  })

  it("includes focused vocabulary, grammar, and correction style", () => {
    const instructions = buildRealtimeInstructions({
      level: "A2",
      scenarioId: "bakery-antwerp",
      materialIds: [],
      mode: "roleplay",
      focusedVocabulary: ["broodsoorten", "prijzen"],
      focusedGrammar: "Vraagzinnen met 'zou graag'",
      correctionStyle: "direct",
    })

    expect(instructions).toContain("Correction style: direct")
    expect(instructions).toContain("broodsoorten, prijzen")
    expect(instructions).toContain("Vraagzinnen met 'zou graag'")
  })
})

describe("end_practice_session scores", () => {
  const input = { level: "A2" as const, scenarioId: "bakery-antwerp", materialIds: [], mode: "roleplay" as const }
  it("exposes an optional scores object on the end tool", () => {
    const config = buildRealtimeSessionConfig(input)
    const endTool = config.tools.find((t) => t.name === "end_practice_session")
    expect(endTool?.parameters.properties.scores).toBeDefined()
    expect(endTool?.parameters.required).not.toContain("scores")
  })
  it("asks the model to include scores when ending", () => {
    expect(buildRealtimeInstructions(input).toLowerCase()).toContain("scores")
  })
})
