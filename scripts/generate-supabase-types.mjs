import { spawnSync } from "node:child_process";
import { mkdirSync, renameSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { format } from "prettier";

const mode = process.argv[2];

if (mode !== "--local" && mode !== "--linked") {
  throw new Error("Type generation requires --local or --linked.");
}

const root = process.cwd();
const cliPath = path.join(
  root,
  "node_modules",
  "supabase",
  "dist",
  "supabase.js",
);
const targetPath = path.join(root, "src", "types", "database.generated.ts");
const temporaryPath = `${targetPath}.${process.pid}.tmp`;

const result = spawnSync(
  process.execPath,
  [cliPath, "gen", "types", "typescript", mode, "--schema", "public"],
  {
    cwd: root,
    encoding: "utf8",
    maxBuffer: 10 * 1024 * 1024,
    stdio: ["ignore", "pipe", "inherit"],
    windowsHide: true,
  },
);

if (result.error) {
  throw result.error;
}

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

if (!result.stdout.includes("export type Database")) {
  throw new Error("Supabase did not return a valid Database type definition.");
}

const formattedTypes = await format(result.stdout, {
  filepath: targetPath,
});

mkdirSync(path.dirname(targetPath), { recursive: true });

try {
  writeFileSync(temporaryPath, formattedTypes, "utf8");
  rmSync(targetPath, { force: true });
  renameSync(temporaryPath, targetPath);
} finally {
  rmSync(temporaryPath, { force: true });
}

console.log(
  `Generated src/types/database.generated.ts from ${mode === "--local" ? "local Supabase" : "the linked Supabase project"}.`,
);
