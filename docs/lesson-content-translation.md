# Translating lesson content

The lesson text is in Dutch. To help while learning, parts of it can be
translated in place into the language chosen in Settings
(`translationLanguage`).

`Translatable` (`src/components/translatable.tsx`) wraps a piece of Dutch text
and adds a small "Translate" link. The translation is hidden until you click it.
The first click calls `/api/translate`; the result is kept in state, so showing
and hiding it again does not hit the server a second time. Translated text is
rendered with `dir="auto"` so right-to-left languages display correctly.

For now this is used on the scenario objective and the teacher note. The
vocabulary and grammar chips are left for later.
