"use client"

import { useState } from "react"
import { useT } from "@/lib/i18n/provider"

export function WelcomeScreen({ onSubmit }: { onSubmit: (name: string) => void }) {
  const t = useT()
  const [value, setValue] = useState("")
  const trimmed = value.trim()

  return (
    <main className="grid min-h-[100dvh] place-items-center bg-[#f4f1ea] px-6 text-[#1f2420]">
      <form
        onSubmit={(event) => {
          event.preventDefault()
          if (trimmed) onSubmit(trimmed)
        }}
        className="w-full max-w-[420px] rounded-[12px] border border-[#e0ddd2] bg-white p-8 shadow-[0_8px_24px_rgba(31,36,32,0.08)]"
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8a8e87]">Vlaams Studio</p>
        <h1 className="mt-2 font-serif text-[28px] leading-[32px] tracking-tight">{t("welcome.title")}</h1>
        <label className="mt-6 block text-[13px] font-medium text-[#5a615b]" htmlFor="welcome-name">
          {t("welcome.subtitle")}
        </label>
        <input
          id="welcome-name"
          autoFocus
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder={t("welcome.namePlaceholder")}
          className="mt-2 w-full rounded-[8px] border border-[#e0ddd2] bg-white px-3 py-2.5 text-[14px] text-[#1f2420] outline-none focus-visible:border-[#2f6f57]"
        />
        <button
          type="submit"
          disabled={!trimmed}
          className="mt-5 h-11 w-full rounded-[8px] bg-[#2f6f57] text-[14px] font-medium text-white transition hover:bg-[#26604a] disabled:opacity-50"
        >
          {t("welcome.start")}
        </button>
      </form>
    </main>
  )
}
