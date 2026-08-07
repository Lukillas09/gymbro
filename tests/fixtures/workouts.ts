import type {
  PreviousPerformanceByExercise,
  WorkoutSession,
} from "@/features/workouts/types";

export const benchWorkoutExerciseId = "99999999-9999-4999-8999-999999999991";
export const hipWorkoutExerciseId = "99999999-9999-4999-8999-999999999992";

export const workoutSessionFixture = {
  id: "99999999-9999-4999-8999-999999999990",
  routineDayId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
  routineName: "Torso Pierna",
  dayName: "Torso A",
  startedAt: "2026-08-10T10:00:00.000Z",
  completedAt: null,
  status: "in_progress",
  activeWorkoutExerciseId: benchWorkoutExerciseId,
  restEndsAt: null,
  exercises: [
    {
      id: benchWorkoutExerciseId,
      exerciseId: "11111111-1111-4111-8111-111111111111",
      exerciseName: "Press banca con barra",
      exerciseSlug: "barbell-bench-press",
      position: 0,
      targetSets: 3,
      targetRepsMin: 8,
      targetRepsMax: 10,
      restSeconds: 90,
      targetRir: 2,
      notes: null,
      primaryMuscleGroups: ["Pecho"],
      sets: [],
    },
    {
      id: hipWorkoutExerciseId,
      exerciseId: "22222222-2222-4222-8222-222222222222",
      exerciseName: "Hip thrust con barra",
      exerciseSlug: "barbell-hip-thrust",
      position: 1,
      targetSets: 2,
      targetRepsMin: 10,
      targetRepsMax: 12,
      restSeconds: 120,
      targetRir: null,
      notes: null,
      primaryMuscleGroups: ["Piernas"],
      sets: [],
    },
  ],
} satisfies WorkoutSession;

export const previousPerformanceFixture: PreviousPerformanceByExercise = {
  "11111111-1111-4111-8111-111111111111": {
    completedAt: "2026-08-08T11:00:00.000Z",
    sets: [
      {
        id: "88888888-8888-4888-8888-888888888881",
        setNumber: 1,
        weightKg: 80,
        repetitions: 8,
        rir: null,
        setType: "working",
        completedAt: "2026-08-08T10:10:00.000Z",
      },
      {
        id: "88888888-8888-4888-8888-888888888882",
        setNumber: 2,
        weightKg: 80,
        repetitions: 8,
        rir: null,
        setType: "working",
        completedAt: "2026-08-08T10:12:00.000Z",
      },
    ],
  },
};
