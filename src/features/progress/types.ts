import type { ProgressCue } from "@/features/workouts/types";

export type ProgressSourceSet = Readonly<{
  id: string;
  setNumber: number;
  weightKg: number;
  repetitions: number;
  completedAt: string;
}>;

export type ProgressSourceExercise = Readonly<{
  exerciseId: string;
  exerciseName: string;
  sets: readonly ProgressSourceSet[];
}>;

export type ProgressSourceSession = Readonly<{
  id: string;
  completedAt: string;
  exercises: readonly ProgressSourceExercise[];
}>;

export type ProgressExerciseCatalogItem = Readonly<{
  exerciseId: string;
  exerciseName: string;
  lastPerformedAt: string;
}>;

export type ProgressPeriod = Readonly<{
  current: Readonly<{ start: string; end: string }>;
  previous: Readonly<{ start: string; end: string }>;
  weeks: readonly Readonly<{ start: string; end: string }>[];
}>;

export type ExercisePerformance = Readonly<{
  sessionId: string;
  completedAt: string;
  representativeSet: ProgressSourceSet;
}>;

export type ProgressExerciseItem = Readonly<{
  exerciseId: string;
  exerciseName: string;
  lastPerformedAt: string;
  latest: ExercisePerformance | null;
  previous: ExercisePerformance | null;
  periodBest: ProgressSourceSet | null;
  improvement: ProgressCue | null;
}>;

export type ProgressOverview = Readonly<{
  currentSessionCount: number;
  previousSessionCount: number;
  frequencyDelta: number;
  weeklySessionCounts: readonly number[];
  exercises: readonly ProgressExerciseItem[];
  improvements: readonly ProgressExerciseItem[];
}>;

export type WeightPersonalRecord = Readonly<{
  sessionId: string;
  completedAt: string;
  set: ProgressSourceSet;
}>;

export type ExerciseProgressDetail = Readonly<{
  exerciseId: string;
  exerciseName: string;
  sessionCount: number;
  latest: ExercisePerformance;
  personalRecord: WeightPersonalRecord | null;
  performances: readonly (ExercisePerformance & {
    comparison: ProgressCue | null;
  })[];
  hasMore: boolean;
}>;
