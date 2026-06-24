// @vitest-environment jsdom
import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { LanguageProvider, useT } from "./provider"

function Probe() {
  const t = useT()
  return <span>{t("rail.settings")}</span>
}

describe("LanguageProvider", () => {
  it("provides translations for the active language", () => {
    render(
      <LanguageProvider language="en">
        <Probe />
      </LanguageProvider>,
    )
    expect(screen.getByText("Settings")).toBeDefined()
  })

  it("switches language without remounting", () => {
    const { rerender } = render(
      <LanguageProvider language="en">
        <Probe />
      </LanguageProvider>,
    )
    rerender(
      <LanguageProvider language="nl">
        <Probe />
      </LanguageProvider>,
    )
    expect(screen.getByText("Instellingen")).toBeDefined()
  })
})
