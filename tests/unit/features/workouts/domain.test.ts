import { describe, expect, it } from "vitest";
import {
  buildWorkoutSummary,
  canUndoWorkoutSet,
  compareFactualProgress,
  deriveTrainingState,
  formatCountdown,
  getNextExerciseId,
  getNextSetNumber,
  getRestSecondsRemaining,
  getSetPrefill,
  isRecoverableSession,
} from "@/features/workouts/domain";
import {
  benchWorkoutExerciseId,
  hipWorkoutExerciseId,
  previousPerformanceFixture,
  workoutSessionFixture,
} from "../../../fixtures/workouts";

const completedSet = {
  id: "77777777-7777-4777-8777-777777777777",
  setNumber: 1,
  weightKg: 80,
  repetitions: 9,
  rir: null,
  setType: "working" as const,
  completedAt: "2026-08-10T10:05:00.000Z",
};

describe("estado derivado del entrenamiento", () => {
  it("representa setup, live, resting y completed sin booleanos incompatibles", () => {
    const now = Date.parse("2026-08-10T10:06:00.000Z");
    expect(deriveTrainingState(null, now)).toBe("setup");
    expect(deriveTrainingState(workoutSessionFixture, now)).toBe("live");
    expect(
      deriveTrainingState(
        { ...workoutSessionFixture, restEndsAt: "2026-08-10T10:07:00.000Z" },
        now,
      ),
    ).toBe("resting");
    expect(
      deriveTrainingState(
        {
          ...workoutSessionFixture,
          status: "completed",
          completedAt: "2026-08-10T10:10:00.000Z",
        },
        now,
      ),
    ).toBe("completed");
  });

  it("reconoce únicamente sesiones recuperables", () => {
    expect(isRecoverableSession(workoutSessionFixture)).toBe(true);
    expect(
      isRecoverableSession({ ...workoutSessionFixture, status: "cancelled" }),
    ).toBe(false);
  });
});

describe("avance y prefill", () => {
  it("elige la primera serie pendiente y el siguiente ejercicio disponible", () => {
    const exercises = workoutSessionFixture.exercises.map((exercise) =>
      exercise.id === benchWorkoutExerciseId
        ? {
            ...exercise,
            sets: [
              completedSet,
              { ...completedSet, id: "a", setNumber: 2 },
              { ...completedSet, id: "b", setNumber: 3 },
            ],
          }
        : exercise,
    );
    expect(getNextSetNumber(exercises[0])).toBeNull();
    expect(getNextExerciseId(exercises, benchWorkoutExerciseId)).toBe(
      hipWorkoutExerciseId,
    );
  });

  it("prefiere la serie actual, luego la última sesión y finalmente la prescripción", () => {
    const bench = workoutSessionFixture.exercises[0];
    const previous = previousPerformanceFixture[bench.exerciseId];
    expect(getSetPrefill(bench, 1, previous)).toEqual({
      weightKg: 80,
      repetitions: 8,
      source: "previous-session",
    });
    expect(
      getSetPrefill({ ...bench, sets: [completedSet] }, 2, previous),
    ).toEqual({
      weightKg: 80,
      repetitions: 9,
      source: "current-session",
    });
    expect(getSetPrefill(bench, 1, undefined)).toEqual({
      weightKg: null,
      repetitions: 8,
      source: "prescription",
    });
  });
});

describe("progreso, descanso y cierre", () => {
  it("sólo reconoce mejoras factuales comparables", () => {
    expect(
      compareFactualProgress(
        { weightKg: 80, repetitions: 9 },
        { weightKg: 80, repetitions: 8 },
      ),
    ).toEqual({ kind: "repetitions", label: "+1 REP" });
    expect(
      compareFactualProgress(
        { weightKg: 82.5, repetitions: 8 },
        { weightKg: 80, repetitions: 8 },
      ),
    ).toEqual({ kind: "weight", label: "+2.5 KG" });
    expect(
      compareFactualProgress(
        { weightKg: 82.5, repetitions: 7 },
        { weightKg: 80, repetitions: 8 },
      ),
    ).toBeNull();
  });

  it("deriva el countdown desde un timestamp absoluto", () => {
    const now = Date.parse("2026-08-10T10:00:00.000Z");
    expect(getRestSecondsRemaining("2026-08-10T10:01:29.500Z", now)).toBe(90);
    expect(formatCountdown(89)).toBe("01:29");
  });

  it("limita undo a la última serie de una sesión activa", () => {
    const session = {
      ...workoutSessionFixture,
      exercises: [
        { ...workoutSessionFixture.exercises[0], sets: [completedSet] },
        workoutSessionFixture.exercises[1],
      ],
    };
    expect(canUndoWorkoutSet(session, completedSet.id)).toBe(true);
    expect(canUndoWorkoutSet(session, "otro-id")).toBe(false);
    expect(
      canUndoWorkoutSet({ ...session, status: "completed" }, completedSet.id),
    ).toBe(false);
  });

  it("resume una sesión finalizada con duración, series, músculos y mejoras", () => {
    const completed = {
      ...workoutSessionFixture,
      status: "completed" as const,
      completedAt: "2026-08-10T11:04:00.000Z",
      exercises: [
        { ...workoutSessionFixture.exercises[0], sets: [completedSet] },
        workoutSessionFixture.exercises[1],
      ],
    };
    expect(
      buildWorkoutSummary(
        completed,
        previousPerformanceFixture,
        Date.parse(completed.completedAt),
      ),
    ).toMatchObject({
      durationSeconds: 3840,
      completedSetCount: 1,
      primaryMuscleGroups: ["Pecho", "Piernas"],
      improvements: [
        { exerciseName: "Press banca con barra", label: "+1 REP" },
      ],
    });
  });
});
