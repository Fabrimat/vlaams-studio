"use client"

import { useState } from "react"

import { cn } from "@/lib/utils"
import { useT } from "@/lib/i18n/provider"

export function Translatable({
  text,
  language,
  className,
}: {
  text: string
  language: string
  className?: string
}) {
  const t = useT()
  const [translation, setTranslation] = useState<string | null>(null)
  const [shown, setShown] = useState(false)
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle")

  async function toggle() {
    if (shown) {
      setShown(false)
      return
    }
    if (translation !== null) {
      setShown(true)
      return
    }
    setStatus("loading")
    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texts: [text], target: language, source: "nl" }),
      })
      if (!response.ok) throw new Error("translate failed")
      const data = (await response.json()) as { translations: string[] }
      setTranslation(data.translations[0] ?? null)
      setShown(true)
      setStatus("idle")
    } catch {
      setStatus("error")
    }
  }

  return (
    <span className={cn(className)}>
      <span dir="auto">{text}</span>
      <button
        type="button"
        onClick={() => void toggle()}
        className="ml-2 text-[11px] font-medium text-[#2f6f57] underline underline-offset-2"
      >
        {status === "loading"
          ? t("content.translating")
          : shown
            ? t("content.hideTranslation")
            : t("content.translate")}
      </button>
      {status === "error" && (
        <span className="ml-2 text-[11px] text-[#9a5b28]">{t("content.translationFailed")}</span>
      )}
      {shown && translation !== null && (
        <span dir="auto" className="mt-1 block text-[13px] italic text-[#5a615b]">
          {translation}
        </span>
      )}
    </span>
  )
}
