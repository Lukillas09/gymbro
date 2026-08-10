import { cache } from "react";
import type { QueryData } from "@supabase/supabase-js";
import {
  TRAINING_GOAL_OPTIONS,
  TRAINING_LEVEL_OPTIONS,
  getOptionLabel,
} from "@/features/auth/constants";
import { requireCompletedProfile } from "@/features/auth/server";
import { getCompletedSetCount } from "@/features/history/domain";
import {
  mapWeightPersonalRecord,
  weightPersonalRecordQuery,
} from "@/features/progress/records";
import { APP_TIME_ZONE, getLocalRollingDayRange } from "@/lib/date-time";
import { createClient } from "@/lib/supabase/server";
import {
  buildProfileMetrics,
  countActiveWeeks,
  getLatestRecordedExercise,
  getProfileInitials,
  getRecentMuscleGroups,
} from "./domain";
import type {
  ProfileActiveRoutine,
  ProfileActivity,
  ProfileIdentityModel,
} from "./types";

const RECENT_ACTIVITY_LIMIT = 3;
const RECENT_SESSION_LIMIT = 80;

const recentActivitySelect = `
  id,
  routine_day_name_snapshot,
  started_at,
  completed_at,
  workout_exercises!workout_exercises_workout_session_id_fkey (
    exercise_id,
    exercise_name_snapshot,
    workout_sets!workout_sets_workout_exercise_id_fkey (
      id,
      repetitions
    ),
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

const activeRoutineSelect = `
  id,
  name,
  routine_days (
    id,
    routine_exercises (id)
  )
` as const;

type ServerSupabaseClient = Awaited<ReturnType<typeof createClient>>;

function recentActivityQuery(supabase: ServerSupabaseClient, userId: string) {
  return supabase
    .from("workout_sessions")
    .select(recentActivitySelect, { count: "exact" })
    .eq("user_id", userId)
    .eq("status", "completed")
    .not("completed_at", "is", null)
    .order("completed_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(RECENT_ACTIVITY_LIMIT);
}

function recentFrequencyQuery(
  supabase: ServerSupabaseClient,
  userId: string,
  start: string,
  end: string,
) {
  return supabase
    .from("workout_sessions")
    .select("id, completed_at", { count: "exact" })
    .eq("user_id", userId)
    .eq("status", "completed")
    .gte("completed_at", start)
    .lt("completed_at", end)
    .order("completed_at", { ascending: false })
    .limit(RECENT_SESSION_LIMIT);
}

function activeRoutineQuery(supabase: ServerSupabaseClient, userId: string) {
  return supabase
    .from("routines")
    .select(activeRoutineSelect)
    .eq("user_id", userId)
    .eq("is_active", true)
    .is("archived_at", null)
    .limit(1)
    .maybeSingle();
}

type RecentActivityRow = QueryData<
  ReturnType<typeof recentActivityQuery>
>[number];
type ActiveRoutineRow = NonNullable<
  QueryData<ReturnType<typeof activeRoutineQuery>>
>;

function mapActivity(row: RecentActivityRow): ProfileActivity {
  if (!row.completed_at) {
    throw new Error("El perfil contiene una sesión sin fecha de cierre.");
  }

  const primaryMuscleGroups = [
    ...new Set(
      row.workout_exercises.flatMap((workoutExercise) =>
        workoutExercise.exercise
          ? workoutExercise.exercise.exercise_muscles
              .filter(({ involvement_type }) => involvement_type === "primary")
              .flatMap(({ muscle }) =>
                muscle?.group ? [muscle.group.name] : [],
              )
          : [],
      ),
    ),
  ];

  return {
    id: row.id,
    dayName: row.routine_day_name_snapshot,
    startedAt: row.started_at,
    completedAt: row.completed_at,
    completedSetCount: getCompletedSetCount(
      row.workout_exercises.map(({ workout_sets }) => ({
        sets: workout_sets,
      })),
    ),
    primaryMuscleGroups,
    exercises: row.workout_exercises.map((exercise) => ({
      exerciseId: exercise.exercise_id,
      exerciseName: exercise.exercise_name_snapshot,
      hasValidSet: exercise.workout_sets.some(
        ({ repetitions }) => repetitions > 0,
      ),
    })),
  };
}

function mapActiveRoutine(row: ActiveRoutineRow): ProfileActiveRoutine {
  return {
    id: row.id,
    name: row.name,
    dayCount: row.routine_days.length,
    exerciseCount: row.routine_days.reduce(
      (total, day) => total + day.routine_exercises.length,
      0,
    ),
  };
}

export const getProfileIdentity = cache(
  async (now = new Date()): Promise<ProfileIdentityModel> => {
    const { userId, profile } = await requireCompletedProfile();
    const supabase = await createClient();
    const recentRange = getLocalRollingDayRange(now, APP_TIME_ZONE, 28);
    const [activityResult, frequencyResult, routineResult] = await Promise.all([
      recentActivityQuery(supabase, userId),
      recentFrequencyQuery(
        supabase,
        userId,
        recentRange.start,
        recentRange.end,
      ),
      activeRoutineQuery(supabase, userId),
    ]);

    if (activityResult.error || frequencyResult.error || routineResult.error) {
      throw new Error("No pudimos construir tu identidad de entrenamiento.");
    }

    const recentActivity = activityResult.data.map(mapActivity);
    const latestExercise = getLatestRecordedExercise(recentActivity);
    const recordResult = latestExercise
      ? await weightPersonalRecordQuery(
          supabase,
          userId,
          latestExercise.exerciseId,
        )
      : null;

    if (recordResult?.error) {
      throw new Error("No pudimos cargar tu mejor registro.");
    }

    const totalCompletedWorkouts =
      activityResult.count ?? recentActivity.length;
    const activeWeekCount = countActiveWeeks(
      frequencyResult.data.flatMap(({ completed_at }) =>
        completed_at ? [completed_at] : [],
      ),
    );
    const record = recordResult?.data
      ? mapWeightPersonalRecord(recordResult.data)
      : null;
    const personalRecord =
      latestExercise && record
        ? {
            exerciseId: latestExercise.exerciseId,
            exerciseName: latestExercise.exerciseName,
            sessionId: record.sessionId,
            completedAt: record.completedAt,
            weightKg: record.set.weightKg,
            repetitions: record.set.repetitions,
          }
        : null;

    return {
      identity: {
        displayName: profile.display_name ?? "GymBro",
        username: profile.username ?? "gymbro",
        initials: getProfileInitials(
          profile.display_name ?? "",
          profile.username ?? "",
        ),
        trainingLevel:
          getOptionLabel(TRAINING_LEVEL_OPTIONS, profile.training_level) ?? "",
        primaryGoal:
          getOptionLabel(TRAINING_GOAL_OPTIONS, profile.primary_goal) ?? "",
      },
      metrics: buildProfileMetrics(
        totalCompletedWorkouts,
        frequencyResult.count ?? frequencyResult.data.length,
        activeWeekCount,
      ),
      activeRoutine: routineResult.data
        ? mapActiveRoutine(routineResult.data)
        : null,
      recentMuscleGroups: getRecentMuscleGroups(recentActivity),
      personalRecord,
      recentActivity,
      totalCompletedWorkouts,
    };
  },
);
