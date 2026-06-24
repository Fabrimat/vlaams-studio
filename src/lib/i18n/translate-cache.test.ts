import { describe, expect, it } from "vitest"

import {
  cacheKey,
  isValidLanguageTarget,
  partitionByCache,
  mergeTranslations,
  parseTranslateResponse,
} from "./translate-cache"

describe("isValidLanguageTarget", () => {
  it("accepts simple two-letter codes", () => {
    expect(isValidLanguageTarget("en")).toBe(true)
    expect(isValidLanguageTarget("zh")).toBe(true)
  })

  it("accepts BCP-47 subtag codes", () => {
    expect(isValidLanguageTarget("pt-br")).toBe(true)
  })

  it("rejects path traversal strings", () => {
    expect(isValidLanguageTarget("../../etc/passwd")).toBe(false)
  })

  it("rejects strings containing a slash", () => {
    expect(isValidLanguageTarget("a/b")).toBe(false)
  })

  it("rejects double-dot sequences", () => {
    expect(isValidLanguageTarget("..")).toBe(false)
  })

  it("rejects empty string", () => {
    expect(isValidLanguageTarget("")).toBe(false)
  })

  it("rejects filenames with extensions", () => {
    expect(isValidLanguageTarget("en.json")).toBe(false)
  })
})

describe("translate-cache", () => {
  it("derives a stable key per source text", () => {
    expect(cacheKey("hallo")).toBe(cacheKey("hallo"))
    expect(cacheKey("hallo")).not.toBe(cacheKey("dag"))
  })

  it("partitions texts into cache hits and misses", () => {
    const cache = { [cacheKey("a")]: "A" }
    const { hits, misses } = partitionByCache(["a", "b"], cache)
    expect(hits).toEqual({ a: "A" })
    expect(misses).toEqual(["b"])
  })

  it("merges fresh translations back into the cache by key", () => {
    const cache: Record<string, string> = {}
    const merged = mergeTranslations(cache, ["b"], ["B"])
    expect(merged[cacheKey("b")]).toBe("B")
  })

  it("parses a JSON array response of the expected length", () => {
    expect(parseTranslateResponse('{"translations":["x","y"]}', 2)).toEqual(["x", "y"])
  })

  it("rejects a response whose length does not match", () => {
    expect(parseTranslateResponse('{"translations":["x"]}', 2)).toBeNull()
  })

  it("rejects a bare JSON array (not wrapped in translations object)", () => {
    expect(parseTranslateResponse('["x","y"]', 2)).toBeNull()
  })

  it("rejects a JSON object without a translations array", () => {
    expect(parseTranslateResponse('{"foo":1}', 1)).toBeNull()
  })

  it("rejects malformed JSON", () => {
    expect(parseTranslateResponse("not json", 1)).toBeNull()
  })
})
