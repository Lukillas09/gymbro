import type { Database } from "@/types/database.generated";

export type BiologicalSex = Database["public"]["Enums"]["biological_sex"];
export type TrainingGoal = Database["public"]["Enums"]["training_goal"];
export type TrainingLevel = Database["public"]["Enums"]["training_level"];
export type WeightUnit = Database["public"]["Enums"]["weight_unit"];

export const BIOLOGICAL_SEX_OPTIONS = [
  { value: "female", label: "Mujer" },
  { value: "male", label: "Hombre" },
  { value: "intersex", label: "Intersexual" },
  { value: "prefer_not_to_say", label: "Prefiero no decirlo" },
] as const satisfies ReadonlyArray<{
  value: BiologicalSex;
  label: string;
}>;

export const TRAINING_GOAL_OPTIONS = [
  { value: "strength", label: "Fuerza" },
  { value: "muscle_gain", label: "Hipertrofia" },
  { value: "general_fitness", label: "Estado físico general" },
] as const satisfies ReadonlyArray<{ value: TrainingGoal; label: string }>;

export const TRAINING_LEVEL_OPTIONS = [
  { value: "beginner", label: "Principiante" },
  { value: "intermediate", label: "Intermedio" },
  { value: "advanced", label: "Avanzado" },
] as const satisfies ReadonlyArray<{ value: TrainingLevel; label: string }>;

export const WEIGHT_UNIT_OPTIONS = [
  { value: "kg", label: "Kilogramos (kg)" },
  { value: "lb", label: "Libras (lb)" },
] as const satisfies ReadonlyArray<{ value: WeightUnit; label: string }>;

export const MINIMUM_PASSWORD_LENGTH = 8;

export function getOptionLabel<T extends string>(
  options: ReadonlyArray<Readonly<{ value: T; label: string }>>,
  value: T | null,
) {
  return options.find((option) => option.value === value)?.label ?? null;
}
