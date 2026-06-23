// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { LanguageProvider } from "@/lib/i18n/provider"
import { Translatable } from "./translatable"

afterEach(() => {
  vi.restoreAllMocks()
  cleanup()
})

function renderTranslatable() {
  return render(
    <LanguageProvider language="en">
      <Translatable text="Goeiemorgen" language="it" />
    </LanguageProvider>,
  )
}

describe("Translatable", () => {
  it("hides the translation until the affordance is clicked", () => {
    renderTranslatable()
    expect(screen.getByText("Goeiemorgen")).toBeDefined()
    expect(screen.queryByText("Buongiorno")).toBeNull()
  })

  it("fetches and reveals the translation on click", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ translations: ["Buongiorno"] }), { status: 200 }),
    )
    renderTranslatable()
    fireEvent.click(screen.getByRole("button", { name: "Translate" }))
    await waitFor(() => expect(screen.getByText("Buongiorno")).toBeDefined())
  })
})
