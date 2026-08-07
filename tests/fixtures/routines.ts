import type { RoutineDetail } from "@/features/routines/types";
import { exerciseFixtures } from "./exercises";

const [benchPress, hipThrust] = exerciseFixtures;

export const routineFixture = {
  id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  name: "Torso Pierna",
  description: null,
  goal: "muscle_gain",
  isActive: true,
  archivedAt: null,
  createdAt: "2026-08-09T10:00:00.000Z",
  updatedAt: "2026-08-09T10:00:00.000Z",
  days: [
    {
      id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
      updatedAt: "2026-08-09T10:00:00.000Z",
      name: "Torso A",
      position: 0,
      weekday: null,
      exercises: [
        {
          id: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
          updatedAt: "2026-08-09T10:00:00.000Z",
          position: 0,
          targetSets: 4,
          targetRepsMin: 8,
          targetRepsMax: 10,
          restSeconds: 120,
          targetRir: 2,
          notes: null,
          exercise: {
            id: benchPress.id,
            name: benchPress.name,
            slug: benchPress.slug,
            muscles: benchPress.muscles,
          },
        },
      ],
    },
    {
      id: "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
      updatedAt: "2026-08-09T10:00:00.000Z",
      name: "Pierna A",
      position: 1,
      weekday: null,
      exercises: [
        {
          id: "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee",
          updatedAt: "2026-08-09T10:00:00.000Z",
          position: 0,
          targetSets: 3,
          targetRepsMin: 10,
          targetRepsMax: 12,
          restSeconds: 90,
          targetRir: null,
          notes: null,
          exercise: {
            id: hipThrust.id,
            name: hipThrust.name,
            slug: hipThrust.slug,
            muscles: hipThrust.muscles,
          },
        },
      ],
    },
  ],
} satisfies RoutineDetail;
