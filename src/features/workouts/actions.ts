"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireCompletedProfile } from "@/features/auth/server";
import { createClient } from "@/lib/supabase/server";
import type { StartWorkoutActionState } from "./action-state";
import type {
  CompleteSetInput,
  CompleteSetResult,
  WorkoutMutationResult,
} from "./types";
import { isUuid, validateWorkoutSetInput } from "./validation";

function revalidateWorkout(sessionId: string) {
  revalidatePath("/");
  revalidatePath("/workout");
  revalidatePath(`/workout/${sessionId}`);
}

function mutationError<Value>(message: string): WorkoutMutationResult<Value> {
  return { ok: false, message };
}

export async function startWorkoutAction(
  _previousState: StartWorkoutActionState,
  formData: FormData,
): Promise<StartWorkoutActionState> {
  const routineDayId = formData.get("routineDayId");
  if (typeof routineDayId !== "string" || !isUuid(routineDayId)) {
    return { status: "error", message: "No pudimos identificar ese día." };
  }

  await requireCompletedProfile();
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("start_workout", {
    target_routine_day_id: routineDayId,
  });

  if (error || !data) {
    return {
      status: "error",
      message: "No pudimos iniciar el entrenamiento. Revisá el día elegido.",
    };
  }

  revalidateWorkout(data);
  redirect(`/workout/${data}`);
}

export async function completeWorkoutSetAction(
  input: CompleteSetInput,
): Promise<WorkoutMutationResult<CompleteSetResult>> {
  const validation = validateWorkoutSetInput(input);
  if (!validation.ok) {
    return mutationError(
      validation.fieldErrors.weightKg ??
        validation.fieldErrors.repetitions ??
        "Revisá los valores de la serie.",
    );
  }

  await requireCompletedProfile();
  const supabase = await createClient();
  const { data, error } = await supabase
    .rpc("complete_workout_set", {
      target_workout_exercise_id: validation.data.workoutExerciseId,
      target_set_number: validation.data.setNumber,
      target_weight_kg: validation.data.weightKg,
      target_repetitions: validation.data.repetitions,
    })
    .single();

  if (error || !data || !data.active_workout_exercise_id) {
    return mutationError(
      "No pudimos guardar la serie. Tus datos anteriores siguen intactos.",
    );
  }

  const result: CompleteSetResult = {
    inserted: data.inserted,
    restEndsAt: data.rest_ends_at,
    activeWorkoutExerciseId: data.active_workout_exercise_id,
    set: {
      id: data.workout_set_id,
      setNumber: data.set_number,
      weightKg: Number(data.weight_kg),
      repetitions: data.repetitions,
      rir: data.rir,
      setType: data.set_type,
      completedAt: data.completed_at,
    },
  };

  revalidatePath("/");
  revalidatePath("/workout");
  return { ok: true, value: result };
}

export async function undoLastWorkoutSetAction(
  sessionId: string,
  workoutSetId: string,
): Promise<
  WorkoutMutationResult<{
    workoutExerciseId: string;
    setNumber: number;
    activeWorkoutExerciseId: string;
    restEndsAt: string | null;
  }>
> {
  if (!isUuid(sessionId) || !isUuid(workoutSetId)) {
    return mutationError("No pudimos identificar la serie para deshacerla.");
  }

  await requireCompletedProfile();
  const supabase = await createClient();
  const { data, error } = await supabase
    .rpc("undo_last_workout_set", {
      target_workout_session_id: sessionId,
      target_workout_set_id: workoutSetId,
    })
    .single();

  if (error || !data || !data.active_workout_exercise_id) {
    return mutationError("Sólo se puede deshacer la última serie completada.");
  }

  revalidateWorkout(sessionId);
  return {
    ok: true,
    value: {
      workoutExerciseId: data.workout_exercise_id,
      setNumber: data.set_number,
      activeWorkoutExerciseId: data.active_workout_exercise_id,
      restEndsAt: data.rest_ends_at,
    },
  };
}

export async function extendWorkoutRestAction(
  sessionId: string,
): Promise<WorkoutMutationResult<string>> {
  if (!isUuid(sessionId)) return mutationError("Entrenamiento inválido.");

  await requireCompletedProfile();
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("extend_workout_rest", {
    target_workout_session_id: sessionId,
    extension_seconds: 15,
  });

  if (error || !data) {
    return mutationError("El descanso ya terminó y no pudo extenderse.");
  }

  revalidateWorkout(sessionId);
  return { ok: true, value: data };
}

export async function skipWorkoutRestAction(
  sessionId: string,
): Promise<WorkoutMutationResult<null>> {
  if (!isUuid(sessionId)) return mutationError("Entrenamiento inválido.");

  await requireCompletedProfile();
  const supabase = await createClient();
  const { error } = await supabase.rpc("skip_workout_rest", {
    target_workout_session_id: sessionId,
  });

  if (error) return mutationError("No pudimos finalizar el descanso.");

  revalidateWorkout(sessionId);
  return { ok: true, value: null };
}

export async function selectWorkoutExerciseAction(
  sessionId: string,
  workoutExerciseId: string,
): Promise<WorkoutMutationResult<null>> {
  if (!isUuid(sessionId) || !isUuid(workoutExerciseId)) {
    return mutationError("Ejercicio inválido.");
  }

  await requireCompletedProfile();
  const supabase = await createClient();
  const { error } = await supabase.rpc("select_workout_exercise", {
    target_workout_session_id: sessionId,
    target_workout_exercise_id: workoutExerciseId,
  });

  if (error) return mutationError("No pudimos abrir ese ejercicio.");

  revalidateWorkout(sessionId);
  return { ok: true, value: null };
}

export async function finishWorkoutAction(
  sessionId: string,
): Promise<WorkoutMutationResult<string>> {
  if (!isUuid(sessionId)) return mutationError("Entrenamiento inválido.");

  await requireCompletedProfile();
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("finish_workout", {
    target_workout_session_id: sessionId,
  });

  if (error || !data) {
    return mutationError("No pudimos finalizar el entrenamiento.");
  }

  revalidateWorkout(sessionId);
  return { ok: true, value: data };
}
