import { afterEach, describe, expect, it, vi } from "vitest"

import { GET, POST } from "@/app/api/realtime/session/route"

const validRequest = {
  level: "A1",
  scenarioId: "bakery-antwerp",
  materialIds: [],
  mode: "roleplay",
}

describe("POST /api/realtime/session", () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it("returns a safe missing-key error without contacting OpenAI", async () => {
    vi.stubEnv("OPENAI_API_KEY", "")

    const response = await POST(
      new Request("http://localhost/api/realtime/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validRequest),
      }),
    )

    expect(response.status).toBe(401)
    await expect(response.json()).resolves.toEqual({
      error: "OPENAI_API_KEY is required for Realtime sessions.",
    })
  })
})

describe("GET /api/realtime/session", () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it("reports configured:true when a key is set", async () => {
    vi.stubEnv("OPENAI_API_KEY", "sk-test")
    const res = await GET()
    expect(await res.json()).toEqual({ configured: true })
  })

  it("reports configured:false when no key is set", async () => {
    vi.stubEnv("OPENAI_API_KEY", "")
    const res = await GET()
    expect(await res.json()).toEqual({ configured: false })
  })
})
