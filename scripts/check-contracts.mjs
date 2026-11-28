/**
 * Verify the backend-owned REST snapshot or published package pin. The companion
 * generate-operations.mjs check validates web-owned GraphQL operations against the backend schema.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CONTRACTS_FILE = path.join(ROOT, "scripts/contracts.json");
/** Every generated file starts with this marker; a hand-edit that strips it is a bug, not a style. */
const GENERATED_MARKER = "GENERATED";
const EXACT_VERSION = /^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$/;

const contracts = JSON.parse(readFileSync(CONTRACTS_FILE, "utf8"));
const pkg = JSON.parse(readFileSync(path.join(ROOT, "package.json"), "utf8"));
const problems = [];

function filesUnder(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? filesUnder(full) : [full];
  });
}

if (contracts.published) {
  const declared = { ...pkg.dependencies, ...pkg.devDependencies }[contracts.package];
  if (!declared) {
    problems.push(
      `${contracts.package} is not a dependency: npm install --save-exact ${contracts.package}@${contracts.version}`,
    );
  } else if (!EXACT_VERSION.test(declared)) {
    problems.push(
      `${contracts.package} is pinned as "${declared}": contracts take an exact version, not a range.`,
    );
  } else if (declared !== contracts.version) {
    problems.push(
      `package.json wants ${contracts.package}@${declared}, scripts/contracts.json says ${contracts.version}.`,
    );
  }

  const installedManifest = path.join(ROOT, "node_modules", contracts.package, "package.json");
  if (!existsSync(installedManifest)) {
    problems.push(`${contracts.package} is not installed: run npm ci.`);
  } else {
    const installed = JSON.parse(readFileSync(installedManifest, "utf8")).version;
    if (installed !== contracts.version) {
      problems.push(
        `${contracts.package}@${installed} is installed, but this app is written against ${contracts.version}.`,
      );
    }
  }

  for (const dir of contracts.generatedDirs) {
    if (existsSync(path.join(ROOT, dir))) {
      problems.push(`${dir}/ still exists: the published package replaced it, delete it.`);
    }
  }
} else {
  for (const dir of contracts.generatedDirs) {
    const full = path.join(ROOT, dir);
    if (!existsSync(full) || !statSync(full).isDirectory()) {
      problems.push(
        `${dir}/ is missing: it holds the committed client until ${contracts.package} is published.`,
      );
      continue;
    }
    const files = filesUnder(full);
    if (files.length === 0) {
      problems.push(`${dir}/ is empty.`);
    }
    for (const file of files) {
      if (!readFileSync(file, "utf8").slice(0, 200).includes(GENERATED_MARKER)) {
        problems.push(
          `${path.relative(ROOT, file)} lost its generated header: generated files are never hand-edited.`,
        );
      }
    }
  }
  if ({ ...pkg.dependencies, ...pkg.devDependencies }[contracts.package]) {
    problems.push(
      `${contracts.package} is installed, so set "published": true in scripts/contracts.json and delete the committed generated directories.`,
    );
  }
}

if (problems.length > 0) {
  console.error(`API contracts check failed (${contracts.package} ${contracts.version}):\n`);
  for (const problem of problems) console.error(`  - ${problem}`);
  process.exit(1);
}

if (contracts.published) {
  console.log(`API contracts OK: ${contracts.package}@${contracts.version} installed and pinned.`);
} else {
  console.log(
    `API contracts OK: using the committed client for ${contracts.package}@${contracts.version}, ` +
      `which trellis-backend has not published yet.\n` +
      `  UI operation types are checked separately. For REST package migration see ` +
      `scripts/check-contracts.mjs.`,
  );
}
