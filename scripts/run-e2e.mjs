import { spawnSync } from "node:child_process";
import path from "node:path";

const environment = {
  ...process.env,
  NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:3201",
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "gymbro-e2e-public-key",
};
const npmCli = process.env.npm_execpath;

if (!npmCli) {
  throw new Error(
    "Run Playwright through an npm script so npm_execpath is available.",
  );
}

const build = spawnSync(process.execPath, [npmCli, "run", "build"], {
  cwd: process.cwd(),
  env: environment,
  stdio: "inherit",
  windowsHide: true,
});

if (build.error) throw build.error;
if (build.status !== 0) process.exit(build.status ?? 1);

const playwrightCli = path.join(
  process.cwd(),
  "node_modules",
  "playwright",
  "cli.js",
);
const argumentsForPlaywright = [playwrightCli, "test"];

if (process.argv.includes("--ui")) argumentsForPlaywright.push("--ui");

const tests = spawnSync(process.execPath, argumentsForPlaywright, {
  cwd: process.cwd(),
  env: environment,
  stdio: "inherit",
  windowsHide: true,
});

if (tests.error) throw tests.error;
process.exit(tests.status ?? 1);
