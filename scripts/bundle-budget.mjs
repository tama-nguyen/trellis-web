#!/usr/bin/env node
/**
 * Bundle budget: First Load JS per App Router route, measured from the production build in
 * `.next/` and compared with scripts/budget.json. Run after `npm run build`:
 *
 *   npm run budget:check                 check, exit 1 on a hard failure
 *   npm run budget:check -- --update     write the current sizes as the new budget
 *
 * Three levels, after DataHub's eager-budget check:
 *   - within slack (max(slackBytes, slackRatio x budget)) of the budget: OK
 *   - grew beyond slack but not beyond hardRatio (10%): warning, fix it or raise the budget in a
 *     dedicated change
 *   - grew beyond hardRatio: failure
 *   - shrank beyond slack: ratchet notice, lower the budget so the gain is kept
 *
 * "First Load JS" here = the root main files + every layout on the route's path + the page,
 * gzip-compressed, each file counted once. It is stricter than the number `next build` prints,
 * which leaves layouts out.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { runInNewContext } from "node:vm";
import { gzipSync } from "node:zlib";

export const LEVELS = { OK: "ok", SOFT: "soft", HARD: "hard", RATCHET: "ratchet", NEW: "new" };

const PAGE_SUFFIX = "/page";
const LAYOUT_SUFFIX = "/layout";
const JS_EXTENSION = ".js";
const UPDATE_FLAG = "--update";
const KIB = 1024;
const APP_PATHS_MANIFEST = "server/app-paths-manifest.json";
const CLIENT_REFERENCE_MANIFEST_SUFFIX = "_client-reference-manifest.js";

/** @returns {"ok" | "soft" | "hard" | "ratchet"} */
export function classify({ actual, expected, slackBytes, slackRatio, hardRatio }) {
  const slack = Math.max(slackBytes, expected * slackRatio);
  const delta = actual - expected;
  if (delta > expected * hardRatio) return LEVELS.HARD;
  if (delta > slack) return LEVELS.SOFT;
  if (-delta > slack) return LEVELS.RATCHET;
  return LEVELS.OK;
}

/** `/[locale]/notifications/page` -> [`/layout`, `/[locale]/layout`, `/[locale]/notifications/layout`]. */
export function layoutChainOf(pageKey) {
  const segments = pageKey.slice(0, -PAGE_SUFFIX.length).split("/").filter(Boolean);
  const chain = [LAYOUT_SUFFIX];
  for (let index = 1; index <= segments.length; index += 1) {
    chain.push(`/${segments.slice(0, index).join("/")}${LAYOUT_SUFFIX}`);
  }
  return chain;
}

/** Files that make up a route's first load, given the app build manifest and root main files. */
export function routeFiles(pageKey, appPages, rootMainFiles) {
  const files = new Set(rootMainFiles);
  for (const key of [...layoutChainOf(pageKey), pageKey]) {
    for (const file of appPages[key] ?? []) files.add(file);
  }
  return [...files].filter((file) => file.endsWith(JS_EXTENSION));
}

/** Reads the route-specific client chunks emitted by Next.js 16's Webpack compiler. */
export function routeFilesFromClientManifest(manifest, rootMainFiles) {
  const files = new Set(rootMainFiles);
  for (const module of Object.values(manifest.clientModules ?? {})) {
    for (const chunk of module.chunks ?? []) {
      if (typeof chunk === "string" && chunk.endsWith(JS_EXTENSION)) {
        files.add(decodeURIComponent(chunk));
      }
    }
  }
  return [...files];
}

function readClientReferenceManifest(manifestPath, routeKey) {
  const context = {};
  runInNewContext(readFileSync(manifestPath, "utf8"), context);
  const manifest = context.__RSC_MANIFEST?.[routeKey];
  if (!manifest) throw new Error(`No client reference manifest found for ${routeKey}`);
  return manifest;
}

export function measureRoutes(nextDir) {
  const buildManifest = JSON.parse(readFileSync(path.join(nextDir, "build-manifest.json"), "utf8"));
  const sizeCache = new Map();
  const gzipSize = (file) => {
    if (!sizeCache.has(file)) sizeCache.set(file, gzipSync(readFileSync(path.join(nextDir, file))).length);
    return sizeCache.get(file);
  };

  const sizes = {};
  const rootMainFiles = buildManifest.rootMainFiles ?? [];
  const appBuildManifestPath = path.join(nextDir, "app-build-manifest.json");
  if (existsSync(appBuildManifestPath)) {
    const appManifest = JSON.parse(readFileSync(appBuildManifestPath, "utf8"));
    for (const pageKey of Object.keys(appManifest.pages).sort()) {
      if (!pageKey.endsWith(PAGE_SUFFIX)) continue;
      const files = routeFiles(pageKey, appManifest.pages, rootMainFiles);
      sizes[pageKey] = files.reduce((sum, file) => sum + gzipSize(file), 0);
    }
    return sizes;
  }

  const appPaths = JSON.parse(readFileSync(path.join(nextDir, APP_PATHS_MANIFEST), "utf8"));
  for (const [pageKey, serverPath] of Object.entries(appPaths).sort(([left], [right]) =>
    left.localeCompare(right),
  )) {
    if (!pageKey.endsWith(PAGE_SUFFIX)) continue;
    const clientManifestPath = path.join(
      nextDir,
      "server",
      serverPath.replace(/\.js$/, CLIENT_REFERENCE_MANIFEST_SUFFIX),
    );
    const clientManifest = readClientReferenceManifest(clientManifestPath, pageKey);
    const files = routeFilesFromClientManifest(clientManifest, rootMainFiles);
    sizes[pageKey] = files.reduce((sum, file) => sum + gzipSize(file), 0);
  }
  return sizes;
}

/** @returns {{ route: string, actual: number, expected?: number, level: string }[]} */
export function evaluate(sizes, budget) {
  return Object.entries(sizes).map(([route, actual]) => {
    const expected = budget.routes[route];
    if (expected === undefined) return { route, actual, level: LEVELS.NEW };
    return { route, actual, expected, level: classify({ actual, expected, ...budget }) };
  });
}

const kib = (bytes) => `${(bytes / KIB).toFixed(1)} KiB`;

function main() {
  const webDir = fileURLToPath(new URL("..", import.meta.url));
  const budgetPath = path.join(webDir, "scripts", "budget.json");
  const budget = JSON.parse(readFileSync(budgetPath, "utf8"));
  let sizes;
  try {
    sizes = measureRoutes(path.join(webDir, ".next"));
  } catch (error) {
    console.error(
      `bundle budget: cannot read the build output (${error.message}). Run \`npm run build\` first.`,
    );
    process.exit(1);
  }

  if (process.argv.includes(UPDATE_FLAG)) {
    budget.routes = sizes;
    writeFileSync(budgetPath, `${JSON.stringify(budget, null, 2)}\n`);
    console.log(`bundle budget: wrote ${Object.keys(sizes).length} routes to scripts/budget.json`);
    return;
  }

  const results = evaluate(sizes, budget);
  const label = {
    ok: "ok",
    soft: "WARN grew",
    hard: "FAIL grew >10%",
    ratchet: "shrank: lower the budget",
    new: "new: not in budget",
  };
  for (const { route, actual, expected, level } of results) {
    const versus = expected === undefined ? "" : ` / budget ${kib(expected)}`;
    console.log(`${label[level].padEnd(26)} ${route.padEnd(44)} ${kib(actual)}${versus}`);
  }
  const missing = Object.keys(budget.routes).filter((route) => !(route in sizes));
  for (const route of missing) console.log(`${"gone: remove from budget".padEnd(26)} ${route}`);

  const count = (level) => results.filter((result) => result.level === level).length;
  console.log(
    `\nbundle budget: ${count(LEVELS.OK)} ok, ${count(LEVELS.SOFT)} warning, ${count(LEVELS.HARD)} failing, ` +
      `${count(LEVELS.RATCHET)} to ratchet down, ${count(LEVELS.NEW)} new.`,
  );
  if (count(LEVELS.RATCHET) > 0 || count(LEVELS.NEW) > 0) {
    console.log("Run `npm run budget:check -- --update` in a dedicated change to record the new sizes.");
  }
  if (count(LEVELS.HARD) > 0) process.exit(1);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
