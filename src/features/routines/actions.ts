"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireCompletedProfile } from "@/features/auth/server";
import { createClient } from "@/lib/supabase/server";
import type { RoutineActionState } from "./action-state";
import { moveOrderedId, type MoveDirection } from "./domain";
import {
  validateDayName,
  isUuid,
  validatePrescriptionInput,
  validateRoutineInput,
} from "./validation";

function readFormValue(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

function invalidReferenceState(): RoutineActionState {
  return {
    status: "error",
    message: "No pudimos identificar el elemento que querés modificar.",
  };
}

function unavailableState(message: string): RoutineActionState {
  return { status: "error", message };
}

function revalidateRoutine(routineId: string) {
  revalidatePath("/routines");
  revalidatePath(`/routines/${routineId}`);
  revalidatePath(`/routines/${routineId}/edit`);
}

export async function createRoutineAction(
  _previousState: RoutineActionState,
  formData: FormData,
): Promise<RoutineActionState> {
  const validation = validateRoutineInput({
    name: readFormValue(formData, "name"),
    goal: readFormValue(formData, "goal"),
  });

  if (!validation.ok) {
    return { status: "error", fieldErrors: validation.fieldErrors };
  }

  const { userId } = await requireCompletedProfile();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("routines")
    .insert({
      user_id: userId,
      name: validation.data.name,
      goal: validation.data.goal,
    })
    .select("id")
    .single();

  if (error || !data) {
    return unavailableState(
      "No pudimos crear la rutina. Revisá los datos e intentá de nuevo.",
    );
  }

  revalidatePath("/routines");
  redirect(`/routines/${data.id}/edit`);
}

export async function updateRoutineAction(
  routineId: string,
  expectedUpdatedAt: string,
  _previousState: RoutineActionState,
  formData: FormData,
): Promise<RoutineActionState> {
  if (!isUuid(routineId) || Number.isNaN(Date.parse(expectedUpdatedAt))) {
    return invalidReferenceState();
  }

  const validation = validateRoutineInput({
    name: readFormValue(formData, "name"),
    goal: readFormValue(formData, "goal"),
  });

  if (!validation.ok) {
    return { status: "error", fieldErrors: validation.fieldErrors };
  }

  const { userId } = await requireCompletedProfile();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("routines")
    .update({ name: validation.data.name, goal: validation.data.goal })
    .eq("id", routineId)
    .eq("user_id", userId)
    .eq("updated_at", expectedUpdatedAt)
    .select("id")
    .maybeSingle();

  if (error) {
    return unavailableState("No pudimos guardar los datos de la rutina.");
  }

  if (!data) {
    return unavailableState(
      "La rutina cambió en otra pestaña. Recargá antes de volver a guardar.",
    );
  }

  revalidateRoutine(routineId);
  return { status: "success", message: "Datos de la rutina guardados." };
}

export async function addRoutineDayAction(
  routineId: string,
  _previousState: RoutineActionState,
  formData: FormData,
): Promise<RoutineActionState> {
  if (!isUuid(routineId)) return invalidReferenceState();

  const validation = validateDayName(readFormValue(formData, "dayName"));

  if (!validation.ok) {
    return { status: "error", fieldErrors: validation.fieldErrors };
  }

  await requireCompletedProfile();
  const supabase = await createClient();
  const { error } = await supabase.rpc("append_routine_day", {
    target_routine_id: routineId,
    day_name: validation.data,
  });

  if (error) {
    return unavailableState("No pudimos agregar el día a la rutina.");
  }

  revalidateRoutine(routineId);
  return { status: "success", message: "Día agregado." };
}

export async function renameRoutineDayAction(
  routineId: string,
  dayId: string,
  expectedUpdatedAt: string,
  _previousState: RoutineActionState,
  formData: FormData,
): Promise<RoutineActionState> {
  if (
    !isUuid(routineId) ||
    !isUuid(dayId) ||
    Number.isNaN(Date.parse(expectedUpdatedAt))
  ) {
    return invalidReferenceState();
  }

  const validation = validateDayName(readFormValue(formData, "dayName"));

  if (!validation.ok) {
    return { status: "error", fieldErrors: validation.fieldErrors };
  }

  await requireCompletedProfile();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("routine_days")
    .update({ name: validation.data })
    .eq("id", dayId)
    .eq("routine_id", routineId)
    .eq("updated_at", expectedUpdatedAt)
    .select("id")
    .maybeSingle();

  if (error) {
    return unavailableState("No pudimos renombrar el día.");
  }

  if (!data) {
    return unavailableState(
      "El día cambió en otra pestaña. Recargá antes de volver a guardar.",
    );
  }

  revalidateRoutine(routineId);
  return { status: "success", message: "Nombre del día guardado." };
}

export async function addRoutineExerciseAction(
  routineId: string,
  dayId: string,
  _previousState: RoutineActionState,
  formData: FormData,
): Promise<RoutineActionState> {
  const exerciseId = readFormValue(formData, "exerciseId");

  if (!isUuid(routineId) || !isUuid(dayId) || !isUuid(exerciseId)) {
    return invalidReferenceState();
  }

  const validation = validatePrescriptionInput({
    targetSets: readFormValue(formData, "targetSets"),
    targetRepsMin: readFormValue(formData, "targetRepsMin"),
    targetRepsMax: readFormValue(formData, "targetRepsMax"),
    restSeconds: readFormValue(formData, "restSeconds"),
    targetRir: readFormValue(formData, "targetRir"),
  });

  if (!validation.ok) {
    return { status: "error", fieldErrors: validation.fieldErrors };
  }

  await requireCompletedProfile();
  const supabase = await createClient();
  const { error } = await supabase.rpc("append_routine_exercise", {
    target_day_id: dayId,
    target_exercise_id: exerciseId,
    target_sets: validation.data.targetSets,
    target_reps_min: validation.data.targetRepsMin,
    target_reps_max: validation.data.targetRepsMax,
    target_rest_seconds: validation.data.restSeconds,
    ...(validation.data.targetRir === null
      ? {}
      : { target_rir: validation.data.targetRir }),
  });

  if (error?.code === "23505") {
    return unavailableState("Ese ejercicio ya está incluido en este día.");
  }

  if (error) {
    return unavailableState("No pudimos agregar el ejercicio.");
  }

  revalidateRoutine(routineId);
  return { status: "success", message: "Ejercicio agregado al día." };
}

export async function updateRoutineExerciseAction(
  routineId: string,
  routineExerciseId: string,
  expectedUpdatedAt: string,
  _previousState: RoutineActionState,
  formData: FormData,
): Promise<RoutineActionState> {
  if (
    !isUuid(routineId) ||
    !isUuid(routineExerciseId) ||
    Number.isNaN(Date.parse(expectedUpdatedAt))
  ) {
    return invalidReferenceState();
  }

  const validation = validatePrescriptionInput({
    targetSets: readFormValue(formData, "targetSets"),
    targetRepsMin: readFormValue(formData, "targetRepsMin"),
    targetRepsMax: readFormValue(formData, "targetRepsMax"),
    restSeconds: readFormValue(formData, "restSeconds"),
    targetRir: readFormValue(formData, "targetRir"),
  });

  if (!validation.ok) {
    return { status: "error", fieldErrors: validation.fieldErrors };
  }

  await requireCompletedProfile();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("routine_exercises")
    .update({
      target_sets: validation.data.targetSets,
      target_reps_min: validation.data.targetRepsMin,
      target_reps_max: validation.data.targetRepsMax,
      rest_seconds: validation.data.restSeconds,
      target_rir: validation.data.targetRir,
    })
    .eq("id", routineExerciseId)
    .eq("updated_at", expectedUpdatedAt)
    .select("id")
    .maybeSingle();

  if (error) {
    return unavailableState("No pudimos guardar la prescripción.");
  }

  if (!data) {
    return unavailableState(
      "La prescripción cambió en otra pestaña. Recargá antes de volver a guardar.",
    );
  }

  revalidateRoutine(routineId);
  return { status: "success", message: "Prescripción guardada." };
}

export async function activateRoutineAction(
  routineId: string,
  _formData: FormData,
) {
  void _formData;
  if (!isUuid(routineId)) throw new Error("Rutina inválida.");

  await requireCompletedProfile();
  const supabase = await createClient();
  const { error } = await supabase.rpc("activate_routine", {
    target_routine_id: routineId,
  });

  if (error) throw new Error("No pudimos activar la rutina.");
  revalidateRoutine(routineId);
}

export async function duplicateRoutineDayAction(
  routineId: string,
  dayId: string,
  _formData: FormData,
) {
  void _formData;
  if (!isUuid(routineId) || !isUuid(dayId)) {
    throw new Error("Día inválido.");
  }

  await requireCompletedProfile();
  const supabase = await createClient();
  const { error } = await supabase.rpc("duplicate_routine_day", {
    source_day_id: dayId,
  });

  if (error) throw new Error("No pudimos duplicar el día.");
  revalidateRoutine(routineId);
}

export async function moveRoutineDayAction(
  routineId: string,
  dayId: string,
  direction: MoveDirection,
  _formData: FormData,
) {
  void _formData;
  if (!isUuid(routineId) || !isUuid(dayId)) {
    throw new Error("Día inválido.");
  }

  await requireCompletedProfile();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("routine_days")
    .select("id")
    .eq("routine_id", routineId)
    .order("position");

  if (error) throw new Error("No pudimos leer el orden de los días.");

  const currentIds = data.map(({ id }) => id);
  const orderedIds = moveOrderedId(currentIds, dayId, direction);

  if (orderedIds.every((id, index) => id === currentIds[index])) return;

  const { error: reorderError } = await supabase.rpc("reorder_routine_days", {
    target_routine_id: routineId,
    ordered_day_ids: orderedIds,
  });

  if (reorderError) throw new Error("No pudimos reordenar los días.");
  revalidateRoutine(routineId);
}

export async function moveRoutineExerciseAction(
  routineId: string,
  dayId: string,
  routineExerciseId: string,
  direction: MoveDirection,
  _formData: FormData,
) {
  void _formData;
  if (!isUuid(routineId) || !isUuid(dayId) || !isUuid(routineExerciseId)) {
    throw new Error("Ejercicio inválido.");
  }

  await requireCompletedProfile();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("routine_exercises")
    .select("id")
    .eq("routine_day_id", dayId)
    .order("position");

  if (error) throw new Error("No pudimos leer el orden de los ejercicios.");

  const currentIds = data.map(({ id }) => id);
  const orderedIds = moveOrderedId(currentIds, routineExerciseId, direction);

  if (orderedIds.every((id, index) => id === currentIds[index])) return;

  const { error: reorderError } = await supabase.rpc(
    "reorder_routine_exercises",
    {
      target_day_id: dayId,
      ordered_routine_exercise_ids: orderedIds,
    },
  );

  if (reorderError) throw new Error("No pudimos reordenar los ejercicios.");
  revalidateRoutine(routineId);
}

export async function deleteRoutineDayAction(
  routineId: string,
  dayId: string,
  _formData: FormData,
) {
  void _formData;
  if (!isUuid(routineId) || !isUuid(dayId)) {
    throw new Error("Día inválido.");
  }

  await requireCompletedProfile();
  const supabase = await createClient();
  const { error } = await supabase
    .from("routine_days")
    .delete()
    .eq("id", dayId)
    .eq("routine_id", routineId);

  if (error) throw new Error("No pudimos eliminar el día.");
  revalidateRoutine(routineId);
}

export async function deleteRoutineExerciseAction(
  routineId: string,
  routineExerciseId: string,
  _formData: FormData,
) {
  void _formData;
  if (!isUuid(routineId) || !isUuid(routineExerciseId)) {
    throw new Error("Ejercicio inválido.");
  }

  await requireCompletedProfile();
  const supabase = await createClient();
  const { error } = await supabase
    .from("routine_exercises")
    .delete()
    .eq("id", routineExerciseId);

  if (error) throw new Error("No pudimos quitar el ejercicio.");
  revalidateRoutine(routineId);
}

export async function archiveRoutineAction(
  routineId: string,
  expectedUpdatedAt: string,
  _formData: FormData,
) {
  void _formData;
  if (!isUuid(routineId) || Number.isNaN(Date.parse(expectedUpdatedAt))) {
    throw new Error("Rutina inválida.");
  }

  const { userId } = await requireCompletedProfile();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("routines")
    .update({ is_active: false, archived_at: new Date().toISOString() })
    .eq("id", routineId)
    .eq("user_id", userId)
    .eq("updated_at", expectedUpdatedAt)
    .select("id")
    .maybeSingle();

  if (error) throw new Error("No pudimos archivar la rutina.");
  if (!data) {
    throw new Error(
      "La rutina cambió en otra pestaña. Recargá antes de archivarla.",
    );
  }

  revalidatePath("/routines");
  redirect("/routines");
}
