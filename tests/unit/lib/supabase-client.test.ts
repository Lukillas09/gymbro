import { beforeEach, describe, expect, it, vi } from "vitest";

const { cookieStore, mockCookies } = vi.hoisted(() => ({
  cookieStore: {
    getAll: vi.fn(() => []),
    set: vi.fn(),
  },
  mockCookies: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies: mockCookies,
}));

import { createClient as createBrowserClient } from "@/lib/supabase/client";
import { createClient as createServerClient } from "@/lib/supabase/server";

const environment = {
  NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321",
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "publishable-key",
} as const;

describe("Supabase clients", () => {
  beforeEach(() => {
    mockCookies.mockResolvedValue(cookieStore);
  });

  it("creates a browser client with valid configuration", () => {
    const client = createBrowserClient(environment);

    expect(client.auth).toBeDefined();
    expect(client.from).toBeTypeOf("function");
  });

  it("creates a server client with the App Router cookie store", async () => {
    const client = await createServerClient(environment);

    expect(client.auth).toBeDefined();
    expect(client.from).toBeTypeOf("function");
    expect(mockCookies).toHaveBeenCalledOnce();
  });

  it("fails before creating a client when configuration is missing", () => {
    expect(() => createBrowserClient({})).toThrowError(
      /NEXT_PUBLIC_SUPABASE_URL/,
    );
  });
});
