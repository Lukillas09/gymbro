import {
  APP_TIME_ZONE,
  formatLocalDate,
  getLocalDateKey,
} from "@/lib/date-time";
import type { ProfileActivity, ProfileMetric } from "./types";

export function getProfileInitials(displayName: string, username: string) {
  const source = displayName.trim() || username.trim();
  const words = source.split(/\s+/).filter(Boolean);

  if (words.length > 1) {
    return `${Array.from(words[0])[0] ?? ""}${Array.from(words.at(-1) ?? "")[0] ?? ""}`.toLocaleUpperCase(
      "es-AR",
    );
  }

  return Array.from(words[0] ?? "GB")
    .slice(0, 2)
    .join("")
    .toLocaleUpperCase("es-AR");
}

export function buildProfileMetrics(
  totalCompletedWorkouts: number,
  recentCompletedWorkouts: number,
  activeWeekCount: number,
): readonly ProfileMetric[] {
  if (totalCompletedWorkouts <= 0) return [];

  const metrics: ProfileMetric[] = [
    {
      value: totalCompletedWorkouts,
      label: totalCompletedWorkouts === 1 ? "Entreno" : "Entrenos",
    },
  ];

  if (recentCompletedWorkouts >= 2) {
    metrics.push({
      value: recentCompletedWorkouts,
      label: "Últimos 28 días",
    });
  }

  if (activeWeekCount >= 2) {
    metrics.push({ value: activeWeekCount, label: "Semanas activas" });
  }

  return metrics.slice(0, 3);
}

export function countActiveWeeks(
  completedAtValues: readonly string[],
  timeZone = APP_TIME_ZONE,
) {
  const weekKeys = new Set<string>();

  for (const completedAt of completedAtValues) {
    const dateKey = getLocalDateKey(completedAt, timeZone);
    const date = new Date(`${dateKey}T00:00:00.000Z`);
    const daysSinceMonday = (date.getUTCDay() + 6) % 7;
    date.setUTCDate(date.getUTCDate() - daysSinceMonday);
    weekKeys.add(date.toISOString().slice(0, 10));
  }

  return weekKeys.size;
}

export function getRecentMuscleGroups(
  activities: readonly ProfileActivity[],
  limit = 3,
) {
  if (activities.length < 2) return [];

  const appearances = new Map<string, number>();
  for (const activity of activities) {
    for (const muscleGroup of new Set(activity.primaryMuscleGroups)) {
      appearances.set(muscleGroup, (appearances.get(muscleGroup) ?? 0) + 1);
    }
  }

  return [...appearances.entries()]
    .filter(([, count]) => count >= 2)
    .sort(
      ([leftName, leftCount], [rightName, rightCount]) =>
        rightCount - leftCount || leftName.localeCompare(rightName, "es"),
    )
    .slice(0, limit)
    .map(([name]) => name);
}

export function getLatestRecordedExercise(
  activities: readonly ProfileActivity[],
) {
  for (const activity of activities) {
    const exercise = activity.exercises.find(({ hasValidSet }) => hasValidSet);
    if (exercise) return exercise;
  }

  return null;
}

export function formatProfileActivityDate(
  completedAt: string,
  timeZone = APP_TIME_ZONE,
) {
  return formatLocalDate(completedAt, timeZone, {
    day: "numeric",
    month: "short",
  }).toLocaleUpperCase("es-AR");
}
