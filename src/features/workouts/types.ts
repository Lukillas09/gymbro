import type { Database } from "@/types/database.generated";

export type WorkoutStatus = Database["public"]["Enums"]["workout_status"];
export type WorkoutSetType = Database["public"]["Enums"]["workout_set_type"];

export type WorkoutSet = Readonly<{
  id: string;
  setNumber: number;
  weightKg: number;
  repetitions: number;
  rir: number | null;
  setType: WorkoutSetType;
  completedAt: string;
}>;

export type WorkoutExercise = Readonly<{
  id: string;
  exerciseId: string;
  exerciseName: string;
  exerciseSlug: string;
  position: number;
  targetSets: number;
  targetRepsMin: number;
  targetRepsMax: number;
  restSeconds: number;
  targetRir: number | null;
  notes: string | null;
  primaryMuscleGroups: readonly string[];
  sets: readonly WorkoutSet[];
}>;

export type WorkoutSession = Readonly<{
  id: string;
  routineDayId: string | null;
  routineName: string;
  dayName: string;
  startedAt: string;
  completedAt: string | null;
  status: WorkoutStatus;
  activeWorkoutExerciseId: string | null;
  restEndsAt: string | null;
  exercises: readonly WorkoutExercise[];
}>;

export type PreviousExercisePerformance = Readonly<{
  completedAt: string;
  sets: readonly WorkoutSet[];
}>;

export type PreviousPerformanceByExercise = Readonly<
  Record<string, PreviousExercisePerformance | undefined>
>;

export type WorkoutDayOption = Readonly<{
  id: string;
  name: string;
  position: number;
  weekday: number | null;
  exerciseCount: number;
}>;

export type WorkoutLandingState =
  | Readonly<{ kind: "active"; sessionId: string }>
  | Readonly<{ kind: "no-routine" }>
  | Readonly<{
      kind: "ready";
      routineId: string;
      routineName: string;
      suggestedDayId: string | null;
      days: readonly WorkoutDayOption[];
    }>;

export type TrainingState = "setup" | "live" | "resting" | "completed";

export type SetPrefill = Readonly<{
  weightKg: number | null;
  repetitions: number;
  source: "current-session" | "previous-session" | "prescription";
}>;

export type ProgressCue = Readonly<{
  label: string;
  kind: "repetitions" | "weight";
}>;

export type WorkoutSummary = Readonly<{
  durationSeconds: number;
  completedSetCount: number;
  primaryMuscleGroups: readonly string[];
  improvements: readonly Readonly<{
    exerciseName: string;
    label: string;
  }>[];
}>;

export type CompleteSetInput = Readonly<{
  workoutExerciseId: string;
  setNumber: number;
  weightKg: string;
  repetitions: string;
}>;

export type CompleteSetResult = Readonly<{
  set: WorkoutSet;
  inserted: boolean;
  restEndsAt: string | null;
  activeWorkoutExerciseId: string;
}>;

export type WorkoutMutationResult<Value = undefined> =
  | Readonly<{ ok: true; value: Value }>
  | Readonly<{ ok: false; message: string }>;
