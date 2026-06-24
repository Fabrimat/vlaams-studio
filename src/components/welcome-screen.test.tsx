// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { WelcomeScreen } from "@/components/welcome-screen"
import { LanguageProvider } from "@/lib/i18n/provider"

afterEach(() => {
  cleanup()
})

function renderWelcome(onSubmit = vi.fn()) {
  render(
    <LanguageProvider language="en">
      <WelcomeScreen onSubmit={onSubmit} />
    </LanguageProvider>,
  )
  return onSubmit
}

describe("WelcomeScreen", () => {
  it("disables start until a name is entered", () => {
    renderWelcome()
    const button = screen.getByRole("button", { name: /start/i }) as HTMLButtonElement
    expect(button.disabled).toBe(true)
  })
  it("submits the trimmed name", () => {
    const onSubmit = renderWelcome()
    fireEvent.change(screen.getByPlaceholderText(/your name/i), { target: { value: "  Fabrizio  " } })
    fireEvent.click(screen.getByRole("button", { name: /start/i }))
    expect(onSubmit).toHaveBeenCalledWith("Fabrizio")
  })
})
