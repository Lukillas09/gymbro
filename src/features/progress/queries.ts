import { cache } from "react";
import type { QueryData } from "@supabase/supabase-js";
import { requireCompletedProfile } from "@/features/auth/server";
import { createClient } from "@/lib/supabase/server";
import {
  buildExerciseProgressDetail,
  buildProgressOverview,
  getProgressPeriod,
} from "./domain";
import type {
  ProgressExerciseCatalogItem,
  ProgressSourceSession,
  ProgressSourceSet,
  WeightPersonalRecord,
} from "./types";

const OVERVIEW_SESSION_LIMIT = 80;
const EXERCISE_CATALOG_LIMIT = 250;
const DETAIL_SESSION_LIMIT = 12;

const progressSessionSelect = `
  id,
  completed_at,
  workout_exercises!workout_exercises_workout_session_id_fkey (
    exercise_id,
    exercise_name_snapshot,
    workout_sets!workout_sets_workout_exercise_id_fkey (
      id,
      set_number,
      weight_kg,
      repetitions,
      completed_at
    )
  )
` as const;

const exerciseCatalogSelect = `
  exercise_id,
  exercise_name_snapshot,
  created_at,
  workout_sets!workout_sets_workout_exercise_id_fkey!inner (id),
  session:workout_sessions!workout_exercises_workout_session_id_fkey!inner (
    user_id,
    status,
    completed_at
  )
` as const;

const exerciseDetailSelect = `
  id,
  completed_at,
  workout_exercises!workout_exercises_workout_session_id_fkey!inner (
    exercise_id,
    exercise_name_snapshot,
    workout_sets!workout_sets_workout_exercise_id_fkey!inner (
      id,
      set_number,
      weight_kg,
      repetitions,
      completed_at
    )
  )
` as const;

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

function overviewPeriodQuery(
  supabase: ServerSupabaseClient,
  userId: string,
  start: string,
  end: string,
) {
  return supabase
    .from("workout_sessions")
    .select(progressSessionSelect, { count: "exact" })
    .eq("user_id", userId)
    .eq("status", "completed")
    .gte("completed_at", start)
    .lt("completed_at", end)
    .order("completed_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(OVERVIEW_SESSION_LIMIT);
}

function exerciseCatalogQuery(supabase: ServerSupabaseClient, userId: string) {
  return supabase
    .from("workout_exercises")
    .select(exerciseCatalogSelect)
    .eq("session.user_id", userId)
    .eq("session.status", "completed")
    .not("session.completed_at", "is", null)
    .gt("workout_sets.repetitions", 0)
    .order("created_at", { ascending: false })
    .limit(EXERCISE_CATALOG_LIMIT)
    .limit(1, { referencedTable: "workout_sets" });
}

function exerciseDetailQuery(
  supabase: ServerSupabaseClient,
  userId: string,
  exerciseId: string,
) {
  return supabase
    .from("workout_sessions")
    .select(exerciseDetailSelect, { count: "exact" })
    .eq("user_id", userId)
    .eq("status", "completed")
    .eq("workout_exercises.exercise_id", exerciseId)
    .not("completed_at", "is", null)
    .order("completed_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(DETAIL_SESSION_LIMIT + 1);
}

function personalRecordQuery(
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

type ProgressSessionRow = QueryData<
  ReturnType<typeof overviewPeriodQuery>
>[number];
type ExerciseCatalogRow = QueryData<
  ReturnType<typeof exerciseCatalogQuery>
>[number];
type PersonalRecordRow = NonNullable<
  QueryData<ReturnType<typeof personalRecordQuery>>
>;

function mapSet(
  row: ProgressSessionRow["workout_exercises"][number]["workout_sets"][number],
): ProgressSourceSet {
  return {
    id: row.id,
    setNumber: row.set_number,
    weightKg: Number(row.weight_kg),
    repetitions: row.repetitions,
    completedAt: row.completed_at,
  };
}

function mapSession(row: ProgressSessionRow): ProgressSourceSession {
  if (!row.completed_at) {
    throw new Error("El progreso contiene una sesión sin fecha de cierre.");
  }

  return {
    id: row.id,
    completedAt: row.completed_at,
    exercises: row.workout_exercises.map((exercise) => ({
      exerciseId: exercise.exercise_id,
      exerciseName: exercise.exercise_name_snapshot,
      sets: exercise.workout_sets.map(mapSet),
    })),
  };
}

function mapCatalog(rows: readonly ExerciseCatalogRow[]) {
  const catalog = new Map<string, ProgressExerciseCatalogItem>();

  for (const row of rows) {
    if (!row.session.completed_at || catalog.has(row.exercise_id)) continue;
    catalog.set(row.exercise_id, {
      exerciseId: row.exercise_id,
      exerciseName: row.exercise_name_snapshot,
      lastPerformedAt: row.session.completed_at,
    });
  }

  return [...catalog.values()].sort(
    (left, right) =>
      Date.parse(right.lastPerformedAt) - Date.parse(left.lastPerformedAt) ||
      left.exerciseName.localeCompare(right.exerciseName, "es"),
  );
}

function mapPersonalRecord(row: PersonalRecordRow): WeightPersonalRecord {
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

export const getProgressOverview = cache(async (now = new Date()) => {
  const { userId } = await requireCompletedProfile();
  const supabase = await createClient();
  const period = getProgressPeriod(now);
  const [currentResult, previousResult, catalogResult] = await Promise.all([
    overviewPeriodQuery(
      supabase,
      userId,
      period.current.start,
      period.current.end,
    ),
    overviewPeriodQuery(
      supabase,
      userId,
      period.previous.start,
      period.previous.end,
    ),
    exerciseCatalogQuery(supabase, userId),
  ]);

  if (currentResult.error || previousResult.error || catalogResult.error) {
    throw new Error("No pudimos calcular tu progreso.");
  }

  const currentSessions = currentResult.data.map(mapSession);
  const previousSessions = previousResult.data.map(mapSession);

  return {
    period,
    overview: buildProgressOverview(
      currentSessions,
      previousSessions,
      mapCatalog(catalogResult.data),
      period,
      currentResult.count ?? currentSessions.length,
      previousResult.count ?? previousSessions.length,
    ),
  };
});

export const getExerciseProgress = cache(async (exerciseId: string) => {
  const { userId } = await requireCompletedProfile();
  const supabase = await createClient();
  const [sessionsResult, recordResult] = await Promise.all([
    exerciseDetailQuery(supabase, userId, exerciseId),
    personalRecordQuery(supabase, userId, exerciseId),
  ]);

  if (sessionsResult.error || recordResult.error) {
    throw new Error("No pudimos cargar la evolución de este ejercicio.");
  }

  const sessions = sessionsResult.data.map(mapSession);
  const firstExercise = sessions[0]?.exercises.find(
    (exercise) => exercise.exerciseId === exerciseId,
  );
  if (!firstExercise) return null;

  return buildExerciseProgressDetail(
    exerciseId,
    firstExercise.exerciseName,
    sessions,
    sessionsResult.count ?? sessions.length,
    recordResult.data ? mapPersonalRecord(recordResult.data) : null,
    DETAIL_SESSION_LIMIT,
  );
});
