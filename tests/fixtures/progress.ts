import type {
  ExerciseProgressDetail,
  ProgressExerciseCatalogItem,
  ProgressSourceSession,
  WeightPersonalRecord,
} from "@/features/progress/types";

export const benchPressId = "11111111-1111-4111-8111-111111111111";
export const hipThrustId = "22222222-2222-4222-8222-222222222222";

export function progressSessionFixture({
  id,
  completedAt,
  exerciseId = benchPressId,
  exerciseName = "Press banca con barra",
  weightKg,
  repetitions,
}: Readonly<{
  id: string;
  completedAt: string;
  exerciseId?: string;
  exerciseName?: string;
  weightKg: number;
  repetitions: number;
}>): ProgressSourceSession {
  return {
    id,
    completedAt,
    exercises: [
      {
        exerciseId,
        exerciseName,
        sets: [
          {
            id: `${id}-set-1`,
            setNumber: 1,
            weightKg,
            repetitions,
            completedAt,
          },
        ],
      },
    ],
  };
}

export const progressCatalogFixture: readonly ProgressExerciseCatalogItem[] = [
  {
    exerciseId: benchPressId,
    exerciseName: "Press banca con barra",
    lastPerformedAt: "2026-08-08T15:00:00.000Z",
  },
  {
    exerciseId: hipThrustId,
    exerciseName: "Hip thrust con barra",
    lastPerformedAt: "2026-08-06T15:00:00.000Z",
  },
];

const latestSession = progressSessionFixture({
  id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  completedAt: "2026-08-08T15:00:00.000Z",
  weightKg: 80,
  repetitions: 9,
});

const previousSession = progressSessionFixture({
  id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
  completedAt: "2026-08-01T15:00:00.000Z",
  weightKg: 80,
  repetitions: 8,
});

export const progressPersonalRecordFixture: WeightPersonalRecord = {
  sessionId: latestSession.id,
  completedAt: latestSession.completedAt,
  set: latestSession.exercises[0].sets[0],
};

export const exerciseProgressDetailFixture: ExerciseProgressDetail = {
  exerciseId: benchPressId,
  exerciseName: "Press banca con barra",
  sessionCount: 2,
  latest: {
    sessionId: latestSession.id,
    completedAt: latestSession.completedAt,
    representativeSet: latestSession.exercises[0].sets[0],
  },
  personalRecord: progressPersonalRecordFixture,
  performances: [
    {
      sessionId: latestSession.id,
      completedAt: latestSession.completedAt,
      representativeSet: latestSession.exercises[0].sets[0],
      comparison: { kind: "repetitions", label: "+1 REP" },
    },
    {
      sessionId: previousSession.id,
      completedAt: previousSession.completedAt,
      representativeSet: previousSession.exercises[0].sets[0],
      comparison: null,
    },
  ],
  hasMore: false,
};
