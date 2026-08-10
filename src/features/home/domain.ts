import {
  compareFactualProgress,
  formatWeight,
} from "@/features/workouts/domain";
import type {
  DeriveHomeStateInput,
  HomeBroCue,
  HomeImprovement,
  HomePreviousPerformance,
  HomePreviousPerformances,
  HomeRoutine,
  HomeRoutineDay,
  HomeSessionExercise,
  HomeState,
  HomeWorkoutSession,
  NextRoutineDay,
  WeeklySummary,
} from "./types";

type ZonedCalendarDate = Readonly<{
  year: number;
  month: number;
  day: number;
}>;

const datePartFormatter = new Map<string, Intl.DateTimeFormat>();

function getDatePartFormatter(timeZone: string) {
  const existing = datePartFormatter.get(timeZone);
  if (existing) return existing;

  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });
  datePartFormatter.set(timeZone, formatter);
  return formatter;
}

function numericPart(parts: Intl.DateTimeFormatPart[], type: string) {
  const value = parts.find((part) => part.type === type)?.value;
  if (!value) throw new Error(`No pudimos resolver la fecha local: ${type}.`);
  return Number(value);
}

function getZonedParts(date: Date, timeZone: string) {
  const parts = getDatePartFormatter(timeZone).formatToParts(date);
  return {
    year: numericPart(parts, "year"),
    month: numericPart(parts, "month"),
    day: numericPart(parts, "day"),
    hour: numericPart(parts, "hour"),
    minute: numericPart(parts, "minute"),
    second: numericPart(parts, "second"),
  };
}

function calendarDate(date: Date, timeZone: string): ZonedCalendarDate {
  const { year, month, day } = getZonedParts(date, timeZone);
  return { year, month, day };
}

function addCalendarDays(date: ZonedCalendarDate, days: number) {
  const shifted = new Date(
    Date.UTC(date.year, date.month - 1, date.day + days),
  );
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate(),
  } satisfies ZonedCalendarDate;
}

function zonedMidnightToUtc(date: ZonedCalendarDate, timeZone: string) {
  const target = Date.UTC(date.year, date.month - 1, date.day);
  let candidate = target;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const parts = getZonedParts(new Date(candidate), timeZone);
    const representedAsUtc = Date.UTC(
      parts.year,
      parts.month - 1,
      parts.day,
      parts.hour,
      parts.minute,
      parts.second,
    );
    candidate = target - (representedAsUtc - candidate);
  }

  return new Date(candidate);
}

export function getLocalDateKey(value: Date | string, timeZone: string) {
  const date = typeof value === "string" ? new Date(value) : value;
  const { year, month, day } = calendarDate(date, timeZone);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function getLocalWeekday(value: Date | string, timeZone: string) {
  const date = typeof value === "string" ? new Date(value) : value;
  const local = calendarDate(date, timeZone);
  return new Date(Date.UTC(local.year, local.month - 1, local.day)).getUTCDay();
}

export function getLocalWeekRange(now: Date, timeZone: string) {
  const local = calendarDate(now, timeZone);
  const weekday = getLocalWeekday(now, timeZone);
  const daysSinceMonday = (weekday + 6) % 7;
  const start = addCalendarDays(local, -daysSinceMonday);
  const end = addCalendarDays(start, 7);

  return {
    start: zonedMidnightToUtc(start, timeZone).toISOString(),
    end: zonedMidnightToUtc(end, timeZone).toISOString(),
  };
}

export function getLocalDayRange(now: Date, timeZone: string) {
  const start = calendarDate(now, timeZone);
  return {
    start: zonedMidnightToUtc(start, timeZone).toISOString(),
    end: zonedMidnightToUtc(addCalendarDays(start, 1), timeZone).toISOString(),
  };
}

export function formatHomeDate(now: Date, timeZone: string) {
  return new Intl.DateTimeFormat("es-AR", {
    timeZone,
    weekday: "long",
    day: "numeric",
    month: "short",
  })
    .format(now)
    .replaceAll(".", "");
}

function availableRoutineDays(routine: HomeRoutine) {
  return [...routine.days]
    .filter((day) => day.exercises.length > 0)
    .sort((left, right) => left.position - right.position);
}

export function hasDeterministicSchedule(routine: HomeRoutine) {
  const days = availableRoutineDays(routine);
  return days.length > 0 && days.every((day) => day.weekday !== null);
}

export function resolveTodaysRoutineDay(
  routine: HomeRoutine,
  now: Date,
  timeZone: string,
) {
  if (!hasDeterministicSchedule(routine)) return null;
  const weekday = getLocalWeekday(now, timeZone);
  return (
    availableRoutineDays(routine).find((day) => day.weekday === weekday) ?? null
  );
}

export function resolveNextRoutineDay(
  routine: HomeRoutine,
  now: Date,
  timeZone: string,
): NextRoutineDay | null {
  if (!hasDeterministicSchedule(routine)) return null;

  const today = getLocalWeekday(now, timeZone);
  const days = availableRoutineDays(routine);

  for (let daysUntil = 1; daysUntil <= 7; daysUntil += 1) {
    const weekday = (today + daysUntil) % 7;
    const day = days.find((candidate) => candidate.weekday === weekday);
    if (day) return { day, daysUntil };
  }

  return null;
}

function latestCompletedToday(
  sessions: readonly HomeWorkoutSession[],
  now: Date,
  timeZone: string,
) {
  const today = getLocalDateKey(now, timeZone);
  return [...sessions]
    .filter(
      (session) =>
        session.status === "completed" &&
        session.completedAt !== null &&
        getLocalDateKey(session.completedAt, timeZone) === today,
    )
    .sort(
      (left, right) =>
        Date.parse(right.completedAt ?? "") -
        Date.parse(left.completedAt ?? ""),
    )[0];
}

export function deriveHomeState(
  input: DeriveHomeStateInput,
  now: Date,
  timeZone: string,
): HomeState {
  if (input.activeSession?.status === "in_progress") {
    return { kind: "training", session: input.activeSession };
  }

  const completedToday = latestCompletedToday(
    input.completedSessions,
    now,
    timeZone,
  );
  if (completedToday) {
    return {
      kind: "completed",
      session: completedToday,
      nextRoutineDay: input.activeRoutine
        ? resolveNextRoutineDay(input.activeRoutine, now, timeZone)
        : null,
    };
  }

  if (!input.activeRoutine) {
    return { kind: "no-routine", reason: "missing", routineId: null };
  }

  const days = availableRoutineDays(input.activeRoutine);
  if (days.length === 0) {
    return {
      kind: "no-routine",
      reason: "empty",
      routineId: input.activeRoutine.id,
    };
  }

  const today = resolveTodaysRoutineDay(input.activeRoutine, now, timeZone);
  if (!hasDeterministicSchedule(input.activeRoutine)) {
    return {
      kind: "ready",
      routine: input.activeRoutine,
      days,
      schedule: "manual",
      suggestedDayId: days[0].id,
    };
  }

  if (today) {
    return {
      kind: "ready",
      routine: input.activeRoutine,
      days,
      schedule: "scheduled",
      suggestedDayId: today.id,
    };
  }

  const nextRoutineDay = resolveNextRoutineDay(
    input.activeRoutine,
    now,
    timeZone,
  );
  if (!nextRoutineDay) {
    return {
      kind: "ready",
      routine: input.activeRoutine,
      days,
      schedule: "manual",
      suggestedDayId: days[0].id,
    };
  }

  return { kind: "rest", routine: input.activeRoutine, nextRoutineDay };
}

export function buildWeeklySummary(
  sessions: readonly HomeWorkoutSession[],
  now: Date,
  timeZone: string,
): WeeklySummary {
  const range = getLocalWeekRange(now, timeZone);
  const start = Date.parse(range.start);
  const end = Date.parse(range.end);
  return {
    completedCount: sessions.filter((session) => {
      if (session.status !== "completed" || !session.completedAt) return false;
      const completedAt = Date.parse(session.completedAt);
      return completedAt >= start && completedAt < end;
    }).length,
  };
}

export function getDayMuscleGroups(day: HomeRoutineDay) {
  return [
    ...new Set(
      day.exercises.flatMap((exercise) => exercise.primaryMuscleGroups),
    ),
  ].slice(0, 3);
}

export function getSessionDurationSeconds(
  session: HomeWorkoutSession,
  now: number,
) {
  const end = session.completedAt ? Date.parse(session.completedAt) : now;
  return Math.max(0, Math.floor((end - Date.parse(session.startedAt)) / 1000));
}

export function formatLiveDuration(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours === 0) {
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }
  return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function getSessionSetCount(session: HomeWorkoutSession) {
  return session.exercises.reduce(
    (total, exercise) => total + exercise.sets.length,
    0,
  );
}

export function getCurrentExerciseProgress(session: HomeWorkoutSession) {
  const exercise =
    session.exercises.find(
      (candidate) => candidate.id === session.activeWorkoutExerciseId,
    ) ?? session.exercises[0];
  if (!exercise) return null;

  const completedSetNumbers = new Set(
    exercise.sets.map((set) => set.setNumber),
  );
  let currentSet = exercise.targetSets;
  for (let setNumber = 1; setNumber <= exercise.targetSets; setNumber += 1) {
    if (!completedSetNumbers.has(setNumber)) {
      currentSet = setNumber;
      break;
    }
  }

  return { exercise, currentSet };
}

function comparablePreviousSet(
  sets: readonly HomeSessionExercise["sets"][number][] | undefined,
  setNumber: number,
) {
  return sets?.find((set) => set.setNumber === setNumber) ?? sets?.at(-1);
}

export function findFactualImprovement(
  session: HomeWorkoutSession,
  previous: HomePreviousPerformances,
): HomeImprovement | null {
  for (const exercise of [...session.exercises].sort(
    (left, right) => left.position - right.position,
  )) {
    for (const set of [...exercise.sets].sort(
      (left, right) => left.setNumber - right.setNumber,
    )) {
      const cue = compareFactualProgress(
        set,
        comparablePreviousSet(previous[exercise.exerciseId], set.setNumber),
      );
      if (cue) return { exerciseName: exercise.exerciseName, label: cue.label };
    }
  }
  return null;
}

export function selectBroCue(
  state: HomeState,
  improvement: HomeImprovement | null,
  previousPerformance: HomePreviousPerformance | null,
  weeklySummary: WeeklySummary,
): HomeBroCue | null {
  if (state.kind === "training" || state.kind === "no-routine") return null;

  if (improvement) {
    return {
      kind: "progress",
      eyebrow: "Progreso reciente",
      text: `${improvement.exerciseName} · ${improvement.label}`,
    };
  }

  if (state.kind === "ready" && previousPerformance) {
    return {
      kind: "memory",
      eyebrow: "La última vez",
      text: `${previousPerformance.exerciseName} · ${formatWeight(previousPerformance.set.weightKg)} × ${previousPerformance.set.repetitions}`,
    };
  }

  if (weeklySummary.completedCount > 0) {
    const noun =
      weeklySummary.completedCount === 1 ? "entrenamiento" : "entrenamientos";
    return {
      kind: "weekly",
      eyebrow: "Tu semana",
      text: `${weeklySummary.completedCount} ${noun} esta semana`,
    };
  }

  return null;
}

export function formatNextRoutineDay(next: NextRoutineDay) {
  if (next.daysUntil === 1) return `${next.day.name} · mañana`;
  return `${next.day.name} · en ${next.daysUntil} días`;
}
