import { describe, expect, it } from "vitest";
import {
  buildCalendarDays,
  buildCalendarMonthFrame,
  deriveCalendarDayState,
  resolveCalendarMonthKey,
  resolveSelectedDateKey,
} from "@/features/calendar/domain";
import type {
  CalendarScheduledDay,
  CalendarWorkout,
} from "@/features/calendar/types";
import { getLocalDateKeyRange } from "@/lib/date-time";

const scheduledPush: CalendarScheduledDay = {
  id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
  name: "Push",
  position: 0,
  weekday: 1,
  exerciseCount: 6,
  primaryMuscleGroups: ["Pecho", "Hombros", "Tríceps"],
};

function workout(
  id: string,
  completedAt: string | null,
  routineDayId: string | null = scheduledPush.id,
): CalendarWorkout {
  return {
    id,
    routineDayId,
    routineName: "Push Pull",
    dayName: "Push",
    startedAt: completedAt ?? "2026-08-10T12:00:00.000Z",
    completedAt,
    status: completedAt ? "completed" : "in_progress",
    completedSetCount: 8,
  };
}

describe("dominio del calendario", () => {
  it.each([
    ["2021-02", 28],
    ["2024-02", 29],
    ["2026-04", 30],
    ["2026-08", 31],
  ])("construye %s con sus %i días reales", (monthKey, expectedDays) => {
    const frame = buildCalendarMonthFrame(monthKey);
    expect(
      frame.dateKeys.filter((key) => key.startsWith(monthKey)),
    ).toHaveLength(expectedDays);
    expect(frame.dateKeys.length % 7).toBe(0);
  });

  it("inicia la cuadrícula en lunes y cambia de año", () => {
    const january = buildCalendarMonthFrame("2027-01");
    expect(january.firstDateKey).toBe("2026-12-28");
    expect(january.previousMonthKey).toBe("2026-12");
    expect(january.nextMonthKey).toBe("2027-02");
  });

  it("convierte el rango mensual desde medianoche local y no UTC", () => {
    expect(
      getLocalDateKeyRange(
        "2026-08-10",
        "2026-08-11",
        "America/Argentina/Buenos_Aires",
      ),
    ).toEqual({
      start: "2026-08-10T03:00:00.000Z",
      end: "2026-08-11T03:00:00.000Z",
    });
  });

  it("normaliza mes y selección inválidos sin perder hoy", () => {
    const frame = buildCalendarMonthFrame("2026-08");
    expect(resolveCalendarMonthKey("incorrecto", "2026-08-10")).toBe("2026-08");
    expect(resolveSelectedDateKey("2026-08-99", frame, "2026-08-10")).toBe(
      "2026-08-10",
    );
    expect(resolveSelectedDateKey(undefined, frame, "2026-09-01")).toBe(
      "2026-08-01",
    );
  });

  it("deriva estados con precedencia conservadora", () => {
    const completed = workout(
      "11111111-1111-4111-8111-111111111111",
      "2026-08-10T14:00:00.000Z",
    );
    const unrelated = { ...completed, routineDayId: null };

    expect(
      deriveCalendarDayState({
        scheduledDays: [],
        completedSessions: [],
        activeSession: null,
      }),
    ).toBe("empty");
    expect(
      deriveCalendarDayState({
        scheduledDays: [scheduledPush],
        completedSessions: [],
        activeSession: null,
      }),
    ).toBe("scheduled");
    expect(
      deriveCalendarDayState({
        scheduledDays: [scheduledPush],
        completedSessions: [unrelated],
        activeSession: null,
      }),
    ).toBe("completed");
    expect(
      deriveCalendarDayState({
        scheduledDays: [scheduledPush],
        completedSessions: [completed],
        activeSession: null,
      }),
    ).toBe("scheduled-and-completed");
    expect(
      deriveCalendarDayState({
        scheduledDays: [scheduledPush],
        completedSessions: [completed],
        activeSession: workout("active", null),
      }),
    ).toBe("training");
  });

  it("marca hoy y agrupa medianoche según Buenos Aires", () => {
    const frame = buildCalendarMonthFrame("2026-08");
    const days = buildCalendarDays({
      frame,
      todayDateKey: "2026-08-10",
      selectedDateKey: "2026-08-10",
      scheduledDays: [scheduledPush],
      completedSessions: [
        workout("late", "2026-08-10T02:30:00.000Z"),
        workout("after", "2026-08-10T03:30:00.000Z"),
      ],
      activeSession: null,
    });

    expect(
      days.find(({ dateKey }) => dateKey === "2026-08-09")?.completedSessions,
    ).toHaveLength(1);
    const today = days.find(({ dateKey }) => dateKey === "2026-08-10");
    expect(today).toMatchObject({
      isToday: true,
      isSelected: true,
      state: "scheduled-and-completed",
    });
    expect(today?.completedSessions).toHaveLength(1);
  });

  it("tolera varias sesiones y no inventa un plan sin weekdays", () => {
    const frame = buildCalendarMonthFrame("2026-08");
    const sessions = [
      workout("one", "2026-08-11T12:00:00.000Z"),
      workout("two", "2026-08-11T15:00:00.000Z", null),
    ];
    const days = buildCalendarDays({
      frame,
      todayDateKey: "2026-08-10",
      selectedDateKey: "2026-08-11",
      scheduledDays: [],
      completedSessions: sessions,
      activeSession: null,
    });
    const selected = days.find(({ isSelected }) => isSelected);

    expect(selected?.state).toBe("completed");
    expect(selected?.scheduledDays).toEqual([]);
    expect(selected?.completedSessions.map(({ id }) => id)).toEqual([
      "two",
      "one",
    ]);
  });

  it("muestra LIVE en el día local de una sesión activa", () => {
    const frame = buildCalendarMonthFrame("2026-08");
    const active = {
      ...workout("active", null),
      startedAt: "2026-08-10T02:30:00.000Z",
    };
    const days = buildCalendarDays({
      frame,
      todayDateKey: "2026-08-09",
      selectedDateKey: "2026-08-09",
      scheduledDays: [],
      completedSessions: [],
      activeSession: active,
    });
    expect(days.find(({ isSelected }) => isSelected)?.state).toBe("training");
  });
});
