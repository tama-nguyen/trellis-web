import { readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

// Use the backend workspace's pinned compiler until the contracts package is released.
const backend = process.env.TRELLIS_BACKEND_DIR
  ? pathToFileURL(resolve(process.env.TRELLIS_BACKEND_DIR) + "/")
  : new URL("../../trellis-backend/", import.meta.url);
const tooling = createRequire(new URL("contracts/codegen/typescript/package.json", backend));
const cli = tooling.resolve("@graphql-codegen/cli");
const preset = createRequire(cli).resolve("@graphql-codegen/client-preset");
const { generate } = tooling(cli);
await generate(
  {
    schema: fileURLToPath(new URL("contracts/graphql/schema.graphqls", backend)),
    documents: ["src/entities/**/*.graphql.ts"],
    generates: {
      "src/shared/graphql/generated/": {
        preset,
        presetConfig: { fragmentMasking: false },
        config: {
          documentMode: "string",
          enumsAsTypes: true,
          scalars: { DateTime: "string" },
          skipTypename: true,
        },
      },
    },
  },
  !process.argv.includes("--check"),
).then(async (outputs) => {
  if (!process.argv.includes("--check")) return;
  for (const output of outputs) {
    if ((await readFile(output.filename, "utf8")) !== output.content)
      throw new Error("Stale operation types: " + output.filename);
  }
});

// The committed snapshot lets web type-check REST consumers before the contracts package ships.
const restTypes = await readFile(new URL("contracts/packages/npm/src/openapi.ts", backend), "utf8");
const snapshot = new URL("../src/shared/api/generated/openapi.ts", import.meta.url);
if (process.argv.includes("--check")) {
  if ((await readFile(snapshot, "utf8")) !== restTypes) throw new Error("Stale REST types");
} else {
  await writeFile(snapshot, restTypes);
}
