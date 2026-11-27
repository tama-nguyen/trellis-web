import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { test as base } from "@playwright/test";

/** e2e/ root; the package is ESM, so there is no __dirname. */
const E2E_DIR = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const SEEDED_DIR = path.join(E2E_DIR, ".seeded");
const NO_SEED_ENV = "PW_NO_SEED";

type SeedRecord = { path: string; body: unknown };

/**
 * Seeds data for one feature, once per worker:
 *
 *   test.use({ featureName: "notification" });
 *   // seeds from e2e/tests/notification/fixtures/data.json -> [{ "path": "/api/...", "body": {...} }]
 *   // state file: e2e/.seeded/notification.json
 *
 * `featureName` must be a string literal equal to the test folder name. Stub until a real
 * backend exists: with the in-browser mock there is nothing to POST to, and no data.json yet,
 * so it returns at once. Set PW_NO_SEED=1 to skip entirely. With a real backend, move this to a
 * worker-scoped fixture with a file lock (DataHub's `withArtifactLock`) so parallel workers seed once.
 */
export const seedingFixture = base.extend<{ featureName: string | undefined }>({
  featureName: [undefined, { option: true }],
  page: async ({ page, featureName, request }, use) => {
    if (featureName && !process.env[NO_SEED_ENV]) {
      const stateFile = path.join(SEEDED_DIR, `${featureName}.json`);
      const dataFile = path.join(E2E_DIR, "tests", featureName, "fixtures", "data.json");
      if (!existsSync(stateFile) && existsSync(dataFile)) {
        const records = JSON.parse(readFileSync(dataFile, "utf8")) as SeedRecord[];
        for (const record of records) await request.post(record.path, { data: record.body });
        mkdirSync(SEEDED_DIR, { recursive: true });
        writeFileSync(
          stateFile,
          JSON.stringify({ seededAt: new Date().toISOString(), count: records.length }),
        );
      }
    }
    await use(page);
  },
});
