import type {
  ExerciseDifficulty,
  MovementPattern,
  MuscleInvolvement,
} from "./constants";

export type MuscleGroupSummary = Readonly<{
  id: string;
  name: string;
  slug: string;
}>;

export type MuscleSummary = Readonly<{
  id: string;
  name: string;
  slug: string;
  group: MuscleGroupSummary;
}>;

export type ExerciseMuscle = Readonly<{
  involvement: MuscleInvolvement;
  muscle: MuscleSummary;
}>;

export type EquipmentSummary = Readonly<{
  id: string;
  name: string;
  slug: string;
  position: number;
}>;

export type ExerciseCatalogItem = Readonly<{
  id: string;
  name: string;
  slug: string;
  description: string;
  difficulty: ExerciseDifficulty;
  movementPattern: MovementPattern;
  instructions: readonly string[];
  commonMistakes: readonly string[];
  muscles: readonly ExerciseMuscle[];
  equipment: readonly EquipmentSummary[];
}>;

export type ExerciseFilters = Readonly<{
  query: string;
  muscleGroup: string;
  muscle: string;
  equipment: string;
}>;

export type MuscleFilterOption = Readonly<{
  name: string;
  slug: string;
  groupSlug: string;
}>;

export type ExerciseFilterOptions = Readonly<{
  muscleGroups: readonly MuscleGroupSummary[];
  muscles: readonly MuscleFilterOption[];
  equipment: readonly Omit<EquipmentSummary, "position">[];
}>;

export type GroupedExerciseMuscles = Readonly<{
  group: MuscleGroupSummary;
  muscles: readonly ExerciseMuscle[];
}>;
