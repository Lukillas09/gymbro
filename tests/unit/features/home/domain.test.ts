import { describe, expect, it } from "vitest";
import {
  buildWeeklySummary,
  deriveHomeState,
  findFactualImprovement,
  formatNextRoutineDay,
  getLocalDayRange,
  getLocalDateKey,
  getLocalWeekRange,
  resolveNextRoutineDay,
  selectBroCue,
} from "@/features/home/domain";
import type { HomeRoutine } from "@/features/home/types";
import {
  homeActiveSessionFixture,
  homeCompletedSessionFixture,
  homeRoutineFixture,
} from "../../../fixtures/home";

const timeZone = "America/Argentina/Buenos_Aires";
const sunday = new Date("2026-08-09T14:00:00.000Z");

describe("deriveHomeState", () => {
  it("deriva no-routine cuando no existe una rutina activa", () => {
    expect(
      deriveHomeState(
        { activeSession: null, activeRoutine: null, completedSessions: [] },
        sunday,
        timeZone,
      ),
    ).toEqual({ kind: "no-routine", reason: "missing", routineId: null });
  });

  it("mantiene READY manual cuando la rutina no define todos los weekdays", () => {
    const routine = {
      ...homeRoutineFixture,
      days: homeRoutineFixture.days.map((day) => ({ ...day, weekday: null })),
    } satisfies HomeRoutine;
    const state = deriveHomeState(
      { activeSession: null, activeRoutine: routine, completedSessions: [] },
      sunday,
      timeZone,
    );
    expect(state).toMatchObject({
      kind: "ready",
      schedule: "manual",
      suggestedDayId: routine.days[0].id,
    });
  });

  it("deriva READY para el día programado hoy", () => {
    expect(
      deriveHomeState(
        {
          activeSession: null,
          activeRoutine: homeRoutineFixture,
          completedSessions: [],
        },
        sunday,
        timeZone,
      ),
    ).toMatchObject({
      kind: "ready",
      schedule: "scheduled",
      suggestedDayId: homeRoutineFixture.days[0].id,
    });
  });

  it("deriva REST sólo con un calendario completo sin día para hoy", () => {
    const routine = {
      ...homeRoutineFixture,
      days: homeRoutineFixture.days.map((day, index) => ({
        ...day,
        weekday: index === 0 ? 2 : 5,
      })),
    } satisfies HomeRoutine;
    expect(
      deriveHomeState(
        { activeSession: null, activeRoutine: routine, completedSessions: [] },
        sunday,
        timeZone,
      ),
    ).toMatchObject({ kind: "rest", nextRoutineDay: { daysUntil: 2 } });
  });

  it("da prioridad a una sesión activa sobre una completada hoy", () => {
    expect(
      deriveHomeState(
        {
          activeSession: homeActiveSessionFixture,
          activeRoutine: homeRoutineFixture,
          completedSessions: [homeCompletedSessionFixture],
        },
        sunday,
        timeZone,
      ).kind,
    ).toBe("training");
  });

  it("deriva COMPLETED para la última sesión completada hoy", () => {
    expect(
      deriveHomeState(
        {
          activeSession: null,
          activeRoutine: homeRoutineFixture,
          completedSessions: [homeCompletedSessionFixture],
        },
        sunday,
        timeZone,
      ),
    ).toMatchObject({
      kind: "completed",
      session: homeCompletedSessionFixture,
    });
  });

  it("no confunde una sesión completada ayer con hoy", () => {
    const yesterday = {
      ...homeCompletedSessionFixture,
      completedAt: "2026-08-08T14:00:00.000Z",
    };
    expect(
      deriveHomeState(
        {
          activeSession: null,
          activeRoutine: homeRoutineFixture,
          completedSessions: [yesterday],
        },
        sunday,
        timeZone,
      ).kind,
    ).toBe("ready");
  });

  it("usa el día local de Argentina aunque UTC ya haya cambiado", () => {
    const localSundayNight = new Date("2026-08-10T02:45:00.000Z");
    const completed = {
      ...homeCompletedSessionFixture,
      completedAt: "2026-08-10T02:30:00.000Z",
    };
    expect(getLocalDateKey(localSundayNight, timeZone)).toBe("2026-08-09");
    expect(
      deriveHomeState(
        {
          activeSession: null,
          activeRoutine: null,
          completedSessions: [completed],
        },
        localSundayNight,
        timeZone,
      ).kind,
    ).toBe("completed");
  });
});

describe("calendar and cues", () => {
  it("resuelve el próximo día recorriendo el ciclo semanal", () => {
    const next = resolveNextRoutineDay(homeRoutineFixture, sunday, timeZone);
    expect(next).toMatchObject({
      day: { name: "Pull" },
      daysUntil: 2,
    });
    expect(formatNextRoutineDay(next!)).toBe("Pull · en 2 días");
  });

  it("no inventa un próximo día sin calendario completo", () => {
    const routine = {
      ...homeRoutineFixture,
      days: homeRoutineFixture.days.map((day) => ({ ...day, weekday: null })),
    } satisfies HomeRoutine;
    expect(resolveNextRoutineDay(routine, sunday, timeZone)).toBeNull();
  });

  it("calcula la semana local de lunes a lunes", () => {
    expect(getLocalDayRange(sunday, timeZone)).toEqual({
      start: "2026-08-09T03:00:00.000Z",
      end: "2026-08-10T03:00:00.000Z",
    });
    expect(getLocalWeekRange(sunday, timeZone)).toEqual({
      start: "2026-08-03T03:00:00.000Z",
      end: "2026-08-10T03:00:00.000Z",
    });
    expect(
      buildWeeklySummary(
        [
          homeCompletedSessionFixture,
          {
            ...homeCompletedSessionFixture,
            id: "12121212-1212-4212-8212-121212121212",
            completedAt: "2026-08-02T14:00:00.000Z",
          },
        ],
        sunday,
        timeZone,
      ),
    ).toEqual({ completedCount: 1 });
  });

  it("prioriza progreso, luego memoria y finalmente consistencia semanal", () => {
    const state = deriveHomeState(
      {
        activeSession: null,
        activeRoutine: homeRoutineFixture,
        completedSessions: [homeCompletedSessionFixture],
      },
      sunday,
      timeZone,
    );
    const improvement = { exerciseName: "Press banca", label: "+1 REP" };
    const memory = {
      exerciseName: "Press banca",
      set: homeCompletedSessionFixture.exercises[0].sets[0],
    };
    expect(
      selectBroCue(state, improvement, memory, { completedCount: 2 }),
    ).toEqual({
      kind: "progress",
      eyebrow: "Progreso reciente",
      text: "Press banca · +1 REP",
    });

    const ready = deriveHomeState(
      {
        activeSession: null,
        activeRoutine: homeRoutineFixture,
        completedSessions: [],
      },
      sunday,
      timeZone,
    );
    expect(selectBroCue(ready, null, memory, { completedCount: 2 })?.kind).toBe(
      "memory",
    );
    expect(selectBroCue(ready, null, null, { completedCount: 2 })?.kind).toBe(
      "weekly",
    );
  });

  it("encuentra sólo una mejora factual comparable", () => {
    const improvement = findFactualImprovement(homeCompletedSessionFixture, {
      [homeCompletedSessionFixture.exercises[0].exerciseId]: [
        {
          setNumber: 1,
          weightKg: 80,
          repetitions: 8,
          completedAt: "2026-08-02T12:00:00.000Z",
        },
        {
          setNumber: 2,
          weightKg: 80,
          repetitions: 8,
          completedAt: "2026-08-02T12:02:00.000Z",
        },
      ],
    });
    expect(improvement).toEqual({
      exerciseName: "Press banca con barra",
      label: "+1 REP",
    });
  });
});
