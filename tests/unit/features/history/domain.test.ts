import { describe, expect, it } from "vitest";
import {
  encodeHistoryCursor,
  formatHistoryDuration,
  formatHistoryListDate,
  getCompletedSetCount,
  getHistoricalExerciseResult,
  getPrimaryMuscleSummary,
  groupHistoryByMonth,
  paginateHistoryItems,
  parseHistoryCursor,
} from "@/features/history/domain";
import {
  completedWorkoutHistoryFixture,
  historyListItemFixture,
} from "../../../fixtures/history";

describe("dominio del historial", () => {
  it("deriva duración sin precisión falsa", () => {
    expect(
      formatHistoryDuration(
        "2026-08-10T10:00:00.000Z",
        "2026-08-10T11:04:00.000Z",
      ),
    ).toBe("1 h 04 min");
  });

  it("agrupa por mes según el día local de Buenos Aires", () => {
    const groups = groupHistoryByMonth([
      {
        ...historyListItemFixture,
        id: "11111111-1111-4111-8111-111111111111",
        completedAt: "2026-08-01T02:30:00.000Z",
      },
      {
        ...historyListItemFixture,
        id: "22222222-2222-4222-8222-222222222222",
        completedAt: "2026-08-01T03:30:00.000Z",
      },
    ]);

    expect(groups.map(({ key }) => key)).toEqual(["2026-07", "2026-08"]);
    expect(formatHistoryListDate("2026-08-01T02:30:00.000Z")).toBe("31 JUL");
  });

  it("cuenta únicamente workout_sets reales y limita músculos", () => {
    const exercises = completedWorkoutHistoryFixture.session.exercises;
    expect(getCompletedSetCount(exercises)).toBe(3);
    expect(
      getPrimaryMuscleSummary([
        ...exercises,
        { primaryMuscleGroups: ["Espalda", "Bíceps"] },
      ]),
    ).toEqual(["Pecho", "Piernas", "Espalda"]);
  });

  it("muestra progreso sólo ante una comparación factual válida", () => {
    const exercise = completedWorkoutHistoryFixture.session.exercises[0];
    const previous =
      completedWorkoutHistoryFixture.previousByExercise[exercise.exerciseId];
    expect(getHistoricalExerciseResult(exercise, previous).improvement).toBe(
      "+1 REP",
    );
    expect(
      getHistoricalExerciseResult(exercise, undefined).improvement,
    ).toBeNull();
  });

  it("pagina con cursor estable de completed_at e id", () => {
    const items = Array.from({ length: 21 }, (_, index) => ({
      ...historyListItemFixture,
      id: `00000000-0000-4000-8000-${String(index + 1).padStart(12, "0")}`,
      completedAt: new Date(
        Date.parse(historyListItemFixture.completedAt) - index * 60_000,
      ).toISOString(),
    }));
    const page = paginateHistoryItems(items);
    const expectedCursor = {
      completedAt: items[19].completedAt,
      id: items[19].id,
    };

    expect(page.items).toHaveLength(20);
    expect(page.nextCursor).toBe(encodeHistoryCursor(expectedCursor));
    expect(parseHistoryCursor(page.nextCursor ?? "")).toEqual(expectedCursor);
    expect(parseHistoryCursor("cursor-inválido")).toBeNull();
  });
});
