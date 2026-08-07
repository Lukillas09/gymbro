"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database.generated";
import { getSupabasePublicConfig, type SupabasePublicEnvironment } from "./env";

export function createClient(environment?: SupabasePublicEnvironment) {
  const { url, publicKey } = getSupabasePublicConfig(environment);
  return createBrowserClient<Database>(url, publicKey);
}
