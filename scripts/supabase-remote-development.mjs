import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const operation = process.argv[2];

if (operation !== "push" && operation !== "seed") {
  throw new Error("Remote development operation must be push or seed.");
}

if (process.env.GYMBRO_SUPABASE_TARGET !== "development") {
  throw new Error(
    "Set GYMBRO_SUPABASE_TARGET=development before changing the linked project.",
  );
}

if (process.env.GYMBRO_SUPABASE_DRY_RUN_REVIEWED !== "yes") {
  throw new Error(
    "Run and review supabase:remote:dry-run, then set GYMBRO_SUPABASE_DRY_RUN_REVIEWED=yes.",
  );
}

const expectedProjectRef = process.env.GYMBRO_SUPABASE_DEV_PROJECT_REF?.trim();

if (!expectedProjectRef) {
  throw new Error(
    "Set GYMBRO_SUPABASE_DEV_PROJECT_REF to the disposable development project ref.",
  );
}

const root = process.cwd();
const linkedProjectRefPath = path.join(
  root,
  "supabase",
  ".temp",
  "project-ref",
);

if (!existsSync(linkedProjectRefPath)) {
  throw new Error("Link the disposable development project before continuing.");
}

const linkedProjectRef = readFileSync(linkedProjectRefPath, "utf8").trim();

if (linkedProjectRef !== expectedProjectRef) {
  throw new Error(
    "The linked project does not match GYMBRO_SUPABASE_DEV_PROJECT_REF.",
  );
}

const cliPath = path.join(
  root,
  "node_modules",
  "supabase",
  "dist",
  "supabase.js",
);
const argumentsForCli = ["db", "push", "--linked"];

if (operation === "seed") {
  argumentsForCli.push("--include-seed");
}

const result = spawnSync(process.execPath, [cliPath, ...argumentsForCli], {
  cwd: root,
  stdio: "inherit",
  windowsHide: true,
});

if (result.error) {
  throw result.error;
}

process.exit(result.status ?? 1);
