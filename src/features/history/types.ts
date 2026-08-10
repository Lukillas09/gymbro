import type {
  PreviousPerformanceByExercise,
  WorkoutExercise,
  WorkoutSession,
} from "@/features/workouts/types";

export type HistoryCursor = Readonly<{
  completedAt: string;
  id: string;
}>;

export type HistoryListItem = Readonly<{
  id: string;
  routineName: string;
  dayName: string;
  startedAt: string;
  completedAt: string;
  completedSetCount: number;
  primaryMuscleGroups: readonly string[];
}>;

export type HistoryPage = Readonly<{
  items: readonly HistoryListItem[];
  nextCursor: string | null;
}>;

export type HistoryMonthGroup = Readonly<{
  key: string;
  label: string;
  items: readonly HistoryListItem[];
}>;

export type CompletedWorkoutSession = Omit<
  WorkoutSession,
  "completedAt" | "status"
> &
  Readonly<{
    completedAt: string;
    status: "completed";
  }>;

export type HistoricalExerciseResult = Readonly<{
  exercise: WorkoutExercise;
  improvement: string | null;
}>;

export type CompletedWorkoutHistory = Readonly<{
  session: CompletedWorkoutSession;
  previousByExercise: PreviousPerformanceByExercise;
}>;

export type LoadHistoryResult =
  | Readonly<{ ok: true; page: HistoryPage }>
  | Readonly<{ ok: false; message: string }>;
