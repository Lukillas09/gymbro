import type { QueryData } from "@supabase/supabase-js";
import { requireCompletedProfile } from "@/features/auth/server";
import {
  APP_TIME_ZONE,
  getLocalDateKey,
  getLocalDateKeyRange,
} from "@/lib/date-time";
import { createClient } from "@/lib/supabase/server";
import {
  buildCalendarDays,
  buildCalendarMonthFrame,
  resolveCalendarMonthKey,
  resolveSelectedDateKey,
} from "./domain";
import type {
  CalendarPageModel,
  CalendarScheduledDay,
  CalendarWorkout,
} from "./types";

const calendarRoutineSelect = `
  id,
  routine_days (
    id,
    name,
    position,
    weekday,
    routine_exercises (
      id,
      exercise:exercises (
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

const calendarSessionSelect = `
  id,
  routine_day_id,
  routine_name_snapshot,
  routine_day_name_snapshot,
  started_at,
  completed_at,
  status,
  workout_exercises!workout_exercises_workout_session_id_fkey (
    workout_sets!workout_sets_workout_exercise_id_fkey (id)
  )
` as const;

type ServerSupabaseClient = Awaited<ReturnType<typeof createClient>>;

function activeRoutineQuery(supabase: ServerSupabaseClient, userId: string) {
  return supabase
    .from("routines")
    .select(calendarRoutineSelect)
    .eq("user_id", userId)
    .eq("is_active", true)
    .is("archived_at", null)
    .maybeSingle();
}

function completedSessionsQuery(
  supabase: ServerSupabaseClient,
  userId: string,
  start: string,
  end: string,
) {
  return supabase
    .from("workout_sessions")
    .select(calendarSessionSelect)
    .eq("user_id", userId)
    .eq("status", "completed")
    .not("completed_at", "is", null)
    .gte("completed_at", start)
    .lt("completed_at", end)
    .order("completed_at", { ascending: false });
}

function activeSessionQuery(supabase: ServerSupabaseClient, userId: string) {
  return supabase
    .from("workout_sessions")
    .select(calendarSessionSelect)
    .eq("user_id", userId)
    .eq("status", "in_progress")
    .maybeSingle();
}

function completedSessionExistsQuery(
  supabase: ServerSupabaseClient,
  userId: string,
) {
  return supabase
    .from("workout_sessions")
    .select("id")
    .eq("user_id", userId)
    .eq("status", "completed")
    .limit(1);
}

type ActiveRoutineRow = NonNullable<
  QueryData<ReturnType<typeof activeRoutineQuery>>
>;
type CompletedSessionRow = QueryData<
  ReturnType<typeof completedSessionsQuery>
>[number];
type ActiveSessionRow = NonNullable<
  QueryData<ReturnType<typeof activeSessionQuery>>
>;

function mapSession(
  row: CompletedSessionRow | ActiveSessionRow,
): CalendarWorkout {
  if (row.status !== "completed" && row.status !== "in_progress") {
    throw new Error("El calendario contiene una sesion invalida.");
  }

  return {
    id: row.id,
    routineDayId: row.routine_day_id,
    routineName: row.routine_name_snapshot,
    dayName: row.routine_day_name_snapshot,
    startedAt: row.started_at,
    completedAt: row.completed_at,
    status: row.status,
    completedSetCount: row.workout_exercises.reduce(
      (total, exercise) => total + exercise.workout_sets.length,
      0,
    ),
  };
}

function mapScheduledDays(row: ActiveRoutineRow): CalendarScheduledDay[] {
  return row.routine_days
    .filter(
      (day): day is typeof day & { weekday: number } =>
        day.weekday !== null && day.routine_exercises.length > 0,
    )
    .map((day) => ({
      id: day.id,
      name: day.name,
      position: day.position,
      weekday: day.weekday,
      exerciseCount: day.routine_exercises.length,
      primaryMuscleGroups: [
        ...new Set(
          day.routine_exercises.flatMap(({ exercise }) =>
            exercise
              ? exercise.exercise_muscles
                  .filter(
                    ({ involvement_type }) => involvement_type === "primary",
                  )
                  .flatMap(({ muscle }) =>
                    muscle?.group ? [muscle.group.name] : [],
                  )
              : [],
          ),
        ),
      ].slice(0, 3),
    }))
    .sort((left, right) => left.position - right.position);
}

export async function getCalendarPageModel(
  monthCandidate: string | string[] | undefined,
  dayCandidate: string | string[] | undefined,
  now = new Date(),
): Promise<CalendarPageModel> {
  const todayDateKey = getLocalDateKey(now, APP_TIME_ZONE);
  const monthKey = resolveCalendarMonthKey(monthCandidate, todayDateKey);
  const frame = buildCalendarMonthFrame(monthKey);
  const selectedDateKey = resolveSelectedDateKey(
    dayCandidate,
    frame,
    todayDateKey,
  );
  const range = getLocalDateKeyRange(
    frame.firstDateKey,
    frame.endDateKey,
    APP_TIME_ZONE,
  );
  const { userId } = await requireCompletedProfile();
  const supabase = await createClient();

  const [routineResult, completedResult, activeResult] = await Promise.all([
    activeRoutineQuery(supabase, userId),
    completedSessionsQuery(supabase, userId, range.start, range.end),
    activeSessionQuery(supabase, userId),
  ]);

  if (routineResult.error) {
    throw new Error("No pudimos cargar la planificacion del calendario.");
  }
  if (completedResult.error) {
    throw new Error("No pudimos cargar los entrenamientos del mes.");
  }
  if (activeResult.error) {
    throw new Error("No pudimos comprobar tu entrenamiento activo.");
  }

  const routine = routineResult.data;
  const trainableDays =
    routine?.routine_days.filter(
      ({ routine_exercises }) => routine_exercises.length > 0,
    ) ?? [];
  const scheduleStatus = !routine
    ? "none"
    : trainableDays.length > 0 &&
        trainableDays.every(({ weekday }) => weekday !== null)
      ? "complete"
      : "partial";
  const scheduledDays =
    routine && scheduleStatus === "complete" ? mapScheduledDays(routine) : [];
  const completedSessions = completedResult.data.map(mapSession);
  const activeSession = activeResult.data
    ? mapSession(activeResult.data)
    : null;
  let hasAnyWorkout = completedSessions.length > 0 || Boolean(activeSession);

  if (!routine && !hasAnyWorkout) {
    const existenceResult = await completedSessionExistsQuery(supabase, userId);
    if (existenceResult.error) {
      throw new Error("No pudimos comprobar tu historial de entrenamientos.");
    }
    hasAnyWorkout = existenceResult.data.length > 0;
  }

  const days = buildCalendarDays({
    frame,
    todayDateKey,
    selectedDateKey,
    scheduledDays,
    completedSessions,
    activeSession,
  });
  const selectedDay = days.find(({ isSelected }) => isSelected);

  if (!selectedDay) {
    throw new Error("No pudimos resolver el dia seleccionado.");
  }

  return {
    month: {
      monthKey: frame.monthKey,
      monthLabel: frame.monthLabel,
      previousMonthKey: frame.previousMonthKey,
      nextMonthKey: frame.nextMonthKey,
      visibleStartDateKey: frame.firstDateKey,
      visibleEndDateKey: frame.endDateKey,
      selectedDateKey,
      todayDateKey,
      days,
    },
    selectedDay,
    activeSession,
    scheduleStatus,
    hasActiveRoutine: Boolean(routine),
    hasAnyWorkout,
  };
}
