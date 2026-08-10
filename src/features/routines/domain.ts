import type {
  MuscleSummaryItem,
  RoutineDay,
  RoutineDetail,
  RoutineStatus,
} from "./types";

export type MoveDirection = "up" | "down";

export function getRoutineStatus(
  routine: Pick<RoutineDetail, "archivedAt" | "isActive">,
): RoutineStatus {
  if (routine.archivedAt) return "archived";
  return routine.isActive ? "active" : "inactive";
}

export function getDuplicatedDayName(name: string) {
  const suffix = " copia";
  return `${name.slice(0, 100 - suffix.length)}${suffix}`;
}

export function duplicateDayTemplate(day: RoutineDay, nextPosition: number) {
  return {
    ...day,
    id: "",
    name: getDuplicatedDayName(day.name),
    position: nextPosition,
    weekday: null,
    exercises: day.exercises.map((exercise) => ({
      ...exercise,
      id: "",
    })),
  } satisfies RoutineDay;
}

export function moveOrderedId(
  orderedIds: readonly string[],
  targetId: string,
  direction: MoveDirection,
) {
  const currentIndex = orderedIds.indexOf(targetId);
  const nextIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

  if (currentIndex === -1 || nextIndex < 0 || nextIndex >= orderedIds.length) {
    return [...orderedIds];
  }

  const reordered = [...orderedIds];
  [reordered[currentIndex], reordered[nextIndex]] = [
    reordered[nextIndex],
    reordered[currentIndex],
  ];
  return reordered;
}

export function calculatePrimaryMuscleSummary(
  days: readonly RoutineDay[],
): readonly MuscleSummaryItem[] {
  const summary = new Map<string, MuscleSummaryItem>();

  for (const day of days) {
    for (const prescription of day.exercises) {
      const primaryGroups = new Map(
        prescription.exercise.muscles
          .filter(({ involvement }) => involvement === "primary")
          .map(({ muscle }) => [muscle.group.id, muscle.group]),
      );

      for (const group of primaryGroups.values()) {
        const current = summary.get(group.id);
        summary.set(group.id, {
          groupId: group.id,
          groupName: group.name,
          groupSlug: group.slug,
          primarySets: (current?.primarySets ?? 0) + prescription.targetSets,
          prescriptionCount: (current?.prescriptionCount ?? 0) + 1,
        });
      }
    }
  }

  return [...summary.values()].sort(
    (left, right) =>
      right.primarySets - left.primarySets ||
      left.groupName.localeCompare(right.groupName, "es"),
  );
}

export function formatRestTime(seconds: number) {
  if (seconds === 0) return "Sin descanso";
  if (seconds < 60) return `${seconds} s`;
  if (seconds % 60 === 0) return `${seconds / 60} min`;
  return `${Math.floor(seconds / 60)} min ${seconds % 60} s`;
}

export function formatPrescription(
  prescription: Pick<
    RoutineDay["exercises"][number],
    "targetRepsMax" | "targetRepsMin" | "targetSets"
  >,
) {
  const reps =
    prescription.targetRepsMin === prescription.targetRepsMax
      ? `${prescription.targetRepsMin}`
      : `${prescription.targetRepsMin}–${prescription.targetRepsMax}`;
  return `${prescription.targetSets} × ${reps}`;
}
