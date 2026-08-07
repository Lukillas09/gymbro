import { cache } from "react";
import { redirect } from "next/navigation";
import { SupabaseEnvironmentError } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { isProfileComplete, type Profile } from "./profile";

export type AuthContext = Readonly<{
  userId: string;
  profile: Profile | null;
}>;

export const getAuthContext = cache(async (): Promise<AuthContext | null> => {
  let supabase: Awaited<ReturnType<typeof createClient>>;

  try {
    supabase = await createClient();
  } catch (error) {
    if (error instanceof SupabaseEnvironmentError) {
      return null;
    }

    throw error;
  }

  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (claimsError || typeof userId !== "string") {
    return null;
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (profileError) {
    throw new Error("No pudimos cargar el perfil autenticado.");
  }

  return { userId, profile };
});

export async function requireAuthContext() {
  const context = await getAuthContext();

  if (!context) {
    redirect("/login");
  }

  return context;
}

export async function requireCompletedProfile() {
  const context = await requireAuthContext();

  if (!isProfileComplete(context.profile)) {
    redirect("/onboarding");
  }

  return { ...context, profile: context.profile as Profile };
}
