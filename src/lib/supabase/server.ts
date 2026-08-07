import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database.generated";
import { getSupabasePublicConfig, type SupabasePublicEnvironment } from "./env";

export async function createClient(environment?: SupabasePublicEnvironment) {
  const cookieStore = await cookies();
  const { url, publicKey } = getSupabasePublicConfig(environment);

  return createServerClient<Database>(url, publicKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components cannot write cookies; auth refresh will be added with auth.
        }
      },
    },
  });
}
