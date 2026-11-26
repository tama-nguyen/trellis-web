import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
const env = process.env;
const { schemaRevision } = JSON.parse(await readFile(new URL("./contracts.json", import.meta.url), "utf8"));
for (const path of [
  "contracts/graphql/schema.graphqls",
  "contracts/packages/npm/src/openapi.ts",
  "contracts/codegen/typescript/package.json",
  "contracts/codegen/typescript/pnpm-lock.yaml",
]) {
  const url = new URL(
    env.CI_API_V4_URL +
      "/projects/" +
      env.TRELLIS_CONTRACTS_PROJECT_ID +
      "/repository/files/" +
      encodeURIComponent(path) +
      "/raw",
  );
  url.searchParams.set("ref", schemaRevision);
  const response = await fetch(url, { headers: { "JOB-TOKEN": env.CI_JOB_TOKEN } });
  if (!response.ok) throw new Error("Backend contract input " + path + ": HTTP " + response.status);
  const dest = join(env.TRELLIS_BACKEND_DIR, path);
  await mkdir(dirname(dest), { recursive: true });
  await writeFile(dest, await response.text());
}
