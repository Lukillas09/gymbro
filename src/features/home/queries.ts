import type { QueryData } from "@supabase/supabase-js";
import { requireCompletedProfile } from "@/features/auth/server";
import { createClient } from "@/lib/supabase/server";
import { HOME_PREVIOUS_SESSION_LIMIT, HOME_TIME_ZONE } from "./constants";
import {
  deriveHomeState,
  findFactualImprovement,
  formatHomeDate,
  getLocalDayRange,
  getLocalWeekRange,
  selectBroCue,
} from "./domain";
import type {
  HomePageModel,
  HomePreviousPerformance,
  HomePreviousPerformances,
  HomeRoutine,
  HomeRoutineDay,
  HomeRoutineExercise,
  HomeSessionExercise,
  HomeWorkoutSession,
  HomeWorkoutSet,
} from "./types";

const homeRoutineSelect = `
  id,
  name,
  routine_days (
    id,
    name,
    position,
    weekday,
    routine_exercises (
      id,
      exercise_id,
      position,
      exercise:exercises (
        name,
        exercise_muscles (
          involvement_type,
          muscle:muscles (
            group:muscle_groups (name)
          )
        )
      )
    )
  )
` as const;

const homeSessionSelect = `
  id,
  routine_day_id,
  routine_name_snapshot,
  routine_day_name_snapshot,
  started_at,
  completed_at,
  status,
  active_workout_exercise_id,
  workout_exercises!workout_exercises_workout_session_id_fkey (
    id,
    exercise_id,
    exercise_name_snapshot,
    position,
    target_sets,
    workout_sets!workout_sets_workout_exercise_id_fkey (
      set_number,
      weight_kg,
      repetitions,
      completed_at
    )
  )
` as const;

const homePreviousSessionSelect = `
  id,
  completed_at,
  workout_exercises!workout_exercises_workout_session_id_fkey!inner (
    exercise_id,
    workout_sets!workout_sets_workout_exercise_id_fkey (
      set_number,
      weight_kg,
      repetitions,
      completed_at
    )
  )
` as const;

type ServerSupabaseClient = Awaited<ReturnType<typeof createClient>>;

function activeRoutineQuery(supabase: ServerSupabaseClient, userId: string) {
  return supabase
    .from("routines")
    .select(homeRoutineSelect)
    .eq("user_id", userId)
    .eq("is_active", true)
    .is("archived_at", null)
    .maybeSingle();
}

function activeSessionQuery(supabase: ServerSupabaseClient, userId: string) {
  return supabase
    .from("workout_sessions")
    .select(homeSessionSelect)
    .eq("user_id", userId)
    .eq("status", "in_progress")
    .maybeSingle();
}

function weeklySessionCountQuery(
  supabase: ServerSupabaseClient,
  userId: string,
  start: string,
  end: string,
) {
  return supabase
    .from("workout_sessions")
    .select("id", { count: "exact" })
    .eq("user_id", userId)
    .eq("status", "completed")
    .gte("completed_at", start)
    .lt("completed_at", end)
    .limit(1);
}

function completedTodayQuery(
  supabase: ServerSupabaseClient,
  userId: string,
  start: string,
  end: string,
) {
  return supabase
    .from("workout_sessions")
    .select(homeSessionSelect)
    .eq("user_id", userId)
    .eq("status", "completed")
    .gte("completed_at", start)
    .lt("completed_at", end)
    .order("completed_at", { ascending: false })
    .limit(1);
}

function previousSessionsQuery(
  supabase: ServerSupabaseClient,
  userId: string,
  sessionId: string | null,
  completedBefore: string,
  exerciseIds: readonly string[],
) {
  let query = supabase
    .from("workout_sessions")
    .select(homePreviousSessionSelect)
    .eq("user_id", userId)
    .eq("status", "completed")
    .lt("completed_at", completedBefore)
    .in("workout_exercises.exercise_id", [...exerciseIds])
    .order("completed_at", { ascending: false })
    .limit(HOME_PREVIOUS_SESSION_LIMIT);

  if (sessionId) query = query.neq("id", sessionId);
  return query;
}

type HomeRoutineRow = NonNullable<
  QueryData<ReturnType<typeof activeRoutineQuery>>
>;
type HomeSessionRow = NonNullable<
  QueryData<ReturnType<typeof activeSessionQuery>>
>;
type CompletedTodayRow = QueryData<
  ReturnType<typeof completedTodayQuery>
>[number];
type PreviousSessionRow = QueryData<
  ReturnType<typeof previousSessionsQuery>
>[number];

type HomeSessionLikeRow = HomeSessionRow | CompletedTodayRow;
type HomeSetLikeRow =
  HomeSessionLikeRow["workout_exercises"][number]["workout_sets"][number];
type HomePreviousSetRow =
  PreviousSessionRow["workout_exercises"][number]["workout_sets"][number];

function mapHomeSet(row: HomeSetLikeRow | HomePreviousSetRow): HomeWorkoutSet {
  return {
    setNumber: row.set_number,
    weightKg: Number(row.weight_kg),
    repetitions: row.repetitions,
    completedAt: row.completed_at,
  };
}

function mapHomeSessionExercise(
  row: HomeSessionLikeRow["workout_exercises"][number],
): HomeSessionExercise {
  return {
    id: row.id,
    exerciseId: row.exercise_id,
    exerciseName: row.exercise_name_snapshot,
    position: row.position,
    targetSets: row.target_sets,
    sets: row.workout_sets
      .map(mapHomeSet)
      .sort((left, right) => left.setNumber - right.setNumber),
  };
}

function mapHomeSession(row: HomeSessionLikeRow): HomeWorkoutSession {
  return {
    id: row.id,
    routineDayId: row.routine_day_id,
    routineName: row.routine_name_snapshot,
    dayName: row.routine_day_name_snapshot,
    startedAt: row.started_at,
    completedAt: row.completed_at,
    status: row.status,
    activeWorkoutExerciseId: row.active_workout_exercise_id,
    exercises: row.workout_exercises
      .map(mapHomeSessionExercise)
      .sort((left, right) => left.position - right.position),
  };
}

function mapRoutineExercise(
  row: HomeRoutineRow["routine_days"][number]["routine_exercises"][number],
): HomeRoutineExercise | null {
  if (!row.exercise) return null;

  const primaryMuscleGroups = [
    ...new Set(
      row.exercise.exercise_muscles
        .filter(({ involvement_type }) => involvement_type === "primary")
        .flatMap(({ muscle }) => (muscle?.group ? [muscle.group.name] : [])),
    ),
  ];

  return {
    exerciseId: row.exercise_id,
    exerciseName: row.exercise.name,
    position: row.position,
    primaryMuscleGroups,
  };
}

function mapRoutineDay(
  row: HomeRoutineRow["routine_days"][number],
): HomeRoutineDay {
  return {
    id: row.id,
    name: row.name,
    position: row.position,
    weekday: row.weekday,
    exercises: row.routine_exercises
      .map(mapRoutineExercise)
      .filter((exercise): exercise is HomeRoutineExercise => exercise !== null)
      .sort((left, right) => left.position - right.position),
  };
}

function mapHomeRoutine(row: HomeRoutineRow): HomeRoutine {
  return {
    id: row.id,
    name: row.name,
    days: row.routine_days
      .map(mapRoutineDay)
      .sort((left, right) => left.position - right.position),
  };
}

function previousPerformances(
  rows: readonly PreviousSessionRow[],
  exerciseIds: readonly string[],
): HomePreviousPerformances {
  const targetIds = new Set(exerciseIds);
  const result: Record<string, readonly HomeWorkoutSet[] | undefined> = {};

  for (const row of rows) {
    for (const exercise of row.workout_exercises) {
      if (
        !targetIds.has(exercise.exercise_id) ||
        result[exercise.exercise_id]
      ) {
        continue;
      }
      result[exercise.exercise_id] = exercise.workout_sets
        .map(mapHomeSet)
        .sort((left, right) => left.setNumber - right.setNumber);
    }
  }

  return result;
}

async function loadPreviousPerformances(
  supabase: ServerSupabaseClient,
  userId: string,
  session: HomeWorkoutSession,
) {
  if (!session.completedAt) return {} satisfies HomePreviousPerformances;
  const exerciseIds = [
    ...new Set(session.exercises.map((exercise) => exercise.exerciseId)),
  ];
  if (exerciseIds.length === 0) return {} satisfies HomePreviousPerformances;

  const { data, error } = await previousSessionsQuery(
    supabase,
    userId,
    session.id,
    session.completedAt,
    exerciseIds,
  );
  if (error) throw new Error("No pudimos comparar tu progreso reciente.");
  return previousPerformances(data, exerciseIds);
}

async function loadReadyMemory(
  supabase: ServerSupabaseClient,
  userId: string,
  day: HomeRoutineDay,
  now: Date,
): Promise<HomePreviousPerformance | null> {
  const firstExercise = day.exercises[0];
  if (!firstExercise) return null;

  const { data, error } = await previousSessionsQuery(
    supabase,
    userId,
    null,
    now.toISOString(),
    [firstExercise.exerciseId],
  );
  if (error) throw new Error("No pudimos recuperar tu última referencia.");

  for (const row of data) {
    const exercise = row.workout_exercises.find(
      (candidate) => candidate.exercise_id === firstExercise.exerciseId,
    );
    const set = exercise?.workout_sets
      .map(mapHomeSet)
      .sort((left, right) => left.setNumber - right.setNumber)
      .at(-1);
    if (set) return { exerciseName: firstExercise.exerciseName, set };
  }

  return null;
}

export async function getAdaptiveHomeModel(
  now = new Date(),
): Promise<HomePageModel> {
  const { userId, profile } = await requireCompletedProfile();
  const supabase = await createClient();
  const week = getLocalWeekRange(now, HOME_TIME_ZONE);
  const today = getLocalDayRange(now, HOME_TIME_ZONE);

  const [activeResult, routineResult, completedResult, weeklyResult] =
    await Promise.all([
      activeSessionQuery(supabase, userId),
      activeRoutineQuery(supabase, userId),
      completedTodayQuery(supabase, userId, today.start, today.end),
      weeklySessionCountQuery(supabase, userId, week.start, week.end),
    ]);

  if (activeResult.error) {
    throw new Error("No pudimos comprobar tu entrenamiento activo.");
  }
  if (routineResult.error) {
    throw new Error("No pudimos cargar tu rutina activa.");
  }
  if (completedResult.error) {
    throw new Error("No pudimos cargar tu entrenamiento de hoy.");
  }
  if (weeklyResult.error) {
    throw new Error("No pudimos cargar tus entrenamientos recientes.");
  }

  const activeSession = activeResult.data
    ? mapHomeSession(activeResult.data)
    : null;
  const activeRoutine = routineResult.data
    ? mapHomeRoutine(routineResult.data)
    : null;
  const completedSessions = completedResult.data.map(mapHomeSession);
  const weeklySummary = { completedCount: weeklyResult.count ?? 0 };
  const state = deriveHomeState(
    { activeSession, activeRoutine, completedSessions },
    now,
    HOME_TIME_ZONE,
  );

  let improvement = null;
  let memory = null;

  if (state.kind === "completed") {
    const previous = await loadPreviousPerformances(
      supabase,
      userId,
      state.session,
    );
    improvement = findFactualImprovement(state.session, previous);
  } else if (state.kind === "ready") {
    const suggestedDay = state.days.find(
      (day) => day.id === state.suggestedDayId,
    );
    if (suggestedDay) {
      memory = await loadReadyMemory(supabase, userId, suggestedDay, now);
    }
  }

  const firstName = profile.display_name?.trim().split(/\s+/)[0] ?? "GymBro";
  return {
    firstName,
    dateLabel: formatHomeDate(now, HOME_TIME_ZONE),
    generatedAt: now.toISOString(),
    timeZone: HOME_TIME_ZONE,
    state,
    broCue: selectBroCue(state, improvement, memory, weeklySummary),
    weeklySummary,
  };
}
