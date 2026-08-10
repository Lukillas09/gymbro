"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { AuthActionState } from "@/features/auth/action-state";
import { requireCompletedProfile } from "@/features/auth/server";
import { validateOnboardingInput } from "@/features/auth/validation";
import { createClient } from "@/lib/supabase/server";

function readFormValue(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

export async function updateProfileAction(
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

  const { userId } = await requireCompletedProfile();
  const supabase = await createClient();
  const { data, error } = await supabase
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

  if (error || !data) {
    return {
      status: "error",
      message: "No pudimos guardar tus datos. Intentá de nuevo.",
    };
  }

  revalidatePath("/");
  revalidatePath("/profile");
  revalidatePath("/profile/edit");
  redirect("/profile");
}
