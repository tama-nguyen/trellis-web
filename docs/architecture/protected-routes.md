# Authentication route groups

The merged `refactor/split-routes-by-feature` branch renames the sample notice domain and its
routes to notification (`/notifications`, `/notifications/[notificationCode]`) and changes its
admin permission to `notification:manage`. The before/after inventory below records the route
guard refactor before that rename. Route constants now live in feature-specific files under
`src/shared/constants/routes/`; authentication and the localized metadata helper are retained.

The sibling backend checkout currently exports the older notice schema. Regenerating the
notification GraphQL document against it fails with `Cannot query field "notification" on type
"Query"`. The merge retains the generated notification snapshots from the incoming branch.
Contract generation requires a backend checkout with the matching notification contract.

All paths below have a locale prefix (`vi`, `en` or `zh`). Route groups do not change URLs.

## Before and after

Before:

```text
[locale]/
  (site)/layout.tsx                   header/footer
    (protected)/layout.tsx            RequireAuth, noindex
      account/
      admin/                         notice:manage, AdminShell
    courses/, catalog/courses/[courseSlug]/, identity and marketing pages
  learn/layout.tsx                    LearningShell, no shared authentication
    catalog/page.tsx                  RequireAuth
    catalog/[code]/page.tsx           RequireAuth
  studio/layout.tsx                   instructor LearningShell
  search/layout.tsx                   learner LearningShell
  assessments/
```

After:

```text
[locale]/
  layout.tsx                         locale, providers, root HTML
  _components/SiteShell.tsx           visual header/footer only
  (site)/layout.tsx                   SiteShell
    public pages
  (protected)/layout.tsx              one RequireAuth, noindex, Suspense
    (site)/layout.tsx                 SiteShell
      loading.tsx                    existing account/admin skeleton
      account/
      admin/layout.tsx               notice:manage, AdminShell
    learn/layout.tsx                 learner LearningShell
    studio/layout.tsx                instructor LearningShell
    search/layout.tsx                learner LearningShell
    assessments/                     existing standalone assessment screens
```

The shared guard owns session loading, failures and login navigation. The two catalog page guards
were removed after moving their parent tree under the shared guard. Deep-link query parameters are
retained in the login return path. SiteShell owns presentation only; LearningShell's role prop selects
navigation and visuals. Neither shell grants permissions.

## Route inventory

| Boundary                                | Routes (without locale prefix)                                                                                                                                                                                                                                                                          |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public marketing                        | `/`, `/courses`, `/catalog/courses/[courseSlug]`, `/educators`, `/pricing`, `/resources`                                                                                                                                                                                                                |
| Public identity                         | `/login`, `/register`, `/verify-email`, `/forgot-password`, `/reset-password`                                                                                                                                                                                                                           |
| Public notice UI                        | `/notices`, `/notices/[noticeCode]`; API calls retain backend authorization                                                                                                                                                                                                                             |
| Public fallback                         | `[...rest]` retains existing not-found behavior                                                                                                                                                                                                                                                         |
| Authenticated learner                   | `/learn`, `/learn/courses`, `/learn/courses/[courseSlug]`, `/learn/catalog`, `/learn/catalog/[code]`, `/learn/progress`, `/learn/achievements`, `/learn/messages`, `/learn/notes`, `/learn/bookmarks`, `/learn/study-plan`                                                                              |
| Authenticated instructor UI             | `/studio`, `/studio/courses/new`, `/studio/courses/[courseSlug]`, `/studio/courses/[courseSlug]/publish`, `/studio/assessments/[assessmentId]`, `/studio/assignments`, `/studio/grading`, `/studio/resources`, `/studio/certificates`, `/studio/students`, `/studio/question-bank`, `/studio/analytics` |
| Authenticated assessment                | `/assessments/[assessmentId]`, `/assessments/[assessmentId]/start`, `/assessments/[assessmentId]/attempts/[attemptId]`                                                                                                                                                                                  |
| Authenticated search/account            | `/search`, `/account`                                                                                                                                                                                                                                                                                   |
| Authenticated and permission restricted | `/admin`: existing `notice:manage` requirement                                                                                                                                                                                                                                                          |

## Data and security boundaries

Public discovery uses marketing fixtures (`CatalogPage`, public course preview); authenticated
`/learn/catalog` uses the authorized REST course API through client queries. Moving routes does not
make the backend course API public. Ordinary reads and commands continue through REST; composed
notice reads retain selective GraphQL.

RequireAuth is a client UX guard. The current session is stored in localStorage, unavailable to
server layouts or proxy.ts. The proxy continues locale routing only. The shared guard does not
protect API routes, server actions or server component data access. Server components can execute
before a client guard resolves: any future private server fetch must independently authenticate and
authorize before accessing data. Existing moved route components render client feature screens or
fixtures and do not perform private server data fetches.

Backend Bearer/internal authentication and resource authorization remain the authority. The BFF
strips internal delegation headers; its existence does not authenticate an anonymous browser.
Protected pages inherit noindex; metadata and URL declarations otherwise remain unchanged.

Page titles use `createLocalizedMetadata` from `src/i18n/metadata.ts`, for example
`export const generateMetadata = createLocalizedMetadata("learning.gradingPage.title")`.
The helper resolves the route locale and accepts only existing message keys. Additional page
metadata (such as identity pages' `robots`) can be passed as its second argument. The locale
layout retains the shared title template and the protected layout retains its noindex policy.

Studio currently contains mock instructor screens with no established instructor permission guard.
This refactor requires authentication there but does not define a new business permission or equate
global course management with instructor status. Instructor authorization and production cookie
sessions require separate approved work. Admin keeps its existing notice permission boundary.

## Verification

Use the repository gates: `npm run lint`, `npm run format:check`, `npm run typecheck`, `npm test`,
`npm run contracts:check`, `npm run i18n:check`, `npm run build`, `npm run budget:check`.

`npm run test:e2e -- e2e/tests/auth/protected-routes.spec.ts e2e/tests/auth/security-boundary.spec.ts`
checks public access, all protected area families across locales, return paths including query,
login, refresh, area navigation, admin denial, logout and the proxy header boundary. Default
Playwright runs use in-browser mocks; these results do not establish real backend authorization.
The real backend native lifecycle requires isolated backend/PostgreSQL/Mailpit and
`E2E_BASE_URL`/`E2E_MAILPIT_URL` as described in backend native-auth-verification.md.

## Observed results (2026-11-27)

- `npm run lint`, `npm run format:check`, `npm run typecheck`, `npm test`,
  `npm run i18n:check` and `npm run build` passed. Vitest: 76 tests in nine files.
- `npm run test:e2e -- e2e/tests/auth/protected-routes.spec.ts`: three scenarios passed
  against the browser mock backend. The anonymous scenario covers seven area families in all
  three locales. It also asserts no private course request is sent before login.
- Source route inventory comparison: all 43 page URL patterns preserved with no duplicates.
- `npm run budget:check` exited 0. Existing numeric limits were preserved while source route
  keys moved with the folders. It reports size warnings and five previously unbudgeted pages;
  no limits were raised.
- `npm run contracts:check` failed with `Stale REST types`: the committed web REST snapshot
  differs from the sibling backend snapshot. This refactor changes neither snapshot.
- Running the existing `security-boundary.spec.ts` without a real backend failed: the BFF
  returned 503 instead of the expected 401. The proxy unit regression test passed in Vitest.
- Backend command (JDK 21): `./gradlew --offline :trellis-app:test --tests '*InternalKeySecurityTest' --tests '*Course*Authorization*Test'`
  passed. The current checkout matched `CourseAuthorizationTest`: ten tests, zero failures,
  errors or skips. The internal-key class pattern did not match a test in this checkout.
  These are real backend HTTP/database authorization tests; the real native browser lifecycle
  was not rerun for this route-only refactor.
