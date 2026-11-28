import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
const env = process.env;
const { schemaRevision, schemaRepository } = JSON.parse(
  await readFile(new URL("./contracts.json", import.meta.url), "utf8"),
);
if (!/^[a-f0-9]{40}$/.test(schemaRevision)) throw new Error("Pin schemaRevision to a full commit SHA.");
if (!env.TRELLIS_BACKEND_DIR) throw new Error("Set TRELLIS_BACKEND_DIR to the contract input directory.");
const repository = env.TRELLIS_CONTRACTS_REPOSITORY ?? schemaRepository;
if (!/^[\w.-]+\/[\w.-]+$/.test(repository)) throw new Error("Invalid backend GitHub repository.");
for (const path of [
  "contracts/graphql/schema.graphqls",
  "contracts/packages/npm/src/openapi.ts",
  "contracts/codegen/typescript/package.json",
  "contracts/codegen/typescript/pnpm-lock.yaml",
]) {
  const url = new URL(`https://raw.githubusercontent.com/${repository}/${schemaRevision}/${path}`);
  const response = await fetch(url, { signal: AbortSignal.timeout(30_000) });
  if (!response.ok) throw new Error("Backend contract input " + path + ": HTTP " + response.status);
  const dest = join(env.TRELLIS_BACKEND_DIR, path);
  await mkdir(dirname(dest), { recursive: true });
  await writeFile(dest, await response.text());
}
