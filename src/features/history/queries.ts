import type { QueryData } from "@supabase/supabase-js";
import { requireCompletedProfile } from "@/features/auth/server";
import { getWorkoutSessionById } from "@/features/workouts/queries";
import { createClient } from "@/lib/supabase/server";
import {
  asCompletedWorkoutSession,
  getCompletedSetCount,
  getPrimaryMuscleSummary,
  HISTORY_PAGE_SIZE,
  paginateHistoryItems,
} from "./domain";
import type {
  CompletedWorkoutHistory,
  HistoryCursor,
  HistoryListItem,
} from "./types";

const historyListSelect = `
  id,
  routine_name_snapshot,
  routine_day_name_snapshot,
  started_at,
  completed_at,
  workout_exercises!workout_exercises_workout_session_id_fkey (
    workout_sets!workout_sets_workout_exercise_id_fkey (id),
    exercise:exercises (
      exercise_muscles (
        involvement_type,
        muscle:muscles (
          group:muscle_groups (name)
        )
      )
    )
  )
` as const;

type ServerSupabaseClient = Awaited<ReturnType<typeof createClient>>;

function completedHistoryQuery(
  supabase: ServerSupabaseClient,
  userId: string,
  cursor: HistoryCursor | null,
) {
  let query = supabase
    .from("workout_sessions")
    .select(historyListSelect)
    .eq("user_id", userId)
    .eq("status", "completed")
    .not("completed_at", "is", null);

  if (cursor) {
    query = query.or(
      `completed_at.lt.${cursor.completedAt},and(completed_at.eq.${cursor.completedAt},id.lt.${cursor.id})`,
    );
  }

  return query
    .order("completed_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(HISTORY_PAGE_SIZE + 1);
}

type CompletedHistoryRow = QueryData<
  ReturnType<typeof completedHistoryQuery>
>[number];

function mapHistoryListItem(row: CompletedHistoryRow): HistoryListItem {
  if (!row.completed_at) {
    throw new Error("El historial contiene una sesión sin fecha de cierre.");
  }

  const exercises = row.workout_exercises.map((exercise) => ({
    sets: exercise.workout_sets,
    primaryMuscleGroups: exercise.exercise
      ? [
          ...new Set(
            exercise.exercise.exercise_muscles
              .filter(({ involvement_type }) => involvement_type === "primary")
              .flatMap(({ muscle }) =>
                muscle?.group ? [muscle.group.name] : [],
              ),
          ),
        ]
      : [],
  }));

  return {
    id: row.id,
    routineName: row.routine_name_snapshot,
    dayName: row.routine_day_name_snapshot,
    startedAt: row.started_at,
    completedAt: row.completed_at,
    completedSetCount: getCompletedSetCount(exercises),
    primaryMuscleGroups: getPrimaryMuscleSummary(exercises),
  };
}

export async function listCompletedWorkouts(cursor: HistoryCursor | null) {
  const { userId } = await requireCompletedProfile();
  const supabase = await createClient();
  const { data, error } = await completedHistoryQuery(supabase, userId, cursor);

  if (error) throw new Error("No pudimos cargar tu historial.");
  return paginateHistoryItems(data.map(mapHistoryListItem));
}

export async function getCompletedWorkout(
  sessionId: string,
): Promise<CompletedWorkoutHistory | null> {
  const result = await getWorkoutSessionById(sessionId);
  if (!result) return null;

  const session = asCompletedWorkoutSession(result.session);
  if (!session) return null;
  return { session, previousByExercise: result.previousByExercise };
}
