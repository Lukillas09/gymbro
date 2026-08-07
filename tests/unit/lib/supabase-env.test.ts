import { describe, expect, it } from "vitest";
import {
  getSupabasePublicConfig,
  SupabaseEnvironmentError,
} from "@/lib/supabase/env";

describe("getSupabasePublicConfig", () => {
  it("returns a valid URL and publishable key", () => {
    expect(
      getSupabasePublicConfig({
        NEXT_PUBLIC_SUPABASE_URL: "https://gymbro.supabase.co",
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_example",
      }),
    ).toEqual({
      url: "https://gymbro.supabase.co",
      publicKey: "sb_publishable_example",
    });
  });

  it("supports the legacy anon key as a fallback", () => {
    expect(
      getSupabasePublicConfig({
        NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "legacy-anon-key",
      }).publicKey,
    ).toBe("legacy-anon-key");
  });

  it("prefers the publishable key when both key formats exist", () => {
    expect(
      getSupabasePublicConfig({
        NEXT_PUBLIC_SUPABASE_URL: "https://gymbro.supabase.co",
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "publishable-key",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "legacy-key",
      }).publicKey,
    ).toBe("publishable-key");
  });

  it("reports a missing URL clearly", () => {
    expect(() =>
      getSupabasePublicConfig({
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "publishable-key",
      }),
    ).toThrowError(
      new SupabaseEnvironmentError(
        "Missing Supabase environment variable: NEXT_PUBLIC_SUPABASE_URL.",
      ),
    );
  });

  it("reports missing public keys clearly", () => {
    expect(() =>
      getSupabasePublicConfig({
        NEXT_PUBLIC_SUPABASE_URL: "https://gymbro.supabase.co",
      }),
    ).toThrowError(/NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY/);
  });

  it("rejects invalid URLs", () => {
    expect(() =>
      getSupabasePublicConfig({
        NEXT_PUBLIC_SUPABASE_URL: "not-a-url",
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "publishable-key",
      }),
    ).toThrowError(/valid HTTP or HTTPS URL/);
  });
});
