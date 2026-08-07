import type {
  ExerciseCatalogItem,
  ExerciseFilterOptions,
  ExerciseFilters,
  GroupedExerciseMuscles,
} from "./types";

export const emptyExerciseFilters: ExerciseFilters = {
  query: "",
  muscleGroup: "",
  muscle: "",
  equipment: "",
};

const involvementOrder = {
  primary: 0,
  secondary: 1,
  stabilizer: 2,
} as const;

function normalizeSlug(value: string | null) {
  const normalized = value?.trim().toLowerCase() ?? "";
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(normalized) ? normalized : "";
}

export function normalizeSearch(value: string) {
  return value
    .trim()
    .replace(/\s+/g, " ")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("es");
}

export function parseExerciseFilters(searchParams: URLSearchParams) {
  return {
    query: searchParams.get("q")?.trim().replace(/\s+/g, " ") ?? "",
    muscleGroup: normalizeSlug(searchParams.get("group")),
    muscle: normalizeSlug(searchParams.get("muscle")),
    equipment: normalizeSlug(searchParams.get("equipment")),
  } satisfies ExerciseFilters;
}

export function serializeExerciseFilters(filters: ExerciseFilters) {
  const searchParams = new URLSearchParams();

  if (filters.query) searchParams.set("q", filters.query);
  if (filters.muscleGroup) searchParams.set("group", filters.muscleGroup);
  if (filters.muscle) searchParams.set("muscle", filters.muscle);
  if (filters.equipment) searchParams.set("equipment", filters.equipment);

  return searchParams.toString();
}

export function filterExercises(
  exercises: readonly ExerciseCatalogItem[],
  filters: ExerciseFilters,
) {
  const query = normalizeSearch(filters.query);

  return exercises.filter((exercise) => {
    if (query && !normalizeSearch(exercise.name).includes(query)) return false;

    if (
      filters.muscleGroup &&
      !exercise.muscles.some(
        ({ muscle }) => muscle.group.slug === filters.muscleGroup,
      )
    ) {
      return false;
    }

    if (
      filters.muscle &&
      !exercise.muscles.some(({ muscle }) => muscle.slug === filters.muscle)
    ) {
      return false;
    }

    if (
      filters.equipment &&
      !exercise.equipment.some(({ slug }) => slug === filters.equipment)
    ) {
      return false;
    }

    return true;
  });
}

export function getExerciseFilterOptions(
  exercises: readonly ExerciseCatalogItem[],
): ExerciseFilterOptions {
  const groups = new Map<
    string,
    ExerciseFilterOptions["muscleGroups"][number]
  >();
  const muscles = new Map<string, ExerciseFilterOptions["muscles"][number]>();
  const equipment = new Map<
    string,
    ExerciseFilterOptions["equipment"][number]
  >();

  for (const exercise of exercises) {
    for (const relation of exercise.muscles) {
      groups.set(relation.muscle.group.slug, relation.muscle.group);
      muscles.set(relation.muscle.slug, {
        name: relation.muscle.name,
        slug: relation.muscle.slug,
        groupSlug: relation.muscle.group.slug,
      });
    }

    for (const item of exercise.equipment) {
      equipment.set(item.slug, {
        id: item.id,
        name: item.name,
        slug: item.slug,
      });
    }
  }

  const byName = <T extends { name: string }>(left: T, right: T) =>
    left.name.localeCompare(right.name, "es");

  return {
    muscleGroups: [...groups.values()].sort(byName),
    muscles: [...muscles.values()].sort(byName),
    equipment: [...equipment.values()].sort(byName),
  };
}

export function getPrimaryMuscles(exercise: ExerciseCatalogItem) {
  return exercise.muscles.filter(
    ({ involvement }) => involvement === "primary",
  );
}

export function getPrimaryMuscleLabel(exercise: ExerciseCatalogItem) {
  const primary = getPrimaryMuscles(exercise);

  if (primary.length === 0) return "Sin músculo principal";

  const groupNames = [
    ...new Set(primary.map(({ muscle }) => muscle.group.name)),
  ];
  const muscleNames = primary.map(({ muscle }) => muscle.name);

  return `${groupNames.join(" · ")} · ${muscleNames.join(", ")}`;
}

export function getEquipmentLabel(exercise: ExerciseCatalogItem) {
  const [first, ...rest] = exercise.equipment;

  if (!first) return "Sin equipamiento";
  return rest.length === 0 ? first.name : `${first.name} +${rest.length}`;
}

export function groupExerciseMuscles(
  exercise: ExerciseCatalogItem,
): readonly GroupedExerciseMuscles[] {
  const groups = new Map<string, GroupedExerciseMuscles>();

  for (const relation of exercise.muscles) {
    const existing = groups.get(relation.muscle.group.slug);

    if (existing) {
      groups.set(relation.muscle.group.slug, {
        ...existing,
        muscles: [...existing.muscles, relation],
      });
    } else {
      groups.set(relation.muscle.group.slug, {
        group: relation.muscle.group,
        muscles: [relation],
      });
    }
  }

  return [...groups.values()]
    .map((group) => ({
      ...group,
      muscles: [...group.muscles].sort(
        (left, right) =>
          involvementOrder[left.involvement] -
            involvementOrder[right.involvement] ||
          left.muscle.name.localeCompare(right.muscle.name, "es"),
      ),
    }))
    .sort((left, right) => {
      const leftPrimary = left.muscles.some(
        ({ involvement }) => involvement === "primary",
      );
      const rightPrimary = right.muscles.some(
        ({ involvement }) => involvement === "primary",
      );

      return (
        Number(rightPrimary) - Number(leftPrimary) ||
        left.group.name.localeCompare(right.group.name, "es")
      );
    });
}
