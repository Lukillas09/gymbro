import {
  compareFactualProgress,
  formatDuration,
  getComparablePreviousSet,
  getWorkoutDurationSeconds,
} from "@/features/workouts/domain";
import type {
  PreviousExercisePerformance,
  WorkoutExercise,
  WorkoutSession,
  WorkoutSetType,
} from "@/features/workouts/types";
import { isUuid } from "@/features/workouts/validation";
import {
  APP_TIME_ZONE,
  formatLocalDate,
  getLocalDateKey,
} from "@/lib/date-time";
import type {
  CompletedWorkoutSession,
  HistoricalExerciseResult,
  HistoryCursor,
  HistoryListItem,
  HistoryMonthGroup,
  HistoryPage,
} from "./types";

export const HISTORY_PAGE_SIZE = 20;

export function encodeHistoryCursor(cursor: HistoryCursor) {
  return `${new Date(cursor.completedAt).toISOString()}|${cursor.id}`;
}

export function parseHistoryCursor(value: string): HistoryCursor | null {
  const separator = value.lastIndexOf("|");
  if (separator <= 0) return null;

  const completedAt = value.slice(0, separator);
  const id = value.slice(separator + 1);
  const timestamp = Date.parse(completedAt);
  if (Number.isNaN(timestamp) || !isUuid(id)) return null;

  return { completedAt: new Date(timestamp).toISOString(), id };
}

export function paginateHistoryItems(
  rows: readonly HistoryListItem[],
  pageSize = HISTORY_PAGE_SIZE,
): HistoryPage {
  const items = rows.slice(0, pageSize);
  const lastItem = items.at(-1);
  return {
    items,
    nextCursor:
      rows.length > pageSize && lastItem
        ? encodeHistoryCursor({
            completedAt: lastItem.completedAt,
            id: lastItem.id,
          })
        : null,
  };
}

export function groupHistoryByMonth(
  items: readonly HistoryListItem[],
  timeZone = APP_TIME_ZONE,
): readonly HistoryMonthGroup[] {
  const groups = new Map<string, HistoryListItem[]>();

  for (const item of items) {
    const key = getLocalDateKey(item.completedAt, timeZone).slice(0, 7);
    const existing = groups.get(key);
    if (existing) existing.push(item);
    else groups.set(key, [item]);
  }

  return [...groups].map(([key, monthItems]) => ({
    key,
    label: formatLocalDate(monthItems[0].completedAt, timeZone, {
      month: "long",
      year: "numeric",
    }).toLocaleUpperCase("es-AR"),
    items: monthItems,
  }));
}

export function getCompletedSetCount(
  exercises: readonly Readonly<{ sets: readonly unknown[] }>[],
) {
  return exercises.reduce((total, exercise) => total + exercise.sets.length, 0);
}

export function getPrimaryMuscleSummary(
  exercises: readonly Pick<WorkoutExercise, "primaryMuscleGroups">[],
  limit = 3,
) {
  return [
    ...new Set(exercises.flatMap((exercise) => exercise.primaryMuscleGroups)),
  ].slice(0, limit);
}

export function getHistoricalExerciseResult(
  exercise: WorkoutExercise,
  previous: PreviousExercisePerformance | undefined,
): HistoricalExerciseResult {
  let improvement: string | null = null;

  for (const set of exercise.sets) {
    const cue = compareFactualProgress(
      set,
      getComparablePreviousSet(previous, set.setNumber),
    );
    if (cue) {
      improvement = cue.label;
      break;
    }
  }

  return { exercise, improvement };
}

export function asCompletedWorkoutSession(
  session: WorkoutSession,
): CompletedWorkoutSession | null {
  if (session.status !== "completed" || !session.completedAt) return null;
  return { ...session, status: "completed", completedAt: session.completedAt };
}

export function getHistoryDurationSeconds(
  startedAt: string,
  completedAt: string,
) {
  return getWorkoutDurationSeconds(startedAt, completedAt);
}

export function formatHistoryDuration(startedAt: string, completedAt: string) {
  return formatDuration(getHistoryDurationSeconds(startedAt, completedAt));
}

export function formatHistoryListDate(
  completedAt: string,
  timeZone = APP_TIME_ZONE,
) {
  return formatLocalDate(completedAt, timeZone, {
    day: "numeric",
    month: "short",
  }).toLocaleUpperCase("es-AR");
}

export function formatHistoryDetailDate(
  completedAt: string,
  timeZone = APP_TIME_ZONE,
) {
  return formatLocalDate(completedAt, timeZone, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatHistoryTime(
  completedAt: string,
  timeZone = APP_TIME_ZONE,
) {
  return formatLocalDate(completedAt, timeZone, {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
}

export function getSetTypeLabel(setType: WorkoutSetType) {
  const labels: Partial<Record<WorkoutSetType, string>> = {
    warmup: "Entrada en calor",
    backoff: "Back-off",
    dropset: "Drop set",
  };
  return labels[setType] ?? null;
}
