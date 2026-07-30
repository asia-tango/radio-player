# Radio Player (portfolio project)

New Angular 21 project (built from scratch), inspired by an earlier Angular 15 pet
project by the same author. Goal: showcase modern Angular stack (standalone, signals,
OnPush, no NgModules) for a Senior/Lead job search portfolio.

## Reference material — read, don't reuse directly
`_reference/` contains the old Angular 15 project (old-src/, catalog.json, screenshots).
Use it only as a source of ideas — menu structure, category grouping, visual style.
Do NOT copy code from it directly; everything here is written fresh for Angular 21.
`_reference/` is not part of the build — exclude it from angular.json assets/tsconfig.

## Stack target
- Angular 21, standalone components only, no NgModule
- Signals for state (component state + a lightweight signal-based store where needed)
- ChangeDetectionStrategy.OnPush everywhere
- SCSS, visual style closely matching the reference (same animated red/orange diagonal
  gradient background, "RedWave FM" branding and subtitle, card-style player with circular
  play/pause button) — near-1:1 visual fidelity is intentional; code itself is written
  fresh for Angular 21, not copy-pasted from `_reference/`
- Data source: Radio Browser API (https://api.radio-browser.info) for live stations — no local mp3 catalog
- Deploy target: Firebase Hosting (new Firebase project or new site under existing account)
- Source control: new GitHub repository, separate from the old radio-translator repo

## Legal constraint — important
Do NOT build any UI that hides, overlays, or visually covers a YouTube embedded player.
This violates YouTube API Terms of Service. If YouTube integration is touched at all,
the player must stay visible (e.g. small, in a corner), never hidden behind custom controls.
Default: skip YouTube entirely for the MVP, Radio Browser API only.

## Conventions
- All code, comments, commit messages, README in English
- Component/service/file names: short, natural, no "AI-generated" sounding names
  (e.g. `player.service.ts`, not `radio-playback-orchestrator.service.ts`)
- Prefer native Angular control flow (@if, @for) over *ngIf/*ngFor
- Keep components small and focused; extract logic into services when it grows

## Off-limits / be careful
- Don't touch `.firebase/`, don't commit secrets or API keys
- Don't modify or delete anything under `_reference/`
- Confirm with me before generating the project skeleton (`ng new`) or making
  irreversible structural decisions

## Commands
- `npm start` — dev server
- `npm run build` — production build
- `firebase deploy --only hosting` — deploy
