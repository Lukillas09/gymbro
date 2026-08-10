import { cache } from "react";
import type { QueryData } from "@supabase/supabase-js";
import { requireCompletedProfile } from "@/features/auth/server";
import { createClient } from "@/lib/supabase/server";
import type {
  PreviousPerformanceByExercise,
  WorkoutExercise,
  WorkoutLandingState,
  WorkoutSession,
  WorkoutSet,
} from "./types";

const workoutSessionSelect = `
  id,
  routine_day_id,
  routine_name_snapshot,
  routine_day_name_snapshot,
  started_at,
  completed_at,
  status,
  active_workout_exercise_id,
  rest_ends_at,
  workout_exercises!workout_exercises_workout_session_id_fkey (
    id,
    exercise_id,
    position,
    target_sets,
    target_reps_min,
    target_reps_max,
    rest_seconds,
    target_rir,
    exercise_name_snapshot,
    notes,
    workout_sets!workout_sets_workout_exercise_id_fkey (
      id,
      set_number,
      weight_kg,
      repetitions,
      rir,
      set_type,
      completed_at
    ),
    exercise:exercises (
      id,
      slug,
      exercise_muscles (
        involvement_type,
        muscle:muscles (
          group:muscle_groups (name)
        )
      )
    )
  )
` as const;

const landingRoutineSelect = `
  id,
  name,
  routine_days (
    id,
    name,
    position,
    weekday,
    routine_exercises (id)
  )
` as const;

const previousSessionsSelect = `
  id,
  completed_at,
  workout_exercises!workout_exercises_workout_session_id_fkey!inner (
    exercise_id,
    workout_sets!workout_sets_workout_exercise_id_fkey (
      id,
      set_number,
      weight_kg,
      repetitions,
      rir,
      set_type,
      completed_at
    )
  )
` as const;

const PREVIOUS_SESSION_LIMIT = 50;

type ServerSupabaseClient = Awaited<ReturnType<typeof createClient>>;

function sessionQuery(
  supabase: ServerSupabaseClient,
  userId: string,
  sessionId: string,
) {
  return supabase
    .from("workout_sessions")
    .select(workoutSessionSelect)
    .eq("id", sessionId)
    .eq("user_id", userId)
    .maybeSingle();
}

function landingRoutineQuery(supabase: ServerSupabaseClient, userId: string) {
  return supabase
    .from("routines")
    .select(landingRoutineSelect)
    .eq("user_id", userId)
    .eq("is_active", true)
    .is("archived_at", null)
    .maybeSingle();
}

function previousSessionsQuery(
  supabase: ServerSupabaseClient,
  userId: string,
  currentSessionId: string,
  exerciseIds: readonly string[],
  completedBefore: string,
) {
  return supabase
    .from("workout_sessions")
    .select(previousSessionsSelect)
    .eq("user_id", userId)
    .eq("status", "completed")
    .neq("id", currentSessionId)
    .lt("completed_at", completedBefore)
    .in("workout_exercises.exercise_id", [...exerciseIds])
    .order("completed_at", { ascending: false })
    .limit(PREVIOUS_SESSION_LIMIT);
}

type WorkoutSessionRow = NonNullable<
  QueryData<ReturnType<typeof sessionQuery>>
>;
type LandingRoutineRow = NonNullable<
  QueryData<ReturnType<typeof landingRoutineQuery>>
>;
type PreviousSessionRow = QueryData<
  ReturnType<typeof previousSessionsQuery>
>[number];

function mapWorkoutSet(
  row: WorkoutSessionRow["workout_exercises"][number]["workout_sets"][number],
): WorkoutSet {
  return {
    id: row.id,
    setNumber: row.set_number,
    weightKg: Number(row.weight_kg),
    repetitions: row.repetitions,
    rir: row.rir,
    setType: row.set_type,
    completedAt: row.completed_at,
  };
}

function mapPreviousSet(
  row: PreviousSessionRow["workout_exercises"][number]["workout_sets"][number],
): WorkoutSet {
  return {
    id: row.id,
    setNumber: row.set_number,
    weightKg: Number(row.weight_kg),
    repetitions: row.repetitions,
    rir: row.rir,
    setType: row.set_type,
    completedAt: row.completed_at,
  };
}

function mapWorkoutExercise(
  row: WorkoutSessionRow["workout_exercises"][number],
): WorkoutExercise {
  if (!row.exercise) {
    throw new Error("El entrenamiento contiene un ejercicio inválido.");
  }

  const primaryMuscleGroups = [
    ...new Set(
      row.exercise.exercise_muscles
        .filter(({ involvement_type }) => involvement_type === "primary")
        .flatMap(({ muscle }) => (muscle?.group ? [muscle.group.name] : [])),
    ),
  ];

  return {
    id: row.id,
    exerciseId: row.exercise_id,
    exerciseName: row.exercise_name_snapshot,
    exerciseSlug: row.exercise.slug,
    position: row.position,
    targetSets: row.target_sets,
    targetRepsMin: row.target_reps_min,
    targetRepsMax: row.target_reps_max,
    restSeconds: row.rest_seconds,
    targetRir: row.target_rir,
    notes: row.notes,
    primaryMuscleGroups,
    sets: row.workout_sets
      .map(mapWorkoutSet)
      .sort((left, right) => left.setNumber - right.setNumber),
  };
}

function mapWorkoutSession(row: WorkoutSessionRow): WorkoutSession {
  return {
    id: row.id,
    routineDayId: row.routine_day_id,
    routineName: row.routine_name_snapshot,
    dayName: row.routine_day_name_snapshot,
    startedAt: row.started_at,
    completedAt: row.completed_at,
    status: row.status,
    activeWorkoutExerciseId: row.active_workout_exercise_id,
    restEndsAt: row.rest_ends_at,
    exercises: row.workout_exercises
      .map(mapWorkoutExercise)
      .sort((left, right) => left.position - right.position),
  };
}

function mapPreviousPerformances(rows: readonly PreviousSessionRow[]) {
  const performances: Record<string, PreviousPerformanceByExercise[string]> =
    {};

  for (const session of rows) {
    if (!session.completed_at) continue;

    for (const exercise of session.workout_exercises) {
      if (performances[exercise.exercise_id]) continue;
      performances[exercise.exercise_id] = {
        completedAt: session.completed_at,
        sets: exercise.workout_sets
          .map(mapPreviousSet)
          .sort((left, right) => left.setNumber - right.setNumber),
      };
    }
  }

  return performances;
}

function getSuggestedDayId(
  days: LandingRoutineRow["routine_days"],
  latestCompletedDayId: string | null,
) {
  const availableDays = [...days]
    .sort((left, right) => left.position - right.position)
    .filter((day) => day.routine_exercises.length > 0);

  if (availableDays.length === 0) return null;
  if (!latestCompletedDayId) return availableDays[0].id;

  const latestIndex = availableDays.findIndex(
    ({ id }) => id === latestCompletedDayId,
  );
  return availableDays[(latestIndex + 1) % availableDays.length].id;
}

export const getWorkoutLandingState = cache(
  async (): Promise<WorkoutLandingState> => {
    const { userId } = await requireCompletedProfile();
    const supabase = await createClient();
    const { data: activeSession, error: activeError } = await supabase
      .from("workout_sessions")
      .select("id")
      .eq("user_id", userId)
      .eq("status", "in_progress")
      .maybeSingle();

    if (activeError) {
      throw new Error("No pudimos comprobar tu entrenamiento activo.");
    }
    if (activeSession) return { kind: "active", sessionId: activeSession.id };

    const { data: routine, error: routineError } = await landingRoutineQuery(
      supabase,
      userId,
    );
    if (routineError) throw new Error("No pudimos cargar tu rutina activa.");
    if (!routine) return { kind: "no-routine" };

    const dayIds = routine.routine_days.map(({ id }) => id);
    let latestCompletedDayId: string | null = null;

    if (dayIds.length > 0) {
      const { data: latestSession, error: latestError } = await supabase
        .from("workout_sessions")
        .select("routine_day_id")
        .eq("user_id", userId)
        .eq("status", "completed")
        .in("routine_day_id", dayIds)
        .order("completed_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (latestError) {
        throw new Error("No pudimos resolver el próximo día sugerido.");
      }
      latestCompletedDayId = latestSession?.routine_day_id ?? null;
    }

    return {
      kind: "ready",
      routineId: routine.id,
      routineName: routine.name,
      suggestedDayId: getSuggestedDayId(
        routine.routine_days,
        latestCompletedDayId,
      ),
      days: routine.routine_days
        .map((day) => ({
          id: day.id,
          name: day.name,
          position: day.position,
          weekday: day.weekday,
          exerciseCount: day.routine_exercises.length,
        }))
        .sort((left, right) => left.position - right.position),
    };
  },
);

export const getWorkoutSessionById = cache(async (sessionId: string) => {
  const { userId } = await requireCompletedProfile();
  const supabase = await createClient();
  const { data, error } = await sessionQuery(supabase, userId, sessionId);

  if (error) throw new Error("No pudimos recuperar el entrenamiento.");
  if (!data) return null;

  const session = mapWorkoutSession(data);
  const exerciseIds = [
    ...new Set(session.exercises.map(({ exerciseId }) => exerciseId)),
  ];
  let previousByExercise: PreviousPerformanceByExercise = {};

  if (exerciseIds.length > 0) {
    const { data: previousRows, error: previousError } =
      await previousSessionsQuery(
        supabase,
        userId,
        sessionId,
        exerciseIds,
        session.completedAt ?? session.startedAt,
      );
    if (previousError) {
      throw new Error("No pudimos cargar tu última sesión comparable.");
    }
    previousByExercise = mapPreviousPerformances(previousRows);
  }

  return { session, previousByExercise };
});
