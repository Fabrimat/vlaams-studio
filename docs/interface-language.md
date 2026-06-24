# Interface language

The interface can be shown in English or Dutch. The choice is kept with the
other practice preferences in localStorage, in a `uiLanguage` field, alongside a
second field `translationLanguage` that is used for lesson content.

The app is wrapped in `LanguageProvider`, which reads `uiLanguage`. The
preference is read through the same `useSyncExternalStore` setup the app already
uses, so changing the language re-renders the page right away. There is no
reload and no route change.

You switch the language in Settings. The interface picker only lists languages
that ship with a catalog (English and Dutch). The translation-language dropdown
lists the wider set of content languages.

## Default

When nothing is stored yet, we use the browser language if there is a catalog
for it, and fall back to English otherwise. Once a language is picked it stays.
Resetting the local session keeps the language choice; only level, scenario,
score, goals and session state are cleared.

Every visible interface string goes through `useT()`. The lesson content itself
(scenarios, teacher notes, vocabulary) stays in Dutch on purpose; translating
that is handled separately and on demand.
