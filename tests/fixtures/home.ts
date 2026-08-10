import type {
  HomePageModel,
  HomeRoutine,
  HomeWorkoutSession,
} from "@/features/home/types";

export const homeRoutineFixture = {
  id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  name: "Push Pull",
  days: [
    {
      id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
      name: "Push",
      position: 0,
      weekday: 0,
      exercises: [
        {
          exerciseId: "11111111-1111-4111-8111-111111111111",
          exerciseName: "Press banca con barra",
          position: 0,
          primaryMuscleGroups: ["Pecho", "Tríceps"],
        },
      ],
    },
    {
      id: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
      name: "Pull",
      position: 1,
      weekday: 2,
      exercises: [
        {
          exerciseId: "22222222-2222-4222-8222-222222222222",
          exerciseName: "Remo con barra",
          position: 0,
          primaryMuscleGroups: ["Espalda", "Bíceps"],
        },
      ],
    },
  ],
} satisfies HomeRoutine;

export const homeActiveSessionFixture = {
  id: "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
  routineDayId: homeRoutineFixture.days[0].id,
  routineName: homeRoutineFixture.name,
  dayName: "Push",
  startedAt: "2026-08-09T12:00:00.000Z",
  completedAt: null,
  status: "in_progress",
  activeWorkoutExerciseId: "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee",
  exercises: [
    {
      id: "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee",
      exerciseId: "11111111-1111-4111-8111-111111111111",
      exerciseName: "Press banca con barra",
      position: 0,
      targetSets: 3,
      sets: [
        {
          setNumber: 1,
          weightKg: 80,
          repetitions: 8,
          completedAt: "2026-08-09T12:05:00.000Z",
        },
      ],
    },
  ],
} satisfies HomeWorkoutSession;

export const homeCompletedSessionFixture = {
  ...homeActiveSessionFixture,
  id: "ffffffff-ffff-4fff-8fff-ffffffffffff",
  activeWorkoutExerciseId: null,
  completedAt: "2026-08-09T13:00:00.000Z",
  status: "completed",
  exercises: [
    {
      ...homeActiveSessionFixture.exercises[0],
      sets: [
        ...homeActiveSessionFixture.exercises[0].sets,
        {
          setNumber: 2,
          weightKg: 80,
          repetitions: 9,
          completedAt: "2026-08-09T12:08:00.000Z",
        },
      ],
    },
  ],
} satisfies HomeWorkoutSession;

const baseModel = {
  firstName: "Lucas",
  dateLabel: "domingo, 9 ago",
  generatedAt: "2026-08-09T14:00:00.000Z",
  timeZone: "America/Argentina/Buenos_Aires",
  broCue: null,
  weeklySummary: { completedCount: 0 },
} as const;

export const noRoutineHomeModel = {
  ...baseModel,
  state: { kind: "no-routine", reason: "missing", routineId: null },
} satisfies HomePageModel;

export const readyHomeModel = {
  ...baseModel,
  broCue: {
    kind: "memory",
    eyebrow: "La última vez",
    text: "Press banca con barra · 80 kg × 8",
  },
  state: {
    kind: "ready",
    routine: homeRoutineFixture,
    days: homeRoutineFixture.days,
    schedule: "scheduled",
    suggestedDayId: homeRoutineFixture.days[0].id,
  },
} satisfies HomePageModel;

export const trainingHomeModel = {
  ...baseModel,
  state: { kind: "training", session: homeActiveSessionFixture },
} satisfies HomePageModel;

export const completedHomeModel = {
  ...baseModel,
  broCue: {
    kind: "progress",
    eyebrow: "Progreso reciente",
    text: "Press banca con barra · +1 REP",
  },
  weeklySummary: { completedCount: 1 },
  state: {
    kind: "completed",
    session: homeCompletedSessionFixture,
    nextRoutineDay: { day: homeRoutineFixture.days[1], daysUntil: 2 },
  },
} satisfies HomePageModel;

export const restHomeModel = {
  ...baseModel,
  broCue: {
    kind: "weekly",
    eyebrow: "Tu semana",
    text: "1 entrenamiento esta semana",
  },
  weeklySummary: { completedCount: 1 },
  state: {
    kind: "rest",
    routine: {
      ...homeRoutineFixture,
      days: homeRoutineFixture.days.map((day, index) => ({
        ...day,
        weekday: index === 0 ? 2 : 5,
      })),
    },
    nextRoutineDay: {
      day: { ...homeRoutineFixture.days[0], weekday: 2 },
      daysUntil: 2,
    },
  },
} satisfies HomePageModel;
