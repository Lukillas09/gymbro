import type { QueryData } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import type { WeightPersonalRecord } from "./types";

const personalRecordSelect = `
  id,
  set_number,
  weight_kg,
  repetitions,
  completed_at,
  workout_exercise:workout_exercises!workout_sets_workout_exercise_id_fkey!inner (
    exercise_id,
    workout_session:workout_sessions!workout_exercises_workout_session_id_fkey!inner (
      id,
      user_id,
      status,
      completed_at
    )
  )
` as const;

type ServerSupabaseClient = Awaited<ReturnType<typeof createClient>>;

export function weightPersonalRecordQuery(
  supabase: ServerSupabaseClient,
  userId: string,
  exerciseId: string,
) {
  return supabase
    .from("workout_sets")
    .select(personalRecordSelect)
    .eq("workout_exercise.exercise_id", exerciseId)
    .eq("workout_exercise.workout_session.user_id", userId)
    .eq("workout_exercise.workout_session.status", "completed")
    .gt("repetitions", 0)
    .order("weight_kg", { ascending: false })
    .order("repetitions", { ascending: false })
    .order("completed_at", { ascending: false })
    .order("set_number", { ascending: true })
    .limit(1)
    .maybeSingle();
}

type PersonalRecordRow = NonNullable<
  QueryData<ReturnType<typeof weightPersonalRecordQuery>>
>;

export function mapWeightPersonalRecord(
  row: PersonalRecordRow,
): WeightPersonalRecord {
  return {
    sessionId: row.workout_exercise.workout_session.id,
    completedAt:
      row.workout_exercise.workout_session.completed_at ?? row.completed_at,
    set: {
      id: row.id,
      setNumber: row.set_number,
      weightKg: Number(row.weight_kg),
      repetitions: row.repetitions,
      completedAt: row.completed_at,
    },
  };
}
