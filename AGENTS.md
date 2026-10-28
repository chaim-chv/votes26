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
bun test             # bun:test suites
bun run snapshot     # refresh server/data/snapshot.json from the live feed
```

Before finishing a change, run at least `bun test` and `bun run typecheck`. For UI changes, also start the app and check a mobile width and English/LTR mode.

## Stack and directory map

- **Nuxt 4** with the `app/` source directory.
- **Nuxt UI 4** + Tailwind CSS 4.
- **Bun** for the toolchain.
- `app/pages/` — one file per view (`/`, `/mandates`, `/votes`, `/blocs`, `/insights`, `/method`).
- `app/components/` — shell and visual components. Charts are custom SVG/CSS, not a chart library.
- `app/composables/` — `useResults`, `useResultsState`, `useLocale`, `useFormat`.
- `app/i18n/messages.ts` — the complete Hebrew + English dictionary.
- `shared/election/` — pure, framework-free election logic and metadata. This is the code to test.
- `server/api/results.get.ts` — cached `/api/results` endpoint.
- `server/utils/source.ts` — fetches and validates the live Govmap feed.
- `server/utils/normalize.ts` — turns a raw snapshot into the UI payload.
- `server/data/snapshot.json` — committed fallback; never hand-edit.
- `scripts/fetch-snapshot.ts` — regenerates the fallback.
- `app/app.config.ts` — Nuxt UI semantic colours. In Nuxt 4 this file lives inside `app/`, not the repository root. Moving it silently reverts the theme to the default green primary.

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

If the live feed fails, the route returns `server/data/snapshot.json` with `meta.mode = "snapshot"`. The layout shows a warning; do not hide that state.

### Refreshing data

The upstream feed changes during the count. To refresh the committed fallback:

```bash
bun run snapshot
```

Then run `bun test`. Tests must not assert volatile seat counts from the current snapshot. They may assert structural invariants (120 seats, every below-threshold party has 0 seats, blocs sum to 120). The hard-coded allocation fixture in `test/allocation.test.ts` is intentionally stable and can stay a fixture.

## Calculation and editorial rules

- **120 seats**, **61 for a majority**, **3.25% threshold**, election date **2026-10-27**. These live in `shared/election/config.ts`; change them in one place.
- Seats use Bader–Ofer with largest remainders, **without** surplus-vote agreements. The UI must keep calling the result “calculated”, not official.
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

The project has previously reached **0 axe-core WCAG A/AA violations on all six routes in light and dark mode**. Treat that as the baseline, then do a manual keyboard pass.

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
