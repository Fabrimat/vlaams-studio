import { createHash } from "node:crypto"

export function cacheKey(text: string): string {
  return createHash("sha256").update(text).digest("hex")
}

export function partitionByCache(texts: string[], cache: Record<string, string>) {
  const hits: Record<string, string> = {}
  const misses: string[] = []
  for (const text of texts) {
    const cached = cache[cacheKey(text)]
    if (typeof cached === "string") hits[text] = cached
    else misses.push(text)
  }
  return { hits, misses }
}

export function mergeTranslations(
  cache: Record<string, string>,
  misses: string[],
  fresh: string[],
): Record<string, string> {
  const next = { ...cache }
  misses.forEach((text, index) => {
    if (typeof fresh[index] === "string") next[cacheKey(text)] = fresh[index]
  })
  return next
}

export function parseTranslateResponse(raw: string, count: number): string[] | null {
  try {
    const parsed = JSON.parse(raw)
    const list = parsed?.translations
    if (!Array.isArray(list) || list.length !== count) return null
    if (!list.every((item) => typeof item === "string")) return null
    return list
  } catch {
    return null
  }
}
