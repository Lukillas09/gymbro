import type {
  CompletedWorkoutHistory,
  HistoryListItem,
} from "@/features/history/types";
import { previousPerformanceFixture, workoutSessionFixture } from "./workouts";

const completedSets = [
  {
    id: "77777777-7777-4777-8777-777777777771",
    setNumber: 1,
    weightKg: 40,
    repetitions: 10,
    rir: 4,
    setType: "warmup" as const,
    completedAt: "2026-08-10T10:05:00.000Z",
  },
  {
    id: "77777777-7777-4777-8777-777777777772",
    setNumber: 2,
    weightKg: 80,
    repetitions: 9,
    rir: 2,
    setType: "working" as const,
    completedAt: "2026-08-10T10:10:00.000Z",
  },
  {
    id: "77777777-7777-4777-8777-777777777773",
    setNumber: 3,
    weightKg: 80,
    repetitions: 8,
    rir: null,
    setType: "backoff" as const,
    completedAt: "2026-08-10T10:15:00.000Z",
  },
];

export const historyListItemFixture = {
  id: workoutSessionFixture.id,
  routineName: workoutSessionFixture.routineName,
  dayName: workoutSessionFixture.dayName,
  startedAt: workoutSessionFixture.startedAt,
  completedAt: "2026-08-10T11:04:00.000Z",
  completedSetCount: 3,
  primaryMuscleGroups: ["Pecho", "Tríceps"],
} satisfies HistoryListItem;

export const completedWorkoutHistoryFixture = {
  session: {
    ...workoutSessionFixture,
    status: "completed" as const,
    completedAt: historyListItemFixture.completedAt,
    activeWorkoutExerciseId: null,
    exercises: [
      {
        ...workoutSessionFixture.exercises[0],
        targetSets: 4,
        sets: completedSets,
      },
      {
        ...workoutSessionFixture.exercises[1],
        sets: [],
      },
    ],
  },
  previousByExercise: previousPerformanceFixture,
} satisfies CompletedWorkoutHistory;
