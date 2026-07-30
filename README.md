# RedWave FM

A live internet radio player built with Angular 21 (standalone components, signals, zoneless-free
`OnPush` everywhere, no NgModules) as a portfolio piece for a Senior/Lead Angular job search.

**Live demo:** https://redwave-fm.web.app

Streams real stations from the [Radio Browser API](https://api.radio-browser.info) — browse by
country, filter by genre, search by name, save favorites, or just hit Random for an instant pick
from the current top 100 by popularity.

## Stack

- Angular 21 — standalone components, signals, `httpResource`/`resource`, native control flow
- Angular Material — scoped to buttons, icons, and snackbars only; everything else is hand-rolled SCSS
- Firebase Hosting

## Development server

```bash
npm start
```

Open `http://localhost:4200/`. The app reloads automatically as you edit source files.

## Building

```bash
npm run build
```

Production output goes to `dist/radio-player/browser`.

## Running unit tests

```bash
npm test
```

## Deploying

```bash
firebase deploy --only hosting
```
