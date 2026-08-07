import { cache } from "react";
import type { QueryData } from "@supabase/supabase-js";
import { requireCompletedProfile } from "@/features/auth/server";
import { createClient } from "@/lib/supabase/server";
import type {
  RoutineDay,
  RoutineDetail,
  RoutineExercisePrescription,
  RoutineListItem,
} from "./types";

const routineListSelect = `
  id,
  name,
  goal,
  is_active,
  archived_at,
  updated_at,
  routine_days (
    id,
    routine_exercises (id)
  )
` as const;

const routineDetailSelect = `
  id,
  name,
  description,
  goal,
  is_active,
  archived_at,
  created_at,
  updated_at,
  routine_days (
    id,
    name,
    position,
    weekday,
    updated_at,
    routine_exercises (
      id,
      position,
      updated_at,
      target_sets,
      target_reps_min,
      target_reps_max,
      rest_seconds,
      target_rir,
      notes,
      exercise:exercises (
        id,
        name,
        slug,
        exercise_muscles (
          involvement_type,
          muscle:muscles (
            id,
            name,
            slug,
            group:muscle_groups (
              id,
              name,
              slug
            )
          )
        )
      )
    )
  )
` as const;

type ServerSupabaseClient = Awaited<ReturnType<typeof createClient>>;

function routineListQuery(supabase: ServerSupabaseClient, userId: string) {
  return supabase
    .from("routines")
    .select(routineListSelect)
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });
}

function routineDetailQuery(
  supabase: ServerSupabaseClient,
  userId: string,
  routineId: string,
) {
  return supabase
    .from("routines")
    .select(routineDetailSelect)
    .eq("user_id", userId)
    .eq("id", routineId)
    .maybeSingle();
}

type RoutineListRow = QueryData<ReturnType<typeof routineListQuery>>[number];
type RoutineDetailRow = NonNullable<
  QueryData<ReturnType<typeof routineDetailQuery>>
>;

function mapRoutineListItem(row: RoutineListRow): RoutineListItem {
  return {
    id: row.id,
    name: row.name,
    goal: row.goal,
    isActive: row.is_active,
    archivedAt: row.archived_at,
    updatedAt: row.updated_at,
    dayCount: row.routine_days.length,
    exerciseCount: row.routine_days.reduce(
      (total, day) => total + day.routine_exercises.length,
      0,
    ),
  };
}

function mapRoutineExercise(
  row: RoutineDetailRow["routine_days"][number]["routine_exercises"][number],
): RoutineExercisePrescription {
  if (!row.exercise) {
    throw new Error("La rutina contiene un ejercicio inválido.");
  }

  const muscles = row.exercise.exercise_muscles.map((relation) => {
    if (!relation.muscle?.group) {
      throw new Error("La rutina contiene una relación muscular inválida.");
    }

    return {
      involvement: relation.involvement_type,
      muscle: {
        id: relation.muscle.id,
        name: relation.muscle.name,
        slug: relation.muscle.slug,
        group: relation.muscle.group,
      },
    };
  });

  return {
    id: row.id,
    updatedAt: row.updated_at,
    position: row.position,
    targetSets: row.target_sets,
    targetRepsMin: row.target_reps_min,
    targetRepsMax: row.target_reps_max,
    restSeconds: row.rest_seconds,
    targetRir: row.target_rir,
    notes: row.notes,
    exercise: {
      id: row.exercise.id,
      name: row.exercise.name,
      slug: row.exercise.slug,
      muscles,
    },
  };
}

function mapRoutineDay(
  row: RoutineDetailRow["routine_days"][number],
): RoutineDay {
  return {
    id: row.id,
    updatedAt: row.updated_at,
    name: row.name,
    position: row.position,
    weekday: row.weekday,
    exercises: row.routine_exercises
      .map(mapRoutineExercise)
      .sort((left, right) => left.position - right.position),
  };
}

function mapRoutineDetail(row: RoutineDetailRow): RoutineDetail {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    goal: row.goal,
    isActive: row.is_active,
    archivedAt: row.archived_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    days: row.routine_days
      .map(mapRoutineDay)
      .sort((left, right) => left.position - right.position),
  };
}

export const listRoutines = cache(async () => {
  const { userId } = await requireCompletedProfile();
  const supabase = await createClient();
  const { data, error } = await routineListQuery(supabase, userId);

  if (error) {
    throw new Error("No pudimos cargar tus rutinas.");
  }

  return data.map(mapRoutineListItem);
});

export const getRoutineById = cache(async (routineId: string) => {
  const { userId } = await requireCompletedProfile();
  const supabase = await createClient();
  const { data, error } = await routineDetailQuery(supabase, userId, routineId);

  if (error) {
    throw new Error("No pudimos cargar la rutina.");
  }

  return data ? mapRoutineDetail(data) : null;
});
