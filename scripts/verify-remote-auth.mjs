import { randomBytes, randomUUID } from "node:crypto";
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

function fail(message) {
  throw new Error(message);
}

if (process.env.GYMBRO_SUPABASE_TARGET !== "development") {
  fail("Set GYMBRO_SUPABASE_TARGET=development before the remote auth test.");
}

if (process.env.GYMBRO_SUPABASE_AUTH_TEST !== "run") {
  fail("Set GYMBRO_SUPABASE_AUTH_TEST=run to opt in to the remote auth test.");
}

const expectedProjectRef = process.env.GYMBRO_SUPABASE_DEV_PROJECT_REF?.trim();

if (!expectedProjectRef) {
  fail("Set GYMBRO_SUPABASE_DEV_PROJECT_REF to the development project ref.");
}

const root = process.cwd();
const linkedProjectRefPath = path.join(
  root,
  "supabase",
  ".temp",
  "project-ref",
);

if (!existsSync(linkedProjectRefPath)) {
  fail("Link the disposable development project before running auth tests.");
}

const linkedProjectRef = readFileSync(linkedProjectRefPath, "utf8").trim();

if (linkedProjectRef !== expectedProjectRef) {
  fail("The linked project does not match the expected development project.");
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const publicKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

if (!supabaseUrl || !publicKey) {
  fail("Export the public Supabase URL and publishable key before this test.");
}

const parsedSupabaseUrl = new URL(supabaseUrl);

if (parsedSupabaseUrl.hostname.split(".")[0] !== linkedProjectRef) {
  fail(
    "The public Supabase URL does not match the linked development project.",
  );
}

const cliPath = path.join(
  root,
  "node_modules",
  "supabase",
  "dist",
  "supabase.js",
);

function runCli(argumentsForCli, failureMessage) {
  const result = spawnSync(process.execPath, [cliPath, ...argumentsForCli], {
    cwd: root,
    encoding: "utf8",
    windowsHide: true,
  });

  if (result.error || result.status !== 0) {
    fail(failureMessage);
  }
}

function sqlLiteral(value) {
  return `'${value.replaceAll("'", "''")}'`;
}

const email = `gymbro-auth-${randomUUID()}@gmail.com`;
const password = `Gm!${randomBytes(24).toString("base64url")}`;
let userId = null;
let confirmationRequired = false;
let testError = null;

try {
  const supabase = createClient(supabaseUrl, publicKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error || !data.user) {
    fail(`Controlled signup failed${error?.code ? ` (${error.code})` : ""}.`);
  }

  userId = data.user.id;
  confirmationRequired = !data.session;

  const userIdLiteral = sqlLiteral(userId);
  const emailLiteral = sqlLiteral(email);
  const triggerAssertion = `
    do $gymbro$
    begin
      if (select count(*) from auth.users where id = ${userIdLiteral} and email = ${emailLiteral}) <> 1 then
        raise exception 'Controlled auth user was not created';
      end if;
      if (select count(*) from public.profiles where id = ${userIdLiteral}) <> 1 then
        raise exception 'Profile trigger did not create exactly one row';
      end if;
    end
    $gymbro$;
  `;

  runCli(
    ["db", "query", "--linked", triggerAssertion],
    "The remote profile trigger assertion failed.",
  );
  runCli(
    ["db", "query", "--linked", "--file", "supabase/tests/remote/auth-rls.sql"],
    "The remote RLS assertions failed.",
  );
} catch (error) {
  testError = error;
} finally {
  const predicates = [`email = ${sqlLiteral(email)}`];

  if (userId) {
    predicates.push(`id = ${sqlLiteral(userId)}`);
  }

  try {
    runCli(
      [
        "db",
        "query",
        "--linked",
        `delete from auth.users where ${predicates.join(" and ")};`,
      ],
      "Cleanup of the controlled auth user failed.",
    );
  } catch (cleanupError) {
    testError = cleanupError;
  }
}

if (testError) {
  throw testError;
}

console.log(
  `Remote auth verification passed (${confirmationRequired ? "email confirmation required" : "immediate session"}); controlled data removed.`,
);
