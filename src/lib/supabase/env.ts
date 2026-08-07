export type SupabasePublicEnvironment = Readonly<{
  [key: string]: string | undefined;
  NEXT_PUBLIC_SUPABASE_URL?: string;
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY?: string;
}>;

export type SupabasePublicConfig = Readonly<{
  url: string;
  publicKey: string;
}>;

export class SupabaseEnvironmentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SupabaseEnvironmentError";
  }
}

const defaultEnvironment: SupabasePublicEnvironment = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
};

function readValue(value: string | undefined) {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
}

function validateUrl(value: string) {
  try {
    const url = new URL(value);

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      throw new Error("Unsupported protocol");
    }
  } catch {
    throw new SupabaseEnvironmentError(
      "NEXT_PUBLIC_SUPABASE_URL must be a valid HTTP or HTTPS URL.",
    );
  }
}

export function getSupabasePublicConfig(
  environment: SupabasePublicEnvironment = defaultEnvironment,
): SupabasePublicConfig {
  const url = readValue(environment.NEXT_PUBLIC_SUPABASE_URL);

  if (!url) {
    throw new SupabaseEnvironmentError(
      "Missing Supabase environment variable: NEXT_PUBLIC_SUPABASE_URL.",
    );
  }

  validateUrl(url);

  const publicKey =
    readValue(environment.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) ??
    readValue(environment.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  if (!publicKey) {
    throw new SupabaseEnvironmentError(
      "Missing Supabase public key. Set NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  return { url, publicKey };
}
