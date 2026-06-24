# Translation endpoint

`POST /api/translate` turns Dutch text into another language. Request body:

```json
{ "texts": ["..."], "target": "fr", "source": "nl" }
```

It responds with `{ "translations": [...] }` in the same order as the input.

Translations come from OpenAI, using the same `OPENAI_API_KEY` as the realtime
session. Results are cached on disk under `.local/translations/<target>.json`,
keyed by a hash of the source text, so a given text is only sent once per
language. On each call only the texts that are not already cached are sent out.

`target` is checked against a language-code pattern before it is used as part of
a filename, and the resolved cache path is verified to stay inside the cache
folder, so a crafted target cannot read or write outside it. A missing API key
returns 401; a bad body or target returns 400.

The pure pieces (hashing, splitting cached from uncached, merging results,
parsing the model response) live in `src/lib/i18n/translate-cache.ts` and have
unit tests. The route file only does the file and network work.
