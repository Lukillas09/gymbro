import type { Database } from "@/types/database.generated";

export type TrainingGoal = Database["public"]["Enums"]["training_goal"];
export type MuscleInvolvement =
  Database["public"]["Enums"]["muscle_involvement"];

export type RoutineMuscleRelation = Readonly<{
  involvement: MuscleInvolvement;
  muscle: Readonly<{
    id: string;
    name: string;
    slug: string;
    group: Readonly<{
      id: string;
      name: string;
      slug: string;
    }>;
  }>;
}>;

export type RoutineExercisePrescription = Readonly<{
  id: string;
  updatedAt: string;
  position: number;
  targetSets: number;
  targetRepsMin: number;
  targetRepsMax: number;
  restSeconds: number;
  targetRir: number | null;
  notes: string | null;
  exercise: Readonly<{
    id: string;
    name: string;
    slug: string;
    muscles: readonly RoutineMuscleRelation[];
  }>;
}>;

export type RoutineDay = Readonly<{
  id: string;
  updatedAt: string;
  name: string;
  position: number;
  weekday: number | null;
  exercises: readonly RoutineExercisePrescription[];
}>;

export type RoutineDetail = Readonly<{
  id: string;
  name: string;
  description: string | null;
  goal: TrainingGoal;
  isActive: boolean;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
  days: readonly RoutineDay[];
}>;

export type RoutineListItem = Readonly<{
  id: string;
  name: string;
  goal: TrainingGoal;
  isActive: boolean;
  archivedAt: string | null;
  updatedAt: string;
  dayCount: number;
  exerciseCount: number;
}>;

export type MuscleSummaryItem = Readonly<{
  groupId: string;
  groupName: string;
  groupSlug: string;
  primarySets: number;
  prescriptionCount: number;
}>;

export type RoutineStatus = "active" | "inactive" | "archived";
