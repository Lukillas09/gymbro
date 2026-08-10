import type { WorkoutStatus } from "@/features/workouts/types";

export type HomeStateKind =
  "no-routine" | "ready" | "training" | "completed" | "rest";

export type HomeWorkoutSet = Readonly<{
  setNumber: number;
  weightKg: number;
  repetitions: number;
  completedAt: string;
}>;

export type HomeSessionExercise = Readonly<{
  id: string;
  exerciseId: string;
  exerciseName: string;
  position: number;
  targetSets: number;
  sets: readonly HomeWorkoutSet[];
}>;

export type HomeWorkoutSession = Readonly<{
  id: string;
  routineDayId: string | null;
  routineName: string;
  dayName: string;
  startedAt: string;
  completedAt: string | null;
  status: WorkoutStatus;
  activeWorkoutExerciseId: string | null;
  exercises: readonly HomeSessionExercise[];
}>;

export type HomeRoutineExercise = Readonly<{
  exerciseId: string;
  exerciseName: string;
  position: number;
  primaryMuscleGroups: readonly string[];
}>;

export type HomeRoutineDay = Readonly<{
  id: string;
  name: string;
  position: number;
  weekday: number | null;
  exercises: readonly HomeRoutineExercise[];
}>;

export type HomeRoutine = Readonly<{
  id: string;
  name: string;
  days: readonly HomeRoutineDay[];
}>;

export type NextRoutineDay = Readonly<{
  day: HomeRoutineDay;
  daysUntil: number;
}>;

export type HomeState =
  | Readonly<{
      kind: "no-routine";
      reason: "missing" | "empty";
      routineId: string | null;
    }>
  | Readonly<{
      kind: "ready";
      routine: HomeRoutine;
      days: readonly HomeRoutineDay[];
      schedule: "scheduled" | "manual";
      suggestedDayId: string;
    }>
  | Readonly<{
      kind: "training";
      session: HomeWorkoutSession;
    }>
  | Readonly<{
      kind: "completed";
      session: HomeWorkoutSession;
      nextRoutineDay: NextRoutineDay | null;
    }>
  | Readonly<{
      kind: "rest";
      routine: HomeRoutine;
      nextRoutineDay: NextRoutineDay;
    }>;

export type WeeklySummary = Readonly<{
  completedCount: number;
}>;

export type HomePreviousPerformance = Readonly<{
  exerciseName: string;
  set: HomeWorkoutSet;
}>;

export type HomePreviousPerformances = Readonly<
  Record<string, readonly HomeWorkoutSet[] | undefined>
>;

export type HomeImprovement = Readonly<{
  exerciseName: string;
  label: string;
}>;

export type HomeBroCue = Readonly<{
  kind: "progress" | "memory" | "weekly";
  eyebrow: string;
  text: string;
}>;

export type HomePageModel = Readonly<{
  firstName: string;
  dateLabel: string;
  generatedAt: string;
  timeZone: string;
  state: HomeState;
  broCue: HomeBroCue | null;
  weeklySummary: WeeklySummary;
}>;

export type DeriveHomeStateInput = Readonly<{
  activeSession: HomeWorkoutSession | null;
  activeRoutine: HomeRoutine | null;
  completedSessions: readonly HomeWorkoutSession[];
}>;
