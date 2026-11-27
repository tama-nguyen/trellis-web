# Trellis web review rules (TypeScript / React)

Rule shape adapted from DataHub (https://github.com/datahub-project/datahub), file
`.cursor/BUGBOT.md`, commit `1415bedd`. Copyright 2015 LinkedIn Corp. and DataHub contributors,
Apache License 2.0. **Only the "if X, then flag it, with this title" format is taken; every rule
below is Trellis's own**, sourced from `AGENTS.md` at the repo root. See NOTICE.

Each rule: the trigger, what to say, the title to file it under. Prefer correctness, leaks and
broken follow-through over style — Prettier owns formatting, ESLint owns the mechanical rules.

---

## Data pipeline

If `fetch` is called anywhere other than `src/shared/api/http.ts`, or a second HTTP client
(axios, ky, a bare `XMLHttpRequest`) appears, then:

- Blocking. `http.ts` is the only caller: it adds the bearer token, single-flights the refresh on a
  stale-token 401, passes `FormData` untouched and throws `ApiError`. Anything else loses all of
  that. Lint: `local/no-raw-fetch`.
- Title: "Raw fetch outside http.ts"

If a URL is built by string concatenation or template literal instead of `pathParams` / `params`,
then:

- Flag it: unencoded ids and lost query handling.
- Title: "Build URLs with pathParams/params"

If a React Query key is written inline instead of coming from the entity's key factory
(`notificationKeys.all / list(params) / detail(id)`), then:

- Flag it: nothing can invalidate a key it cannot name. Invalidate through the factory.
- Title: "Query key not from the factory"
- Severity: high.

If `<d>.api.ts` caches, holds UI, or drops React Query's `signal`, then:

- Flag it: it is a thin typed wrapper and nothing else.
- Title: "Entity api layer is doing too much"

If server state is copied into `useState`, a ref or a store, then:

- Flag it: React Query owns it. The one exception is the auth token
  (`entities/auth/auth.session.ts`); the user comes from `useMe()`.
- Title: "Server state copied into local state"
- Severity: high.

If a new list endpoint is consumed with page numbers, then:

- Flag it: the real backend returns `CursorPage<T>` (`items`, `nextCursor`, `hasNext`, requested
  with `first` + `after`). Use `useInfiniteQuery` and a "load more" control; there is no total.
  `Page<T>` stays only for the offset admin endpoints.
- Title: "Keyset paging, not page numbers"

If an idempotent action sends a key that is not from `useAttemptKey(scope)`, or never calls
`settle(...)`, then:

- Flag it: a retry either duplicates the write or is refused forever.
- Title: "Attempt key mishandled"

---

## Errors

If the server's error text is shown for anything other than a validation problem
(`type === PROBLEM_TYPES.VALIDATION`), then:

- Blocking. Everything else maps code -> status -> a generic message. Use
  `getApiErrorMessage(error, t, { codeMessages })` inline, `useApiErrorHandler()` for toasts, and
  put per-code messages in the entity (`AUTH_ERROR_MESSAGES`).
- Title: "Server error text leaked to the user"

If a resource the caller may not see is surfaced as 403, then:

- Blocking: it must read as **not found**. A 403 confirms the resource exists.
- Title: "403 where 404 is required"

---

## Layering

If `src/ui/` imports from `app`, `features`, `entities`, `shared/api` or `mocks`, then:

- Blocking: `ui/` knows nothing about the app. Lint: `local/ui-boundary`.
- Title: "ui/ boundary"

If an import goes against `app -> features -> entities -> shared -> ui`, then:

- Blocking.
- Title: "Layer direction"

If an `index.ts` that only re-exports is added, then:

- Flag it: no barrel files; import the file that owns the thing. Lint: `no-restricted-imports`.
- Title: "Barrel file"

If a `ui/` component calls `useTranslations`, then:

- Flag it: `ui/` takes already-translated text as props.
- Title: "ui/ translating its own copy"

If a route file under `app/[locale]/` contains anything beyond rendering a feature, then:

- Flag it: pages are thin and stay server components; `"use client"` goes only where a browser API
  or a hook needs it.
- Title: "Route file holds logic"

---

## React

If `useEffect` is used for derived state, to react to a user event, or to chain state, then:

- Flag it: compute during render, react in the event handler. Effects are only for external
  systems — navigation, analytics, storage events, subscriptions.
- Title: "useEffect for derived state"
- Severity: high.

If a data-driven screen is missing one of the five states — loading (a skeleton shaped like the
content), empty (saying how to move forward), error (mapped message + retry), not found (also used
for "not yours"), ready — then:

- Flag it, naming the missing one. `PageShell` with
  `state={screenStateOf(query, { isEmpty })}` gives all five.
- Title: "Missing screen state"

If a hook is hand-rolled where `shared/hooks/` already has it (`useDebouncedCallback`,
`useStableValue`, `useLatest`, `usePagination` / `useUrlPagination`, `useAttemptKey`,
`useFeatureFlag`), then:

- Flag it and name the existing hook.
- Title: "Re-implemented shared hook"

If UI is gated on a role or a flag but the backend is not, then:

- Blocking: hiding is not authorization. Gate with `useCan().can(PERMISSIONS.X)` or
  `<RequirePermission>` _and_ make sure the backend enforces it.
- Title: "Hidden button as authorization"

If a feature flag is added without a safe default in `DEFAULT_FEATURE_FLAGS`, or the flag-off
branch is untested by eye, then:

- Flag it.
- Title: "Feature flag without a safe default"

---

## Tokens and styling

If a hex/rgb/hsl value, a Tailwind palette class (`bg-blue-500`), an arbitrary colour
(`bg-[#fff]`, `bg-[var(--x)]`), or a raw value that bypasses a scale (`z-50`, `z-[999]`,
`duration-300`, `duration-[350ms]`, `ease-[...]`, `animate-[...]`, `font-['Arial']`) appears
outside `src/styles/tokens.css`, then:

- Flag it and name the token: colour (`bg-surface`, `text-fg-muted`, `border-border`,
  `bg-danger-subtle`, ...), z-index (`z-dropdown` 10, `z-sticky` 20, `z-overlay` 40, `z-dialog` 50,
  `z-toast` 60, `z-tooltip` 70), motion (`duration-fast|normal|slow`,
  `ease-standard|emphasized|exit`), radius (`rounded-control|card|dialog`), shadow
  (`shadow-raised`). Lint: `local/no-hardcoded-colors`.
- Title: "Raw value instead of a token"

If a new token is added without the value in `tokens.css` (colours) or the `@theme` block
(everything else), a `@utility` in `globals.css` where Tailwind has no namespace, and a row in the
repo-root `AGENTS.md` "Design tokens" table, then:

- Flag it: the lint rule reads the token names from `globals.css`, so a half-added token is
  invisible to it.
- Title: "Token added in only one place"

If a layout was not checked at 375px, or a page column is not `Container` / `PageShell`, then:

- Flag it: phone width first.
- Title: "Layout not checked at phone width"

If a public page skips the page composition in `AGENTS.md` ("Page composition") — its own hero
markup instead of `PageHero`, two neighbouring sections in the same tone, a second card style, an
arbitrary text size (`text-[30px]`), `rounded-full` on a box, or a `reveal`/`animate-*` that leaves
content hidden without motion support — then:

- Flag it: pages drift apart one exception at a time, which is how the site became inconsistent.
- Title: "Page breaks the shared composition"

If a screen hand-writes a button, input, select, dialog, toast, badge, spinner, skeleton or empty
state instead of using the Astryx component, passes `as={Link}`, imports `lucide-react` directly
(not through `@/ui/icons/lucide`), uses `xstyle`, or overrides an Astryx token on `:root`, then:

- Flag it: the design system is the one source of controls, and the wiring (cascade layers, theme,
  `LinkProvider`, the client icon barrel) in `AGENTS.md` "Astryx and ui/" depends on these rules.
- Title: "Astryx not used, or its wiring bypassed"

If an Astryx `Button` is left on its default variant where a primary action was meant (Astryx
defaults to `secondary`), or its `label` is a literal instead of a next-intl key, then:

- Flag it. Lint: `i18next/no-literal-string` for the label.
- Title: "Astryx Button variant or label"

If a new `ui/` component breaks the API conventions — a `XxxPropsDefaults` type plus an
`xxxDefaults` object, native props passed through, `className` merged onto the root with `cn()`,
`*ClassName` for inner parts, `isLoading` showing a spinner and disabling, variants via `cva` —
then:

- Flag the specific deviation.
- Title: "ui/ API convention"

---

## i18n

If user-visible copy is a literal instead of a next-intl key, then:

- Flag it. Lint: `i18next/no-literal-string` (JSX only).
- Title: "Literal copy instead of an i18n key"

If a key is added to one locale only, or a `{placeholder}` differs between locales, then:

- Flag it: `npm run i18n:check` fails. English is the reference shape and gives the typed keys.
- Title: "Locale parity"
- Severity: high.

If a sentence is built by concatenation, or a plural is handled with an `if`, then:

- Flag it: ICU — `{count, plural, one {...} other {...}}`.
- Title: "Sentence assembled in code"

If a date or number is formatted without `shared/lib/format.ts`, or a locale is hardcoded, then:

- Flag it.
- Title: "Hardcoded locale"

If `next/link` or `next/navigation`'s router is used instead of `Link` / `useRouter` from
`@/i18n/navigation`, then:

- Flag it: the locale prefix is lost. Lint: `no-restricted-imports`.
- Title: "Navigation drops the locale"

---

## Types and constants

If `any` appears, or an `interface` is used where a `type` would do (outside declaration merging),
then:

- Flag it. Lint: `@typescript-eslint/no-explicit-any`, `consistent-type-definitions`.
- Title: "Typing"

If a domain value, code, status, route or storage key appears as an inline literal, then:

- Flag it: it belongs in `<X>.constants.ts` or `shared/constants/`. Exempt: UI copy (which goes
  through i18n anyway), log text, test fixtures.
- Title: "No magic strings"
- Severity: medium.

If an entity defines a shape by hand that the generated contract types already describe, then:

- Flag it: re-export the generated shape under a domain name (`NotificationSummary`) and take enum values
  from the generated `as const` objects, so a contract change breaks the build instead of drifting.
- Title: "Hand-written shape duplicates a contract type"

---

## Backend access and deployment

If a `NEXT_PUBLIC_` backend URL is introduced, or a backend origin is otherwise baked into the
build, then:

- Blocking: the server reads `TRELLIS_BACKEND_URL` at runtime (`shared/api/backend.ts`); a baked
  origin ties the image to one environment, and the browser calls same-origin `/api/...` through
  the BFF.
- Title: "Backend URL in the bundle"

If a new BFF or proxy failure path returns a code that is not SCREAMING_SNAKE like the backend's,
or invents a shape other than the problem document, then:

- Flag it: `WEB_PROXY_NOT_CONFIGURED` (503) and `WEB_PROXY_UNREACHABLE` (502) are the pattern.
- Title: "Proxy error contract"

---

## Mocks and generated files

If a mock handler answers with a shape that is not the backend's contract, uses bare literals
instead of the app's constants, or returns 403 for a resource the caller may not see, then:

- Flag it: mocks are typed with the generated types and answer 404 in that case.
- Title: "Mock diverges from the contract"

If a file under `src/shared/api/generated/`, `src/shared/graphql/generated/` or any
`*.generated.ts` is edited, then:

- Blocking. Change the source — which since decision T22 means a change in `trellis-backend` and a
  new `@trellis/contracts` version here.
- Title: "Generated file edited by hand"

---

## Confidentiality and follow-through

If a change alters a contract-facing shape, a route, an error code or a default without updating
its callers, the mocks, the e2e fixtures and the locale files, then:

- Flag the missing ones; prefer high when a gate would fail after merge.
- Title: "Follow-through gap"

If a bundle budget in `scripts/budget.json` is raised in the same change as the feature that
exceeded it, then:

- Flag it: budgets are ratcheted in their own change, with `npm run budget:check -- --update`.
- Title: "Budget raised to fit a feature"

If a real customer name, hostname, database or table name from a real system, or an internal
ticket id appears in code, tests, fixtures, comments or a commit message, then:

- Blocking. Use `example.test` domains and neutral sample data.
- Title: "Confidentiality"
