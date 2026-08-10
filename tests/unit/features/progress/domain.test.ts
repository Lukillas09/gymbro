import { describe, expect, it } from "vitest";
import {
  buildExerciseProgressDetail,
  buildProgressOverview,
  compareWeightRecords,
  getProgressInterpretation,
  getProgressPeriod,
  getRepresentativeSet,
} from "@/features/progress/domain";
import type {
  ProgressSourceSet,
  WeightPersonalRecord,
} from "@/features/progress/types";
import {
  benchPressId,
  progressCatalogFixture,
  progressPersonalRecordFixture,
  progressSessionFixture,
} from "../../../fixtures/progress";

describe("dominio de progreso básico", () => {
  it("calcula dos ventanas contiguas de 28 días en Buenos Aires", () => {
    const period = getProgressPeriod(new Date("2026-08-10T02:30:00.000Z"));

    expect(period.current).toEqual({
      start: "2026-07-13T03:00:00.000Z",
      end: "2026-08-10T03:00:00.000Z",
    });
    expect(period.previous).toEqual({
      start: "2026-06-15T03:00:00.000Z",
      end: "2026-07-13T03:00:00.000Z",
    });
    expect(period.weeks).toHaveLength(4);
    expect(period.weeks[0].start).toBe(period.current.start);
    expect(period.weeks[3].end).toBe(period.current.end);
  });

  it("elige peso, repeticiones y orden estable para la serie representativa", () => {
    const sets: ProgressSourceSet[] = [
      {
        id: "set-2",
        setNumber: 2,
        weightKg: 85,
        repetitions: 8,
        completedAt: "2026-08-08T15:00:00.000Z",
      },
      {
        id: "set-1",
        setNumber: 1,
        weightKg: 85,
        repetitions: 8,
        completedAt: "2026-08-08T14:55:00.000Z",
      },
      {
        id: "set-3",
        setNumber: 3,
        weightKg: 80,
        repetitions: 12,
        completedAt: "2026-08-08T15:05:00.000Z",
      },
    ];

    expect(getRepresentativeSet(sets)?.id).toBe("set-1");
  });

  it("clasifica sólo una mejora factual y deja ambiguos los cambios mixtos", () => {
    const period = getProgressPeriod(new Date("2026-08-10T15:00:00.000Z"));
    const older = progressSessionFixture({
      id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      completedAt: "2026-07-20T15:00:00.000Z",
      weightKg: 80,
      repetitions: 8,
    });
    const improved = progressSessionFixture({
      id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
      completedAt: "2026-08-08T15:00:00.000Z",
      weightKg: 80,
      repetitions: 9,
    });
    const overview = buildProgressOverview(
      [improved, older],
      [],
      [progressCatalogFixture[0]],
      period,
    );

    expect(overview.improvements[0].improvement?.label).toBe("+1 REP");
    expect(getProgressInterpretation(overview).title).toBe(
      "Hay señales concretas de progreso",
    );

    const mixed = progressSessionFixture({
      id: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
      completedAt: "2026-08-09T15:00:00.000Z",
      weightKg: 85,
      repetitions: 7,
    });
    const mixedOverview = buildProgressOverview(
      [mixed, older],
      [],
      [progressCatalogFixture[0]],
      period,
    );
    expect(mixedOverview.improvements).toHaveLength(0);
    expect(mixedOverview.exercises[0].improvement).toBeNull();
  });

  it("mantiene un estado prudente con una sola sesión", () => {
    const period = getProgressPeriod(new Date("2026-08-10T15:00:00.000Z"));
    const onlySession = progressSessionFixture({
      id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      completedAt: "2026-08-08T15:00:00.000Z",
      weightKg: 80,
      repetitions: 8,
    });
    const overview = buildProgressOverview(
      [onlySession],
      [],
      [progressCatalogFixture[0]],
      period,
    );

    expect(getProgressInterpretation(overview).title).toBe(
      "Ya tenés un primer registro reciente",
    );
    expect(overview.exercises[0].previous).toBeNull();
  });

  it("arma la evolución reciente con comparación contra la sesión anterior", () => {
    const latest = progressSessionFixture({
      id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      completedAt: "2026-08-08T15:00:00.000Z",
      weightKg: 82.5,
      repetitions: 8,
    });
    const previous = progressSessionFixture({
      id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
      completedAt: "2026-08-01T15:00:00.000Z",
      weightKg: 80,
      repetitions: 8,
    });
    const detail = buildExerciseProgressDetail(
      benchPressId,
      "Press banca con barra",
      [latest, previous],
      2,
      progressPersonalRecordFixture,
      12,
    );

    expect(detail?.performances[0].comparison?.label).toBe("+2.5 KG");
    expect(detail?.hasMore).toBe(false);
  });

  it("desempata un PR por repeticiones y luego por fecha", () => {
    const makeRecord = (
      id: string,
      repetitions: number,
      completedAt: string,
    ): WeightPersonalRecord => ({
      sessionId: `${id}-session`,
      completedAt,
      set: {
        id,
        setNumber: 1,
        weightKg: 100,
        repetitions,
        completedAt,
      },
    });
    const records = [
      makeRecord("older", 8, "2026-07-01T15:00:00.000Z"),
      makeRecord("fewer", 6, "2026-08-01T15:00:00.000Z"),
      makeRecord("newer", 8, "2026-08-08T15:00:00.000Z"),
    ].sort(compareWeightRecords);

    expect(records[0].set.id).toBe("newer");
  });
});
