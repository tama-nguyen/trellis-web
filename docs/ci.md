# GitHub build verification

The workflow is `.github/workflows/ci.yml`. PRs, pushes to `main` and merge queues run the full
gate. Manual **Actions → CI → Run workflow** exposes boolean `run_tests` (default `true`).
Set it to `false` for a build without tests; static checks and packaging still run.

Tool versions come from `mise.toml` and existing package manifests. Action dependencies are pinned
by full SHA and updated weekly by Dependabot. Jobs use Ubuntu hosted runners, a read-only token,
checkout without persisted credentials, cancellation of superseded PR runs and bounded timeouts.

No registry login, image push, package publication or deployment is configured. Docker images are
built on the runner and discarded afterwards. Reports/artifacts are retained for seven days.

## Enable in GitHub

1. Enable Actions in repository settings and permit the pinned `actions/*` and `jdx/mise-action`
   actions. Use read-only workflow permissions. No repository secret is required.
2. Merge the workflow into the default branch so **Run workflow** appears.
3. Run with tests enabled, then require the job's check in the main branch ruleset.
4. Review Dependabot updates to maintain action pins.

## Web checks

**Web build** installs npm from `package.json.packageManager`, runs locked `npm ci`, checks
contracts, TypeScript, ESLint, Prettier and locale parity, runs Vitest with coverage, and checks the
production build and bundle budget. The Docker build also verifies standalone packaging. Unit test
reports and coverage are artifacts.

Contract inputs are fetched from GitHub at `scripts/contracts.json.schemaRevision`. The backend
compiler's own `packageManager` selects pnpm. `TRELLIS_CONTRACTS_REPOSITORY` can override the
backend repository; `TRELLIS_BACKEND_DIR` selects the temporary input directory. CI fetches public
inputs without a token. Private-repository access requires a separately reviewed credential setup.

`run_tests=false` skips Vitest. It retains contract checks, static checks, application build, bundle
budget and Docker build. Playwright is separate from this build-only workflow: the security-boundary
spec requires a real backend and the native lifecycle also requires Mailpit. Run those tests against
an isolated full stack. A local CI-mode trial without that stack had six passes, one flaky pass, one
skip and a failed security-boundary request; it is not a passing E2E verification.

Sources: [GitHub secure use](https://docs.github.com/en/actions/reference/security/secure-use),
[Playwright CI](https://playwright.dev/docs/ci-intro).
