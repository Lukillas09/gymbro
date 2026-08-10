import {
  compareFactualProgress,
  formatWeight,
} from "@/features/workouts/domain";
import {
  formatLocalDate,
  getLocalDateKey,
  getLocalDayRange,
  getLocalWeekday,
  getLocalWeekRange,
} from "@/lib/date-time";
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

export function formatHomeDate(now: Date, timeZone: string) {
  return formatLocalDate(now, timeZone, {
    weekday: "long",
    day: "numeric",
    month: "short",
  });
}

export {
  getLocalDateKey,
  getLocalDayRange,
  getLocalWeekday,
  getLocalWeekRange,
};

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
