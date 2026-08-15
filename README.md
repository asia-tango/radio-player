# RedWave FM

A live internet radio player built with Angular 21 (standalone components, signals OnPush everywhere, no NgModules) as a portfolio piece 
for a Senior/Lead Angular job search.

**Live demo:** https://redwave-fm.web.app

Screenshot
<img width="2742" height="1221" alt="image" src="https://github.com/user-attachments/assets/e69db85a-c1f5-4f83-9573-2314d16ea532" />


Streams real stations from the [Radio Browser API](https://api.radio-browser.info) — browse by
country, filter by genre, search by name, save favorites, or just hit Random for an instant pick
from the current top 100 by popularity.

## Stack

- **Angular 21** — standalone components, signals, `httpResource`/`resource`
  for API calls, native control flow (`@if`/`@for`)
- **Radio Browser API** — community-maintained database of internet radio
  stations, no API key or registration required
- **Angular Material** — scoped to buttons, icons, and snackbars only;
  everything else is hand-rolled SCSS
- **[Karma/Jasmine or Vitest — confirm which]** — unit tests for the
  interceptor and the service layer (see Known limitations for what's not
  covered yet)
- **Firebase Hosting** — static deploy, no backend

## Key technical decisions

**Exponential backoff on Radio Browser API requests, not fixed-interval retries.** The retry interceptor gives failed GET requests two more attempts after the first, with delays growing exponentially (500ms, then 1000ms) rather than a flat interval — a struggling API needs more room to recover on the second retry than it had on the first, and a flat interval doesn't give it that. Each attempt also gets its own 3-second timeout, which turns a request that just hangs with no response into a proper error the retry logic can act on — without it, a stalled call would wait indefinitely instead of failing fast. The trade-off, honestly: worst case is still ~9 seconds before the user sees a "Try again" state (3 attempts × 3s timeout). That's deliberately capped low — a longer per-attempt timeout would mean a ~25s wait in the worst case, which felt worse than failing a bit early. This only covers HTTP-level failures on the Radio Browser API; a station that resolves fine but then fails to actually play (broken stream, blocked codec) is caught separately by the player, via the audio element's own `error` event, and surfaces as a snackbar rather than a retry — those are different failure modes and treating them the same would have meant retrying something that was never going to succeed.

**`resource()` for search, not `httpResource()`, because search needs a fallback query `httpResource()` can't express.** When a country + genre combination returns nothing, the app needs to drop the country filter and retry the same genre worldwide — a second, different request depending on the outcome of the first. `httpResource()`'s declarative single-URL model doesn't have room for that branching, so search uses the lower-level `resource()` with a custom loader instead. `httpResource()` is still used where the URL is genuinely static (the top-stations list behind the Random button) — no reason to reach for more control than the request needs. The trade-off, honestly: search has no debounce. Every keystroke updates a signal, which `resource()` picks up and re-runs immediately — one HTTP request per letter typed, no `debounceTime`, no manual `setTimeout`. RxJS would have made that a two-line fix; doing it signal-native would mean hand-rolling a delay, which didn't happen yet. It works, it's just noisier on the API than it needs to be.

**Angular Material only for buttons, icons, and snackbars — everything else is hand-rolled SCSS.** The brand surface (the gradient background, the player card, the round play/pause button) needed to closely match a specific visual reference from an earlier version of this project, and Material's default look doesn't bend that far without fighting the theme system. Small, purely functional UI — a button, an icon, a toast — doesn't carry any of that visual weight, so it stays on Material and gets its accessibility and interaction patterns for free instead of being rebuilt by hand. The trade-off, honestly: this is two styling systems instead of one, which means two places to touch for anything that spans both (spacing, focus states). Navigation skips Material entirely and is plain `RouterLink` markup — there was nothing about it that needed a component library at all.

## Structure

A few things worth calling out beyond the obvious component/service split:

* `data/content-policy.ts` — `excludeBannedStations()` filters RU/BY stations out of every search and the Random pick. Not a technical decision, an editorial one — it runs on every result set, not just at the API level, since Radio Browser doesn't offer that filtering itself.
* `data/dedupe-stations.ts` — the same station is often listed multiple times under slightly different stream URLs. `dedupeStations()` collapses those before they ever reach the UI, so favorites and search results don't show near-duplicates.
* `interceptors/retry.interceptor.ts` — the only piece of cross-cutting HTTP logic in the app; see Key technical decisions above for why it's a plain interceptor and not baked into `station.service`.
* `services/station.service.ts` — holds two separate resources on purpose: a `resource()`-based search (needs the fallback-query branching) and an `httpResource()`-based top-stations list (genuinely static URL). Splitting them was more honest than forcing one abstraction to cover both.
* `services/player.service.ts` — the only service touching the DOM directly (`HTMLAudioElement`), kept isolated from everything else so playback logic doesn't leak into components.

## Development server
npm start


Open `http://localhost:4200/`. The app reloads automatically as you edit source files.

## Building
npm run build


Production output goes to `dist/radio-player/browser`.

## Running unit tests
npm test


## Deploying
firebase deploy --only hosting


## Known limitations

- **No search debounce.** Every keystroke fires a fresh request to the Radio Browser API — no client-side throttling at all.
- **Thin test coverage.** Three spec files exist total: `app.component`, `retry.interceptor`, `station.service`. Nothing covers `player.service`, `favorites.service`, any component beyond the root one, or an end-to-end flow.
- **Partial responsiveness.** Media queries only exist in 3 of 7 component stylesheets (`home`, `help-page`, `radio-player`). The station list and navigation have no dedicated mobile breakpoints — they just inherit whatever flex/grid context their parent gives them.
- **No YouTube integration.** Out of scope by design for this MVP — see `CLAUDE.md` for the reasoning (Radio Browser only, for now).
- **No offline handling.** A dropped connection mid-playback isn't detected or communicated to the user.
