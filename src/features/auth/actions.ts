"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SupabaseEnvironmentError } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import type { AuthActionState } from "./action-state";
import { getRegistrationErrorState, reportAuthError } from "./errors";
import { getOnboardingPath, resolveSafeRedirect } from "./redirects";
import { isProfileComplete } from "./profile";
import { resolveConfirmationOrigin } from "./urls";
import {
  validateLoginInput,
  validateOnboardingInput,
  validateRegisterInput,
} from "./validation";

function readFormValue(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

function unavailableState(): AuthActionState {
  return {
    status: "error",
    message: "El acceso no está disponible en este momento. Intentá de nuevo.",
  };
}

export async function loginAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const validation = validateLoginInput({
    email: readFormValue(formData, "email"),
    password: readFormValue(formData, "password"),
  });

  if (!validation.ok) {
    return { status: "error", fieldErrors: validation.fieldErrors };
  }

  let supabase: Awaited<ReturnType<typeof createClient>>;

  try {
    supabase = await createClient();
  } catch (error) {
    if (error instanceof SupabaseEnvironmentError) {
      return unavailableState();
    }

    throw error;
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: validation.data.email,
    password: validation.data.password,
  });

  if (error || !data.user) {
    return {
      status: "error",
      message: "No pudimos iniciar sesión con esas credenciales.",
    };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", data.user.id)
    .maybeSingle();

  if (profileError) {
    return unavailableState();
  }

  revalidatePath("/", "layout");

  const next = resolveSafeRedirect(readFormValue(formData, "next"));

  if (!isProfileComplete(profile)) {
    redirect(getOnboardingPath(next));
  }

  redirect(next);
}

export async function registerAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const validation = validateRegisterInput({
    email: readFormValue(formData, "email"),
    password: readFormValue(formData, "password"),
    passwordConfirmation: readFormValue(formData, "passwordConfirmation"),
  });

  if (!validation.ok) {
    return { status: "error", fieldErrors: validation.fieldErrors };
  }

  let supabase: Awaited<ReturnType<typeof createClient>>;
  let confirmationUrl: string;

  try {
    supabase = await createClient();
    const requestHeaders = await headers();
    const confirmationOrigin = resolveConfirmationOrigin({
      configuredAppUrl: process.env.NEXT_PUBLIC_APP_URL,
      requestOrigin: requestHeaders.get("origin"),
      environment: process.env.NODE_ENV,
    });
    confirmationUrl = new URL(
      "/auth/confirm?next=/onboarding",
      confirmationOrigin,
    ).toString();
  } catch (error) {
    reportAuthError("registration setup", error);
    return unavailableState();
  }

  const { data, error } = await supabase.auth.signUp({
    email: validation.data.email,
    password: validation.data.password,
    options: {
      emailRedirectTo: confirmationUrl,
    },
  });

  if (error) {
    reportAuthError("signUp", error);
    return getRegistrationErrorState(error);
  }

  if (!data.session) {
    return {
      status: "confirmation_required",
      message: "Revisá tu correo para confirmar tu cuenta.",
    };
  }

  revalidatePath("/", "layout");
  redirect("/onboarding");
}

export async function onboardingAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const validation = validateOnboardingInput({
    username: readFormValue(formData, "username"),
    displayName: readFormValue(formData, "displayName"),
    trainingLevel: readFormValue(formData, "trainingLevel"),
    primaryGoal: readFormValue(formData, "primaryGoal"),
    preferredWeightUnit: readFormValue(formData, "preferredWeightUnit"),
    biologicalSex: readFormValue(formData, "biologicalSex"),
    birthDate: readFormValue(formData, "birthDate"),
    heightCm: readFormValue(formData, "heightCm"),
    currentWeightKg: readFormValue(formData, "currentWeightKg"),
  });

  if (!validation.ok) {
    return { status: "error", fieldErrors: validation.fieldErrors };
  }

  let supabase: Awaited<ReturnType<typeof createClient>>;

  try {
    supabase = await createClient();
  } catch (error) {
    if (error instanceof SupabaseEnvironmentError) {
      return unavailableState();
    }

    throw error;
  }

  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (claimsError || typeof userId !== "string") {
    redirect("/login");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .update(validation.data)
    .eq("id", userId)
    .select("id")
    .single();

  if (error?.code === "23505") {
    return {
      status: "error",
      fieldErrors: { username: "Ese nombre de usuario ya está en uso." },
    };
  }

  if (error || !profile) {
    return {
      status: "error",
      message: "No pudimos guardar tu perfil. Intentá de nuevo.",
    };
  }

  revalidatePath("/", "layout");
  redirect(resolveSafeRedirect(readFormValue(formData, "next")));
}

export async function logoutAction(
  _previousState: AuthActionState,
): Promise<AuthActionState> {
  void _previousState;

  let supabase: Awaited<ReturnType<typeof createClient>>;

  try {
    supabase = await createClient();
  } catch (error) {
    if (error instanceof SupabaseEnvironmentError) {
      return unavailableState();
    }

    throw error;
  }

  const { error } = await supabase.auth.signOut({ scope: "local" });

  if (error) {
    return {
      status: "error",
      message: "No pudimos cerrar la sesión. Intentá de nuevo.",
    };
  }

  revalidatePath("/", "layout");
  redirect("/login");
}
