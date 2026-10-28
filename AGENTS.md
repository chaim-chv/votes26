# AGENTS.md

Guidance for coding agents working on **votes26**, an accessible live viewer for Israel’s 26th Knesset election results.

## Commands

Use **Bun** for everything.

```bash
bun install          # install dependencies
bun run dev          # Nuxt dev server
bun run build        # production build
bun run preview      # preview production
bun run typecheck    # vue-tsc / Nuxt typecheck
bun run test         # bun:test suites
bun run test:e2e     # Playwright end-to-end suite (Chrome)
bun run snapshot     # refresh server/data/snapshot.json from the live feed
bun run geo-names    # refresh server/data/neighborhood-names.json
bun run history      # refresh server/data/history/25.json
```

Before finishing a change, run at least `bun run test`, `bun run typecheck` and `bun run test:e2e`. The E2E suite uses the installed Chrome channel; no browser download is needed on this machine. For UI changes, also check a mobile width and English/LTR mode.

## Stack and directory map

- **Nuxt 4** with the `app/` source directory.
- **Nuxt UI 4** + Tailwind CSS 4.
- **Bun** for the toolchain.
- `app/pages/` — one file per view (`/`, `/mandates`, `/votes`, `/blocs`, `/localities`, `/localities/[code]`, `/parties/[code]`, `/insights`, `/method`).
- `app/components/` — shell and visual components. Charts are custom SVG/CSS, not a chart library.
- `app/composables/` — `useResults`, `useResultsState`, `useLocale`, `useFormat`.
- `app/i18n/messages.ts` — the complete Hebrew + English dictionary.
- `shared/election/` — pure, framework-free election logic and metadata. This is the code to test.
- `server/api/results.get.ts` — cached `/api/results` endpoint.
- `server/api/localities.get.ts`, `server/api/localities/[code].get.ts` — locality list and drill-down.
- `server/api/parties/[code].get.ts` — a party's strongest localities.
- `server/utils/votes-data.ts` — cached source fetches for national and neighbourhood feeds.
- `server/utils/source.ts` — builds the national snapshot.
- `server/utils/normalize.ts` — turns a raw snapshot into the UI payload.
- `server/utils/localities.ts` — locality, neighbourhood and party-local aggregation.
- `server/utils/history.ts` — 2022 comparison builder and local share matching; reads `server/data/history/25.json`.
- `shared/election/history.ts` — party-lineage and group mapping. Never join comparison data by ballot code alone.
- `server/data/snapshot.json` — committed fallback; never hand-edit.
- `server/data/neighborhood-names.json` — static id → neighbourhood name map; refresh with `bun run geo-names`.
- `scripts/fetch-snapshot.ts`, `scripts/fetch-neighborhood-names.ts`, `scripts/fetch-history.ts` — fallback, name-map and 2022-history refreshers.
- `app/app.config.ts` — Nuxt UI semantic colours. In Nuxt 4 this file lives inside `app/`, not the repository root. Moving it silently reverts the theme to the default green primary.
- `test/` — bun:test unit suites.
- `e2e/` — Playwright tests: route rendering, shared-data refresh, comparison flows and axe WCAG checks in light/dark/mobile.
- `playwright.config.ts` — E2E config; uses the installed Chrome channel and builds the production bundle before testing.

## Data flow

```text
Govmap municipal_data.json
        │
        ▼
server/utils/source.ts ── raw totals + party votes + generatedAt
        │
        ▼
server/utils/normalize.ts ── threshold, Bader–Ofer seats, blocs, camps, insights
        │
        ▼
GET /api/results (90s cache) ── useResults (browser refresh every 5 min)
        │
        ▼
pages + charts + tables
```

Locality and party pages use the same cached municipal feed through `server/utils/votes-data.ts`. The locality detail endpoint also loads the neighbourhood feed and joins it to `server/data/neighborhood-names.json` by geometry id.

Dynamic cached endpoints must key their cache by the request path (`getRequestURL(event).pathname`), not by `getRouterParam` inside `getKey`; the router param is not reliably available at cache-key time.

Historical comparison defaults to the 25th Knesset (2022). 2022 seats are published official seats; 2026 seats are calculated. Merged/split parties are compared as groups; new parties get no predecessor delta. Local comparisons are vote-share-only for matched identities. The 24th Knesset is intentionally omitted.

If the live feed fails, the national route returns `server/data/snapshot.json` with `meta.mode = "snapshot"`. The layout shows a warning; do not hide that state. Locality and party routes fail visibly rather than inventing data.

### Refreshing data

The upstream feed changes during the count. To refresh the committed fallback:

```bash
bun run snapshot
```

Then run `bun test`. Tests must not assert volatile seat counts from the current snapshot. They may assert structural invariants (120 seats, every below-threshold party has 0 seats, blocs sum to 120). The hard-coded allocation fixture in `test/allocation.test.ts` is intentionally stable and can stay a fixture.

## Calculation and editorial rules

- **120 seats**, **61 for a majority**, **3.25% threshold**, election date **2026-10-27**. These live in `shared/election/config.ts`; change them in one place.
- Seats use Bader–Ofer with largest remainders, **without** surplus-vote agreements. The UI must keep calling the result “calculated”, not official.
- The threshold simulator in `app/components/ThresholdSimulator.vue` uses `applyThreshold` from `shared/election/threshold.ts`. It is a what-if tool, not a proposal. Keep the caveat visible.
- Historical comparison uses `shared/election/history.ts`; never join 2022 to 2026 by ballot code. National/party raw-vote deltas are allowed, but must carry the turnout/provisional caveat; local comparisons are share-only. Use `previousCodes`, `relation` and `groupId`. New parties have no delta. Local comparisons are share-only and only for `relation === 'same'`.
- Comparison UI must show both sides’ status: `2026 · counted so far` vs `2022 · final results`. Seat deltas compare calculated 2026 seats to published 2022 seats; keep the official/calculated note visible.
- Gains are green and losses are red, but arrows and SR sentences carry the meaning too.
- “Below threshold” gaps are computed against `insights.thresholdVotes`; the closest miss is the highest-vote below-threshold party.
- Blocs (`right`, `haredi`, `center-left`, `arab`, `other`) are a reading aid. Camps (`netanyahu`, `change`, `unclear`) are a separate editorial split for coalition arithmetic. Both are documented in `/method`; do not present them as official data.
- `Yisrael Beiteinu` is in the right bloc but in the change camp in the current classification. This is intentional because it illustrates the difference between ideological family and coalition arithmetic. Do not “fix” one to match the other without updating the method copy.
- The source currently reports 7,331,981 eligible voters. That figure is not in the Govmap feed; it comes from the official national-results page and is stored in `ELECTION_CONFIG.eligibleVoters`.

## UI conventions

- Hebrew is the default locale and the document direction is RTL. English is a full translation, not a stub. When adding copy, add both keys to `app/i18n/messages.ts`; the English object is typed against the Hebrew keys and will fail typecheck if a key is missing.
- Use logical utilities (`ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`, `border-s`, `border-e`) rather than left/right where direction matters.
- Use Nuxt UI components for controls (`UButton`, `UBadge`, `UAlert`, `USwitch`, `USlideover`, `UProgress`, `UApp`). Charts and data tables are custom for accessibility and layout control.
- Party colour is data, not decoration. Always pair a swatch with the party name; never use colour alone to carry meaning.
- Party metadata lives in `shared/election/parties.ts`. When adding a party, add its Hebrew/English names, colour, ballot letters, bloc, camp and order. English names are user-facing; use the accepted English name.
- The palettes are intentionally accessible: primary is a darker blue in light mode and a lighter blue in dark mode; warning/success/error are darker in light mode. If you change semantic colours, re-run the axe/Lighthouse check below.
- Keep the sidebar compact. The full legend is a slide-over; do not duplicate the entire legend in the sidebar.
- Party names in tables and charts link to `/parties/:code`; localities link to `/localities/:code`. Keep new links keyboard-accessible and avoid nested links inside other links.
- The locality page truncates long lists (12 parties / 12 neighbourhoods) with explicit “show all” controls. Preserve that pattern when adding more local data.

## Accessibility requirements

Every chart must have:

1. A text summary exposed to assistive technology (an SVG `<title>`/`<desc>`, `aria-label`, or an adjacent heading + list).
2. A visible textual representation of the data (list, table, or labels), not only colour and shape.
3. No keyboard trap. Interactive controls are real `<button>`, `<a>`, `<input>` or Nuxt UI equivalents.
4. Sufficient contrast in **both** light and dark mode.
5. Reduced-motion behaviour; do not introduce long animations that ignore `prefers-reduced-motion`.

Run the automated check before shipping a UI change:

```bash
# with the dev or preview server running
npx lighthouse http://localhost:3000/ --only-categories=accessibility
```

The project has previously reached **0 axe-core WCAG A/AA violations on all routes in light and dark mode**, including the locality and party pages. Treat that as the baseline, then do a manual keyboard pass.

## Code style

- TypeScript, no `any` unless there is a documented boundary.
- Prefer `const`, small pure functions, and types in `shared/election/types.ts`.
- Keep server-only code out of `app/` and browser-only code out of `server/`.
- Use `Intl.NumberFormat`/`Intl.DateTimeFormat` through `useFormat`; do not hand-format Hebrew numbers or dates.
- Do not add analytics, trackers, or third-party scripts.
- Do not commit secrets or `.env` files. `.env.example` is the template.

## Git

- Use clear Conventional Commits, e.g. `feat(votes): add coalition builder`, `fix(a11y): raise secondary text contrast`, `docs: refresh snapshot instructions`.
- Keep generated output (`.nuxt`, `.output`, `node_modules`) out of commits.
- Do not rewrite or discard user changes in the worktree.

## Known limitations

- The seat calculation is an approximation of the official allocation; surplus agreements are not modelled.
- Bloc and camp labels are editorial, not official.
- The eligible-voter count is a constant from the official page, not a live field from Govmap.
- The bundled snapshot is a point-in-time fallback and can be older than the live feed.
- Automated accessibility checks cannot catch every screen-reader or cognitive-load issue; manual testing remains necessary.
