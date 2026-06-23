import { mkdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"

import { NextResponse } from "next/server"

import {
  isValidLanguageTarget,
  partitionByCache,
  mergeTranslations,
  parseTranslateResponse,
} from "@/lib/i18n/translate-cache"

export const runtime = "nodejs"

const cacheRoot = path.join(process.cwd(), ".local", "translations")
const defaultBaseUrl = "https://api.openai.com/v1"

type Body = { texts: string[]; target: string; source?: string }

function isBody(value: unknown): value is Body {
  if (!value || typeof value !== "object") return false
  const candidate = value as Partial<Body>
  return (
    Array.isArray(candidate.texts) &&
    candidate.texts.every((text) => typeof text === "string") &&
    typeof candidate.target === "string" &&
    candidate.target.length > 0
  )
}

function safeCachePath(target: string): string {
  const resolvedRoot = path.resolve(cacheRoot)
  const full = path.resolve(resolvedRoot, `${target}.json`)
  if (!full.startsWith(resolvedRoot + path.sep)) throw new Error("invalid cache target")
  return full
}

async function readCache(target: string): Promise<Record<string, string>> {
  try {
    const raw = await readFile(safeCachePath(target), "utf-8")
    return JSON.parse(raw) as Record<string, string>
  } catch {
    return {}
  }
}

async function writeCache(target: string, cache: Record<string, string>) {
  await mkdir(cacheRoot, { recursive: true })
  await writeFile(safeCachePath(target), `${JSON.stringify(cache, null, 2)}\n`, "utf-8")
}

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: "OPENAI_API_KEY is required for translation." }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  if (!isBody(body)) {
    return NextResponse.json({ error: "Invalid translation request." }, { status: 400 })
  }
  if (!isValidLanguageTarget(body.target)) {
    return NextResponse.json({ error: "Invalid translation target." }, { status: 400 })
  }

  const source = body.source ?? "nl"
  const cache = await readCache(body.target)
  const { hits, misses } = partitionByCache(body.texts, cache)

  let updatedCache = cache
  if (misses.length) {
    const baseUrl = (process.env.OPENAI_BASE_URL ?? defaultBaseUrl).replace(/\/$/, "")
    let response: Response
    try {
      response = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: process.env.OPENAI_TRANSLATE_MODEL ?? "gpt-4o-mini",
          temperature: 0,
          response_format: { type: "json_object" },
          messages: [
            {
              role: "system",
              content:
                `You translate ${source} learning-app text into the language with code "${body.target}". ` +
                `Translate faithfully and naturally. Return JSON: {"translations": string[]} with exactly ` +
                `${misses.length} items, in the same order as the input array, and nothing else.`,
            },
            { role: "user", content: JSON.stringify(misses) },
          ],
        }),
      })
    } catch {
      return NextResponse.json({ error: "Translation request failed." }, { status: 502 })
    }

    const payload = (await response.json().catch(() => null)) as
      | { choices?: { message?: { content?: string } }[]; error?: { message?: string } }
      | null

    if (!response.ok) {
      return NextResponse.json(
        { error: payload?.error?.message ?? "Translation request failed." },
        { status: response.status || 502 },
      )
    }

    const fresh = parseTranslateResponse(payload?.choices?.[0]?.message?.content ?? "", misses.length)
    if (!fresh) {
      return NextResponse.json({ error: "Translation response was malformed." }, { status: 502 })
    }

    updatedCache = mergeTranslations(cache, misses, fresh)
    await writeCache(body.target, updatedCache)
    misses.forEach((text, index) => {
      hits[text] = fresh[index]
    })
  }

  return NextResponse.json({ translations: body.texts.map((text) => hits[text]) })
}
