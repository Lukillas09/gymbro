import type { ProfileIdentityModel } from "@/features/profile/types";

export const profileIdentityFixture = {
  identity: {
    displayName: "Lucas Martínez",
    username: "lucasmartinez.09",
    initials: "LM",
    trainingLevel: "Intermedio",
    primaryGoal: "Hipertrofia",
  },
  metrics: [
    { value: 12, label: "Entrenos" },
    { value: 5, label: "Últimos 28 días" },
    { value: 3, label: "Semanas activas" },
  ],
  activeRoutine: {
    id: "11111111-1111-4111-8111-111111111111",
    name: "Push Pull Legs",
    dayCount: 3,
    exerciseCount: 15,
  },
  recentMuscleGroups: ["Pecho", "Tríceps"],
  personalRecord: {
    exerciseId: "22222222-2222-4222-8222-222222222222",
    exerciseName: "Press banca con barra",
    sessionId: "33333333-3333-4333-8333-333333333333",
    completedAt: "2026-08-09T23:30:00.000Z",
    weightKg: 80,
    repetitions: 9,
  },
  recentActivity: [
    {
      id: "33333333-3333-4333-8333-333333333333",
      dayName: "Push",
      startedAt: "2026-08-09T22:30:00.000Z",
      completedAt: "2026-08-09T23:30:00.000Z",
      completedSetCount: 9,
      primaryMuscleGroups: ["Pecho", "Tríceps"],
      exercises: [
        {
          exerciseId: "22222222-2222-4222-8222-222222222222",
          exerciseName: "Press banca con barra",
          hasValidSet: true,
        },
      ],
    },
    {
      id: "44444444-4444-4444-8444-444444444444",
      dayName: "Push",
      startedAt: "2026-08-02T22:30:00.000Z",
      completedAt: "2026-08-02T23:30:00.000Z",
      completedSetCount: 8,
      primaryMuscleGroups: ["Pecho", "Tríceps"],
      exercises: [],
    },
  ],
  totalCompletedWorkouts: 12,
} satisfies ProfileIdentityModel;

export const emptyProfileIdentityFixture = {
  ...profileIdentityFixture,
  metrics: [],
  activeRoutine: null,
  recentMuscleGroups: [],
  personalRecord: null,
  recentActivity: [],
  totalCompletedWorkouts: 0,
} satisfies ProfileIdentityModel;
