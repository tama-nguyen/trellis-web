# Trellis Web

Canonical guide for this repo, for every agent (Claude Code, Cursor, Codex, ...) and for humans.
`CLAUDE.md` only imports this file. Nothing here inherits from anywhere else: Trellis is three repos
(decision T21) and each one carries its own rules.

| Repo              | What                                                                                                  |
| ----------------- | ----------------------------------------------------------------------------------------------------- |
| `trellis-backend` | Java, Spring Boot. Owns the database, the business rules, and `contracts/`, `docker/`, `scripts/dev/` |
| `trellis-web`     | **This repo**: the Next.js frontend, which is also the BFF                                            |
| `trellis-ai`      | Python: RAG, Kafka workers, the backend SDK, the `trellis` CLI                                        |

Trellis holds **no business domain**: only the platform skeleton and one tiny sample feature
(`notice`) that shows every layer end to end. The token `trellis` / `TRELLIS_` is what a future
`init` script renames.

Tool versions are pinned in `mise.toml` (`mise install`); `.nvmrc` mirrors the Node version for nvm.

## Code standards

- **Comments explain why**: an external constraint, a warning, a reference. Never restate the code.
  - Bad: `// increment retry count`
  - Good: `// The proxy drops idle sockets at 60 s, so retry once before surfacing the error.`
- **No magic string or number literals** for domain values, codes, statuses, header names, routes,
  storage keys. Put them in a named constant owned by the module (`X.constants.ts`,
  `shared/constants/`). Exempt: UI copy (which goes through i18n anyway), log text, test fixtures.
- **Type everything.** TypeScript `strict`, no `any` (lint error). Prefer `type` over `interface`
  unless declaration merging is required.
- **No barrel files** (`index.ts` that only re-exports). Import the file that owns the thing.
- **Generated files are never hand-edited.** Change the source and regenerate — and since T22 both
  the source and the generator live in `trellis-backend`, so a contract change means a change there
  and a new `@trellis/contracts` version here. Generated output carries a header saying so.
- Validation and authorization live in the backend; a hidden button is never authorization.

## Testing policy (decision T5)

- The infrastructure is in place: Vitest (unit) and Playwright (e2e).
- Tests exist **only for tooling**: ESLint rules, the i18n parity script, the bundle budget logic.
- **Do not write feature tests unless the owner asks.** A deliberate, temporary rule pending the
  owner's decision (`plan/decisions.md` T5 in the working-notes directory).
- When tests are written: a test must be able to catch a real regression. Do not test framework
  behaviour or the exact wording of an error message.

## Commits and confidentiality

- Conventional Commits: `type(scope): description` (`feat(notice): add notice detail page`).
  Types: `feat`, `fix`, `refactor`, `perf`, `docs`, `test`, `build`, `ci`, `chore`.
- Breaking changes: `!` after the type, and say in the body what breaks, written for someone who
  does not read code.
- **Never use `--no-verify`.** A failing hook is a signal to stop and fix, not to skip. Report it
  and ask.
- No real customer names, hostnames, database or table names from real systems, or internal ticket
  IDs in code, tests, fixtures, comments or commit messages. Use `example.test` domains and neutral
  sample data.

## Stack

Next.js 16 App Router, React 19, TypeScript 6 (`strict`, `noImplicitAny`, `noUncheckedIndexedAccess`),
TanStack Query 5, Tailwind CSS 4 with semantic tokens, the Astryx design system (`@astryxdesign/core`,
theme `neutral` extended in `src/styles/trellisTheme.ts`; StyleX is only its peer dependency), our own
`ui/` for what Astryx does not have, next-intl 4 (`vi` default, `en`, `zh`), lucide-react icons, Vitest, Playwright, ESLint 9 flat config, Prettier.
HTTP is native `fetch` behind one client; no axios, no second client.

## Commands

| Command                           | What                                                                                 |
| --------------------------------- | ------------------------------------------------------------------------------------ |
| `npm run dev`                     | Dev server at `http://localhost:3000` with the in-browser mock backend               |
| `npm run build` / `start`         | Webpack production build (keeps route chunk manifests for bundle budgets) / serve it |
| `npm run typecheck`               | `tsc --noEmit`                                                                       |
| `npm run lint` / `lint:fix`       | ESLint, zero warnings allowed                                                        |
| `npm run format` / `format:check` | Prettier (Tailwind classes sorted by the plugin)                                     |
| `npm run test:coverage`           | Vitest with coverage: `coverage/cobertura-coverage.xml` for CI                       |
| `npm test`                        | Vitest: tooling tests (lint rules, scripts)                                          |
| `npm run test:e2e`                | Playwright; starts `npm run dev` on port 3100. `-- --grep @p0` for the core set      |
| `npm run i18n:check`              | Locale parity (keys and `{placeholders}`)                                            |
| `npm run budget:check`            | Bundle budget, after `npm run build`                                                 |
| `npm run contracts:check`         | This app and `@trellis/contracts` agree on a version (see below)                     |

Gate before pushing: `npm run contracts:check && npm run typecheck && npm run lint && npm run format:check && npm test && npm run i18n:check && npm run build && npm run budget:check`.
CI (`.gitlab-ci.yml`) runs exactly these scripts, nothing reimplemented.

## Agent tooling

Portable skills live in `.agent-skills/` — one folder per skill, readable by any agent
(`.agent-skills/README.md` explains the shape and how Cursor or Codex consume them).
`.agent-skills/review/` is the code-review skill for this repo; its rules are in
`.agent-skills/review/standards/typescript.md` and restate nothing that is not already here.
`.agent-skills/mock-ui/` is how a screen mock gets built here (fixtures instead of handlers, tokens,
i18n, the layer direction); its worked example is the learning mock.
`.claude/` holds only Claude Code-specific things: the read-only command allowlist in
`settings.json` and the `--no-verify` hook.

## Layout and dependency direction

```text
src/
  app/[locale]/   routes only: thin pages that render a feature; _components/ = app chrome
  features/<f>/   one vertical slice per feature, grouped into subfolders (see below)
  entities/<d>/   one domain: <d>.types.ts, <d>.constants.ts, <d>.api.ts, <d>.queries.ts
  shared/         api/ (http, errors, queryClient), hooks/, lib/, constants/, types/
  ui/             design system on Radix + tokens; knows nothing about the app
  i18n/           next-intl routing, request config, messages/<locale>/<namespace>.json
  mocks/          in-browser mock backend, per domain
  styles/         tokens.css (raw colours, light + dark), globals.css (Tailwind theme)
```

A feature is never a flat folder of files. Group them by role, one level deep, and import by the
full path (`@/features/learning/studio/CourseStudioPage`): there are no barrels.

| Group                         | Holds                                                                             | Example                                           |
| ----------------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------- |
| `pages/`                      | the screens a route renders (a feature with one screen per audience)              | `notice/pages/NoticeListPage`                     |
| `sections/`                   | the bands a page is assembled from                                                | `home/sections/FeatureCards`                      |
| `components/`                 | small pieces used inside the feature                                              | `notice/components/...Badge`                      |
| `hooks/`                      | `use*` hooks shared by several screens (a hook one screen uses stays in its file) | `learning/hooks/useDateLabel`, `useDurationLabel` |
| `shared/`                     | helpers, constants and pieces the feature's other groups (or features) use        | `learning/shared/learning.tones`                  |
| `forms/`, `guards/`, `cards/` | named for what they are, when `components/` would be vague                        | `auth/guards/RequireAuth`                         |

`features/learning` is large, so it groups by who uses the screen: `shell/` (navigation frame),
`catalog/` (public discovery and enrolment), `learner/` (the signed-in learner's screens),
`assessment/` (taking a test), `studio/` (the instructor's screens), `hooks/`, `shared/`. A feature may
import another feature's `shared/` or `hooks/` (marketing uses `learning/shared/CourseThumbnail`
and `learning/hooks/useDurationLabel`); it never
reaches into another feature's `pages/` or `studio/`.

`app -> features -> entities -> shared -> ui`. Never the other way. `ui/` may not import `app`,
`features`, `entities`, `shared/api` or `mocks` (lint: `local/ui-boundary`).

## Data pipeline

```text
component -> entity hook (<d>.queries.ts) -> entity api (<d>.api.ts)
          -> generated client (shared/api/generated, shared/graphql/executeGraphql) -> http (shared/api/http.ts)
```

- `http.ts` is the only caller of `fetch` (lint: `local/no-raw-fetch`). It adds the bearer token, runs
  a single-flight refresh on a stale-token 401, sends `FormData` untouched, and throws `ApiError`.
  Build URLs with `pathParams` / `params`, never by concatenation.
- `<d>.api.ts`: thin typed wrappers, no caching, no UI. Pass React Query's `signal` through.
- `<d>.queries.ts`: a **query-key factory** (`noticeKeys.all / list(params) / detail(id)`) and the hooks.
  Never inline a key; invalidate through the factory (`noticeKeys.all` clears the domain).
- Server state is never copied into `useState` or a store. Tokens are the one client-held auth state
  (`entities/auth/auth.session.ts`); the user comes from `useMe()`.
- Errors: `getApiErrorMessage(error, t, { codeMessages })` for inline/page errors,
  `useApiErrorHandler()` for toasts. The server's text is shown **only** for a validation problem
  (`type` = `PROBLEM_TYPES.VALIDATION`); everything else maps code -> status -> generic message.
  Per-code messages live in the entity: `AUTH_ERROR_MESSAGES`.
- Idempotent actions take their key from `useAttemptKey(scope)`: `current()` when submitting,
  `settle(!isOutcomeUnknown(err))` on error, `settle(true)` on success.
- Paged responses of the real backend are keyset pages, `CursorPage<T>` (`items`, `nextCursor`,
  `hasNext`; request with `first` + `after`). Use `useInfiniteQuery` and a "load more" control: there
  is no page number or total. `Page<T>` (0-based `page`) remains for offset endpoints (admin tables).
- Writes and integrations use REST (generated client); screen read models may use GraphQL
  (`/api/graphql`, typed documents next to the entity, e.g. `entities/notice/notice.graphql.ts`).

## API contracts (decision T22)

**Nothing is generated in this repo.** `contracts/` belongs to `trellis-backend`, because the
backend produces the OpenAPI document and the GraphQL schema. Its pipeline runs the generators and
publishes one npm package to the GitLab Package Registry of that project; this repo installs it at
a pinned, exact version and never copies a schema.

| Thing                               | Where it comes from                                                            |
| ----------------------------------- | ------------------------------------------------------------------------------ |
| Package                             | `@trellis/contracts` (OpenAPI client + GraphQL schema and operation types)     |
| Registry                            | trellis-backend's GitLab Package Registry, configured in `.npmrc`              |
| Version this app is written against | `scripts/contracts.json`, checked by `npm run contracts:check`                 |
| Credentials                         | env only: `$CI_JOB_TOKEN` in CI, a `read_api` PAT locally. **Never committed** |

The package name and version scheme are this repo's assumption until the backend publishes its
first version; reconcile with `trellis-backend` before relying on them. Version scheme: plain
semver, pinned exactly (`"@trellis/contracts": "0.1.0"`, no `^`), bumped when the backend releases
a contract change.

**Until the package exists**, the last generated output stays committed under
`src/shared/api/generated/` (orval, mutator `shared/api/apiRequest.ts`) and
`src/shared/graphql/generated/` (@graphql-codegen client-preset, `documentMode: string`) so the repo
builds on its own. `npm run contracts:check` then only verifies that those files are present and still
carry their generated header.

**What flips when the package is published** (the full list is at the top of
`scripts/check-contracts.mjs`): add the dependency, delete both generated directories, repoint the
imports at `@trellis/contracts`, set `"published": true` in `scripts/contracts.json`, and drop the
generated directories from `.prettierignore` and `eslint.config.mjs`. From then on
`npm run contracts:check` compares the pin, the installed package and `scripts/contracts.json`.

- **Never edit generated files**, in either state. They are excluded from ESLint and Prettier.
- A `graphql(...)` document in an entity (`entities/notice/notice.graphql.ts`) is an input to the
  generator. Once generation lives in the backend, changing a document means changing it there too,
  then consuming a new contracts version.
- Generated REST functions call `apiRequest` -> `http.ts`, so the token, refresh, `ApiError` and the
  BFF path apply unchanged; pass React Query's signal as the last argument (`{ signal }`).
- GraphQL documents are plain strings (no graphql-js in the bundle) run by
  `shared/graphql/executeGraphql.ts`, which turns `errors[0].extensions` into an `ApiError`
  (`extensions.code` -> HTTP-like status, so NOT_FOUND hits the 404 screen; `extensions.errorCode`
  -> `ApiError.code`, the same code REST returns).
- Entities re-export the generated shapes under domain names (`NoticeSummary`, `NoticeDetail`) and take
  enum values from the generated `as const` objects (`NOTICE_AUDIENCES = NoticeSummaryAudience`), so
  a contract change breaks the build instead of drifting. Mocks build their responses from the same
  types.

## Backend access and deployment

- **No backend URL is baked into the build.** The server reads `TRELLIS_BACKEND_URL` at runtime
  (`shared/api/backend.ts`); never add a `NEXT_PUBLIC_` backend URL, it would tie the image to one
  environment.
- **Browser:** calls same-origin `/api/...`. `app/api/[...path]/route.ts` proxies it to the backend
  (BFF), so there is no CORS and no backend origin in the bundle. Missing config answers 503
  `WEB_PROXY_NOT_CONFIGURED`, an unreachable backend 502 `WEB_PROXY_UNREACHABLE` (SCREAMING_SNAKE
  like the backend's `ErrorCode`s).
- **Server (Server Components, route handlers):** `http.ts` prefixes requests with the backend origin.
- `GET /api/health` is the container liveness probe: 200, no auth, no backend call.
- Container build: `TRELLIS_NEXT_OUTPUT=standalone` switches `next.config.ts` to `output: "standalone"`
  (`Dockerfile`, context = repo root, filtered by `.dockerignore`); leave it unset locally so
  `npm start` works.

### Running locally (decision T23)

This repo has **no infrastructure compose file**. Postgres, Kafka, Redis, MinIO and Keycloak belong
to the backend's stack, so there are exactly two ways to run the UI:

1. `NEXT_PUBLIC_MOCK_DOMAINS=true npm run dev` — the in-browser mock backend, nothing else running.
   This is what `.env.development` does, so a bare `npm run dev` already works on port 3000.
2. A real backend started from the `trellis-backend` repo (`scripts/dev/trellis-dev.sh up` there),
   with `TRELLIS_BACKEND_URL=http://localhost:8080` and `NEXT_PUBLIC_MOCK_DOMAINS=false` in
   `.env.local`.

### CI

`.gitlab-ci.yml` is self-contained (the monorepo pipeline stayed in `trellis-backend`): `lint`
(contracts, typecheck, ESLint, Prettier, i18n parity), `build` (Next build + bundle budget), `test`
(Vitest with Cobertura + JUnit), `image:build` and, on the default branch, `image:tag-main` and
`cache:warm:npm`. MR pipelines tag images `mr<iid>-<sha>`, the default branch `sha-<sha>`; jobs are
`interruptible` and read the npm cache, which only the default branch writes.

## Mock backend

`NEXT_PUBLIC_MOCK_DOMAINS` = `true` | `false` | comma list (`auth,notice,config`), read only in
`mocks/domains.ts`. Handlers answer with the backend's contract, typed with the generated types:
`problem(path, status, CODE, detail)`, `pageOf(items, page, size, view)` for offset pages, cursor
pages built like `notice.handlers.ts`, and `guard(request, path, permission?)` for auth. A resource
the caller may not see (another user's, or a STAFF notice for a non-staff reader) answers **404, not
403**. The notice domain also mocks `POST /api/graphql` for its detail document. Mocks use the same
constants as the app, never bare literals. Sample accounts: `mocks/auth.seed.ts` (the member has
`notice:read`; the admin also `notice:read-staff` and `notice:manage`).

## React rules

- **No `useEffect` for derived state**, user-event reactions or state chaining. Compute during render;
  react in the event handler. Effects are only for external systems (navigation, analytics, storage
  events, subscriptions). The React Compiler lint rules (`react-hooks` v7) enforce much of this.
- **Five screen states** for every data-driven screen: loading (skeleton shaped like the content), empty
  (says how to move forward), error (mapped message + retry), not found (also used for "not yours"),
  ready. Use `PageShell` with `state={screenStateOf(query, { isEmpty })}`.
- Hooks in `shared/hooks/`: `useDebouncedCallback` (debounce only the expensive part),
  `useStableValue`, `useLatest`, `usePagination` / `useUrlPagination` (needs `<Suspense>`),
  `useAttemptKey`, `useFeatureFlag(key)` (typed keys, safe defaults, localStorage cache).
- Gate UI with `useCan().can(PERMISSIONS.X)` or `<RequirePermission>`. Hiding is not authorization.
- `"use client"` only where browser APIs or hooks require it. Pages stay server components.

## Auth

Tokens are kept in localStorage by `auth.session.ts`, which is acceptable for the mock only. When the
real backend lands: refresh token in an httpOnly cookie, and move the `(protected)` check into
`middleware.ts` so the page never renders for a signed-out user. `RequireAuth` stays as UX.

## i18n

- All user-visible copy goes through next-intl. Lint: `i18next/no-literal-string` (jsx-only mode, with
  an allow-list of non-copy attributes in `eslint.config.mjs`).
- One file per namespace per locale: `src/i18n/messages/<locale>/<namespace>.json`. Namespaces are named
  by area (`common`, `errors`, `auth`, `notice`), not by page. English is the reference shape and gives
  type-checked keys (`i18n/i18n.types.ts`).
- Placeholders are ICU: `{name}`, plurals `{count, plural, one {...} other {...}}`. Never build sentences
  by concatenation.
- Dates and numbers through `shared/lib/format.ts` with the current locale; never hardcode a locale.
- Link with `Link` / `useRouter` from `@/i18n/navigation` (keeps the locale prefix); `next/link` is
  banned by lint.

## Design tokens

All tokens live in `src/styles/tokens.css` (raw colour values, light `:root` + `.dark`) and
`src/styles/globals.css` (`@theme`: Tailwind utilities). Components use the utilities, never raw
values; `local/no-hardcoded-colors` rejects hex/rgb, palette classes, arbitrary colours and also
arbitrary or raw values that bypass the scales below (`z-[999]`, `z-50`, `duration-[350ms]`,
`duration-300`, `ease-[...]`, `animate-[...]`, `font-['Arial']`), naming the token to use.

| Family      | Tokens (utility)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | Notes                                                                                                                                                                                                                                                                                                                                                 |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Colour      | `canvas`, `surface`, `surface-raised/-warm/-hover/-sunken`, `fg`, `fg-muted/-subtle/-brand`, `brand`, `brand-hover`, `on-brand`, `danger(-subtle)`, `on-danger`, `success(-subtle)`, `warning(-subtle)`, `info(-subtle)`, `border`, `border-strong`, `ring`, `overlay`, `on-overlay` (text over photos and scrims) (`bg-*`, `text-*`, `border-*`...)                                                                                                                                                                                                                     | values in `tokens.css`; the default palette is removed                                                                                                                                                                                                                                                                                                |
| Font        | `font-sans` (Inter -> system), `font-cjk` (Noto Sans SC -> PingFang SC, Hiragino Sans GB, Microsoft YaHei -> system), `font-mono` (JetBrains Mono -> system mono)                                                                                                                                                                                                                                                                                                                                                                                                        | next/font self-hosts the files at build (no runtime Google request). Body uses `font-sans`; `:lang(zh)` (zh pages and `lang="zh"` snippets on vi/en pages) uses `font-cjk`. Noto Sans SC is loaded only on zh pages (`ZhFontLoader`, a client `next/dynamic`), so /vi and /en never reference its files; snippets there fall back to system CJK fonts |
| Typography  | `<Prose>` (`ui/primitives/Prose.tsx`) = `prose prose-tokens max-w-none`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | @tailwindcss/typography; `prose-tokens` maps every `--tw-prose-*` to colour tokens, so it follows dark mode without `prose-invert`                                                                                                                                                                                                                    |
| Motion      | `duration-fast` 120ms, `duration-normal` 200ms, `duration-slow` 320ms; `ease-standard`, `ease-emphasized` (enter), `ease-exit`; `animate-fade-in` (overlays), `animate-scale-in` (Dialog), `animate-slide-in` (Toast, menus); page motion: `animate-rise` + `stagger-<n>` (hero entrance), `reveal` (on scroll), `animate-float` (floating cards), `animate-drift-*` (closed sticker paths), `animate-grow-x`/`-y` (meters, bars), `animate-ring-fill`, `animate-marquee`, `animate-caret`, `scroll-raise` (sticky chrome); helpers `animation-paused`, `scrollbar-none` | `prefers-reduced-motion: reduce` removes animations, transitions and delays globally. `reveal` and `scroll-raise` are CSS scroll-driven: without support or with reduced motion the content simply shows. Put `reveal` on a wrapper, never on an element that also moves on hover (both own `translate`)                                              |
| Z-index     | `z-base` 0, `z-dropdown` 10, `z-sticky` 20, `z-overlay` 40, `z-dialog` 50, `z-toast` 60, `z-tooltip` 70                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | low to high; a Select inside a Dialog passes `contentClassName="z-dialog"`                                                                                                                                                                                                                                                                            |
| Breakpoints | `sm` 40rem, `md` 48rem, `lg` 64rem, `xl` 80rem, `2xl` 96rem                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | Tailwind's defaults, declared in `@theme` so they are owned here. Design for 375px first                                                                                                                                                                                                                                                              |
| Radius      | `rounded-control` 0.5rem, `rounded-card` 1rem, `rounded-dialog` 1.5rem (also the `TintCard`)                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | Large and soft, as in the reference cards. `rounded-full` only for things that are circles (avatars, a play button, a dot) and the pill buttons inside the closing banner                                                                                                                                                                             |
| Shadow      | none: `shadow-raised` and `shadow-float` are `none`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | The look is solid colour blocks, borders and large radii; no component adds a shadow                                                                                                                                                                                                                                                                  |

Adding a token: put the value in `tokens.css` (colours) or the `@theme` block (others), add a
`@utility` in `globals.css` when Tailwind has no theme namespace for it (z-index, duration), and
document it here. The lint rule reads the token names from `globals.css`.

## Astryx and ui/

Controls come from **Astryx** (`@astryxdesign/core`, MIT, 0.7, built on React 19 and StyleX); `src/ui/`
holds only what Astryx does not have (page layout, our cards, motion, the progress ring). Do not
write a button, input, dialog or toast by hand: use the Astryx one.

| Need                     | Use                                                | Notes                                                                                                                                                                                                                                                      |
| ------------------------ | -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Button, link button      | `Button` from `@astryxdesign/core/Button`          | `label` is required and is the text (a string, through `t()`); `variant` `primary｜secondary｜ghost｜destructive` (default is `secondary`, so say `primary`); `isDisabled`, `isLoading`, `isIconOnly`, `icon`, `endContent`; with `href` it renders a link |
| Status label             | `Badge`                                            | `variant` `neutral｜info｜success｜warning｜error` plus colours (`blue`, `red`...); `label` is the text; no `size`                                                                                                                                         |
| Icon                     | `Icon` from `@astryxdesign/core/Icon`              | `size` `xsm｜sm｜md｜lg` = 12/16/20/24px; `label` (not `aria-label`) names a meaningful icon                                                                                                                                                               |
| Text, long text, choice  | `TextInput`, `TextArea`, `Selector`                | controlled (`value`, `onChange(value)`), `label` required (`isLabelHidden` to hide it), errors through `status={fieldError(message)}`                                                                                                                      |
| Dialog                   | `Dialog` + `DialogHeader`                          | `isOpen`, `onOpenChange`, `purpose="form"`; body and footer are your own markup                                                                                                                                                                            |
| Toast                    | `useToast()`                                       | `showToast({ body, type: "error" })`; no provider needed                                                                                                                                                                                                   |
| Empty, loading, progress | `EmptyState`, `Skeleton`, `Spinner`, `ProgressBar` | `ProgressBar` needs `label`; we pass `isLabelHidden`                                                                                                                                                                                                       |
| Failed screen            | `ui/feedback/ErrorState`                           | a thin wrapper over `EmptyState`                                                                                                                                                                                                                           |

Wiring (do not undo it):

- **Cascade layers.** `globals.css` declares `@layer reset, theme, base, astryx-base, astryx-theme, components, utilities;`
  first, and `app/[locale]/layout.tsx` imports it before anything else. Tailwind utilities sit above
  the Astryx layers, so `className="w-full"` on an Astryx component wins. Never import a stylesheet
  above it, and never add an unlayered reset: it would beat every Astryx style.
- **Theme.** `Providers` wraps the app in `<Theme theme={trellisTheme} mode={useThemeMode()}>`.
  `trellisTheme` extends `neutral` with this project's tokens as `var()`s (font, accent, surfaces,
  radii), so Astryx and Tailwind switch light/dark together through the `.dark` class. Its editable
  source is `src/styles/trellisTheme.ts`; `npm exec -- astryx theme build src/styles/trellisTheme.ts`
  generates `trellis.js` and `trellis.css` for SSR-safe first paint. Both app entry points are wired
  in `Providers.tsx` and `globals.css`. Rebuild after changing the source; never hand-edit generated
  theme files. Change tokens in the source or `tokens.css`; never override Astryx tokens on `:root`.
- **Links.** `<LinkProvider component={Link}>` makes every `href` on an Astryx component go through
  next-intl's `Link`. Do not pass `as={Link}`: a Server Component cannot hand a component to a
  Client Component.
- **Icons.** Astryx components are Client Components, and a Server Component cannot pass them a
  plain function (`icon={ArrowRight}` from `lucide-react` fails at runtime). Import icons from
  `@/ui/icons/lucide`, a `"use client"` re-export, and add a name there when you need a new one
  (lint blocks `lucide-react` elsewhere; `import type` is fine).
- **Headings.** The Astryx theme styles `h1-h6`; `globals.css` makes them inherit again so pages keep
  the site's type. Astryx components that render a heading inherit from their container.
- **Motion tokens.** Ours are `--motion-fast|normal|slow` because Astryx also defines
  `--duration-fast` and `--duration-slow`; the `duration-*` utilities keep their names.
- **StyleX.** There is no StyleX compiler in the build, so do not use `xstyle`. Style an Astryx
  component with props first, then `className` with token-backed Tailwind utilities.
- **i18n lint.** Variant-like Astryx props (`statusVariant`, `startIcon`, `width`, `purpose`, `variant`,
  `size`...) are allow-listed as non-copy; `label`, `title`, `description`, `placeholder` are copy and
  must come from `t()`.

Agents: `npm exec -- astryx component <Name>` prints a component's import and props, `astryx docs
<topic>` the guides, `astryx search "<query>"` finds anything. Read the props before using one; the
managed block at the end of this file has the CLI workflow (it overrides nothing above: where it says
"no `<div>`" or "Badge = counts only", this repo's page recipes and rules below win).

### `src/ui/` (what is ours)

- Grouped by what a component is, one level deep, imported by the full path
  (`@/ui/layout/PageHero`): `primitives/` (IconTile, Prose), `feedback/` (ErrorState,
  ProgressRing), `layout/` (Container, PageShell, Section, SectionHeader, PageHero, CallToAction),
  `card/` (Card, TintCard), `motion/` (InView, TypedText), `icons/` (`lucide.ts`), `lib/` (`cn`).
  Add a group only when three or more components would share it.
- Components take **already-translated** text via props; `ui/` never calls `useTranslations`.
- API conventions: a `XxxPropsDefaults` type + `xxxDefaults` object; `className` on the root element
  merged with `cn()`; variants via `cva`.
- Colours only through semantic tokens (`bg-surface`, `text-fg-muted`, `border-border`).
  Raw values live only in `src/styles/tokens.css`. Tailwind's default palette is removed from the theme.
- Page columns use `Container` (`PageShell` does this), so header, sections and footer share one
  left edge. Check phone width (375px) for every layout: `document.documentElement.scrollWidth`
  must stay 375.

### Page composition (public pages)

One shared recipe for public pages, with the homepage's Astryx-inspired showcase as the explicit variant:

| Band          | Component                                                            | Colour                                                                                       |
| ------------- | -------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Header/footer | `AppHeader` / `AppFooter`                                            | `bg-surface`, the same for both                                                              |
| Hero          | `ui/layout/PageHero`; home: `features/home/sections/HomeHero`        | `bg-info-subtle`; home uses a centered `surface-warm` panel with corner artwork              |
| Sections      | `ui/layout/Section` + `SectionHeader`                                | `variant` `canvas`, then `surface`, alternating; never two alike in a row                    |
| Closing       | `ui/layout/CallToAction`; home: `features/home/sections/HomeClosing` | `bg-brand` for public pages; home uses a warm neutral panel; once per page, above the footer |

- One card: `ui/card/Card` (`cardVariants` for a card that is a link), `isInteractive` for the hover
  lift. Icons beside a heading sit in `ui/primitives/IconTile`. Figures are type (value over label), not tiles.
- Courses in a grid are the one exception to the card: a frameless video-style tile
  (`features/learning/shared/CourseThumbnail` + `features/marketing/cards/CourseCard`): photo under a corner scrim, the fixture's
  `thumbnailHook` in heavy type, the length as a clock, a play button on hover, then the teacher's
  avatar beside the title. Text over a photo uses `text-on-overlay`, never `text-on-brand`.
- Type scale: hero `h1` `text-4xl md:text-5xl font-bold`, section `h2` `text-2xl md:text-3xl`, card
  `h3` `text-base`/`text-lg`. No arbitrary sizes (`text-[30px]`) and no letter-spacing hacks.
- **Flat only: no gradients, glows, glass or shadows.** Backgrounds are solid tokens (`bg-surface`,
  `bg-canvas`, `bg-info-subtle`, `bg-brand`, the pastel `bg-tint-amber|mint|rose`); depth comes from
  colour blocks, borders and large radii. Bar and ring fills use a solid colour or the same colour
  at lower opacity (`bg-brand/30`).
- Showcase cards are `ui/card/TintCard`: a photo or header on top, a solid pastel body, a large title,
  plain `text-fg` copy and an arrow link. Pass `variant` (`amber|mint|rose|sky`); wrap it in a
  `Link` with `tintCardVariants` when the whole card navigates.
- Time-based motion that must wait until a block is seen (a chat that types, bars that rise) goes
  through `ui/motion/InView` (arms on mount, `visible` on first sight) with the `IN_VIEW_*` classes, and
  `ui/motion/TypedText` / `features/home/components/CountUp` for text and numbers. Content is only hidden after the
  browser has mounted the observer, so with no JavaScript everything shows. Never pass a function
  as a child of `InView`: it is a client component and its parent may be a server one.
- Motion: the hero's parts `animate-rise` with `stagger-1..4` (built into `PageHero`); grid items
  below get `reveal` on their `li`; arrows in buttons nudge with `group-hover:translate-x-0.5`.
- `ui/` variant props are `variant` and `size` (allow-listed by the i18n lint rule); a literal
  `tone=` or `padding=` in JSX fails `i18next/no-literal-string`.

## File naming

- Components `PascalCase.tsx`; hooks `useThing.ts`; DataHub suffixes for the rest: `X.types.ts`,
  `X.constants.ts`, `X.api.ts`, `X.queries.ts`, `X.utils.ts`, `X.hooks.ts`.
- **No barrel files** (`index.ts`). Import the owning file.
- Tests in `__tests__/X.test.ts(x)` next to the code (tooling only for now, see "Testing policy" above).
- Generated files end in `.generated.ts`, are ignored by lint and never edited by hand.

## Lint rules

| Rule                                 | Enforces                                                                                        |
| ------------------------------------ | ----------------------------------------------------------------------------------------------- |
| `local/no-hardcoded-colors`          | no hex/rgb/hsl, no `bg-[#...]` / `bg-[var(...)]`, no palette classes; message lists the tokens  |
| `local/ui-boundary`                  | `src/ui` imports nothing from app, features, entities, shared/api, mocks                        |
| `local/no-raw-fetch`                 | `fetch` only in `src/shared/api/http.ts`                                                        |
| `i18next/no-literal-string`          | no literal copy in JSX                                                                          |
| `@typescript-eslint/no-explicit-any` | no `any`                                                                                        |
| `consistent-type-definitions`        | `type`, not `interface` (except module augmentation)                                            |
| `no-restricted-imports`              | no barrels, no `next/link`, no axios, no `lucide-react` value imports (use `@/ui/icons/lucide`) |
| `react-hooks` (v7)                   | rules of hooks + React Compiler checks                                                          |

Local rules live in `eslint-rules/`, each with a RuleTester test in `eslint-rules/__tests__/`.

### Adopting a new rule gradually (git baseline)

`eslint-rules/git-baseline.mjs` (adapted from DataHub's `no-antd-imports`) lets a rule exempt files that
already broke it on the target branch, so a rule can land without fixing the whole codebase at once.
A rule opts in by accepting a `baseline` option (`no-raw-fetch` and `no-hardcoded-colors` do):

```js
"local/no-raw-fetch": ["error", {
  allow: ["src/shared/api/http.ts"],
  baseline: { grep: "fetch\\(", pathspec: "src" },   // git grep -E pattern
}],
```

Files matching `grep` on the baseline ref (`$TRELLIS_LINT_BASELINE_REF`, default `origin/HEAD`) are
exempt, renamed ones included; new files are not. If git cannot answer it fails open, so CI must set
the ref explicitly. Remove the `baseline` option once the last exempt file is fixed.

## Bundle budget

`scripts/budget.json` holds First Load JS (gzip, root + layouts + page) per route. Over the slack: warning;
over 10%: failure; shrunk beyond the slack: a notice to ratchet the budget down. Feature changes do not
raise budgets; record intended growth with `npm run budget:check -- --update` in its own change.

## How to add...

**An entity** `entities/<d>/`: `<d>.types.ts`, `<d>.constants.ts` (API paths, `<D>_ERRORS`, enums as
`as const` objects, `<D>_ERROR_MESSAGES`), `<d>.api.ts`, `<d>.queries.ts` (key factory + hooks). Add mock
handlers in `mocks/<d>.handlers.ts`, a seed in `mocks/<d>.seed.ts`, a domain in `mocks/domains.ts` and
its group in `mocks/routes.ts`.

**A feature** `features/<f>/<group>/`: components that call entity hooks; derive the screen state with
`screenStateOf`; add a route `app/[locale]/<path>/page.tsx` that only renders the feature; add the path
to `ROUTES`; add a message namespace if needed (all three locales); add analytics events to
`shared/lib/analytics.ts` if the feature needs them.

**A locale**: add it to `LOCALES` and `INTL_LOCALES` in `i18n/routing.ts`, create
`messages/<locale>/` with every namespace, add its name to `common.locale` in every locale, run
`npm run i18n:check`.

**A message namespace**: add it to `NAMESPACES` in `i18n/messages.ts` and to `AppMessages` in
`i18n/i18n.types.ts`, create the JSON in every locale.

**A feature flag**: add the key and its safe default to `FeatureFlags` / `DEFAULT_FEATURE_FLAGS` in
`shared/lib/featureFlags.ts`; read it with `useFeatureFlag("key")`. Check the flag-off branch.

**An e2e test**: `e2e/tests/<area>/<name>.spec.ts`, import `test` from `e2e/fixtures/base-test.ts`, use a
page object extending `BasePage`, tag with `TestTag.P0` if it guards the critical path, choose the user
with `test.use({ user: USER_KEYS.ADMIN })`.

<!-- ASTRYX:START -->

Astryx v0.7.16 · 174 components
CLI: run every command as `npm exec -- astryx <cmd>` (shown below as `astryx ...`).

SETUP (once, in app entry e.g. main.tsx) — without these, components render unstyled:
import "@astryxdesign/core/reset.css";
import "@astryxdesign/core/astryx.css";

WORKFLOW — start every page from a template, never from scratch:

1. `astryx build "<idea>"` — names the template to scaffold from and the parts it lacks.
2. `astryx template <name> <path>` — scaffold it; keep its frame, gap and padding; replace the content.
3. `astryx template <Block>` for parts it lacks; `astryx component <Name>` to read props before using one.
   Changing an existing page? Keep it: skip step 2 and add blocks/components inside its sections.
   Before you deliver a build, run `astryx doctor --built <dir>`; don't deliver it if it fails.

RULES:

- No <div> — components handle all layout and spacing.
- Read `astryx docs layout` before changing a template's frame.
- Dense data = rows (Table, List/Item), not Card-wrapped lists. Badge = counts only.
- Style with component props first, then Tailwind utilities backed by tokens. No raw hex/px.
- THEMES: palettes and custom colors go through the theme, never :root overrides. To make or change a theme (colors, fonts, corners, spacing, a look from a picture), prefer the experimental theme editor over hand-written theme files: `astryx experimental theme editor new <name> --like neutral`, then `editor set <name> <thing> <value>` or `editor how "<what you want>"`; wire it with `astryx theme add <name>`; after each change look at it with `astryx experimental theme editor show <name> --png` and open the PNGs it writes (changes nothing in the app); a theme change is not done until you have looked at the pictures. In code, extend an imported theme to customize it; `theme eject <slug>` only forks source. See `astryx docs theme`.
- SELF-CHECK: re-read the file; replace any style={{…}}, raw <div>/<span>, imported .css/@apply, or hardcoded/arbitrary value (bg-[#fff], p-[13px]) with the component or a token-backed utility.

`astryx help` lists every command. Key ones beyond the workflow:
search "<query>" find any component / hook / doc / template
discover <words> integrations you could add
docs <topic> getting-started, principles, tokens, theme … (`astryx docs` lists all)
docs cli commands and API reference
docs authoring build an integration package, and every field it holds
upgrade --from <old version> --apply run after a dependency bump
<!-- ASTRYX:END -->

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
