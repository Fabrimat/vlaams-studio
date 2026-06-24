import { describe, expect, it } from "vitest"
import { buildManualTranscript } from "@/lib/studio/manual-session"
import { scenarios } from "@/lib/practice-data"

describe("buildManualTranscript", () => {
  for (const scenario of scenarios) {
    it(`builds a coherent transcript for ${scenario.id}`, () => {
      const turns = buildManualTranscript(scenario)
      expect(turns[0].speaker).toBe("Tutor")
      expect(turns[0].text).toBe(scenario.starter)
      expect(turns[turns.length - 1].speaker).toBe("System")
      expect(turns.some((t) => t.speaker === "Correction" && t.correction)).toBe(true)
      // ids are unique
      expect(new Set(turns.map((t) => t.id)).size).toBe(turns.length)
    })
  }
})
