import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TrainingCalendar } from "@/features/calendar/components/training-calendar";
import {
  buildCalendarDays,
  buildCalendarMonthFrame,
} from "@/features/calendar/domain";
import type {
  CalendarPageModel,
  CalendarScheduledDay,
  CalendarWorkout,
} from "@/features/calendar/types";

vi.mock("@/features/workouts/actions", () => ({
  startWorkoutAction: vi.fn(),
}));

const scheduledDay: CalendarScheduledDay = {
  id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
  name: "Push",
  position: 0,
  weekday: 1,
  exerciseCount: 6,
  primaryMuscleGroups: ["Pecho", "Hombros", "Tríceps"],
};

const completedWorkout: CalendarWorkout = {
  id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  routineDayId: scheduledDay.id,
  routineName: "Push Pull",
  dayName: "Push",
  startedAt: "2026-08-10T12:00:00.000Z",
  completedAt: "2026-08-10T13:04:00.000Z",
  status: "completed",
  completedSetCount: 22,
};

function calendarModel(
  options: Readonly<{
    selectedDateKey?: string;
    scheduledDays?: readonly CalendarScheduledDay[];
    completedSessions?: readonly CalendarWorkout[];
    activeSession?: CalendarWorkout | null;
    hasActiveRoutine?: boolean;
  }> = {},
): CalendarPageModel {
  const frame = buildCalendarMonthFrame("2026-08");
  const selectedDateKey = options.selectedDateKey ?? "2026-08-10";
  const activeSession = options.activeSession ?? null;
  const completedSessions = options.completedSessions ?? [];
  const days = buildCalendarDays({
    frame,
    todayDateKey: "2026-08-10",
    selectedDateKey,
    scheduledDays: options.scheduledDays ?? [],
    completedSessions,
    activeSession,
  });
  const selectedDay = days.find(({ isSelected }) => isSelected)!;

  return {
    month: {
      monthKey: frame.monthKey,
      monthLabel: frame.monthLabel,
      previousMonthKey: frame.previousMonthKey,
      nextMonthKey: frame.nextMonthKey,
      visibleStartDateKey: frame.firstDateKey,
      visibleEndDateKey: frame.endDateKey,
      selectedDateKey,
      todayDateKey: "2026-08-10",
      days,
    },
    selectedDay,
    activeSession,
    scheduleStatus: options.scheduledDays?.length ? "complete" : "none",
    hasActiveRoutine: options.hasActiveRoutine ?? false,
    hasAnyWorkout: completedSessions.length > 0 || Boolean(activeSession),
  };
}

describe("componentes del calendario", () => {
  it("muestra calendario vacío, hoy y CTA de rutina", () => {
    render(<TrainingCalendar model={calendarModel()} />);

    expect(
      screen.getByRole("heading", { name: "agosto de 2026" }),
    ).toBeVisible();
    expect(screen.getByRole("link", { name: /10 ago, hoy/i })).toHaveAttribute(
      "aria-current",
      "date",
    );
    expect(screen.getByText("No hay entrenamientos todavía")).toBeVisible();
    expect(screen.getByRole("link", { name: "Crear rutina" })).toHaveAttribute(
      "href",
      "/routines/new",
    );
  });

  it("navega meses y conserva la selección en enlaces", () => {
    render(<TrainingCalendar model={calendarModel()} />);

    expect(screen.getByRole("link", { name: "Mes anterior" })).toHaveAttribute(
      "href",
      "/calendar?month=2026-07",
    );
    expect(screen.getByRole("link", { name: "Mes siguiente" })).toHaveAttribute(
      "href",
      "/calendar?month=2026-09",
    );
    expect(screen.getByRole("link", { name: "Volver a hoy" })).toHaveAttribute(
      "href",
      "/calendar?month=2026-08&day=2026-08-10",
    );
  });

  it("presenta un día programado y permite entrenar", () => {
    render(
      <TrainingCalendar
        model={calendarModel({
          scheduledDays: [scheduledDay],
          hasActiveRoutine: true,
        })}
      />,
    );

    expect(screen.getAllByText("Programado")[0]).toBeVisible();
    expect(screen.getByText("Pecho · Hombros · Tríceps")).toBeVisible();
    expect(screen.getByText("6 ejercicios")).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Empezar entrenamiento" }),
    ).toBeVisible();
  });

  it("presenta completado, duración, series y CTA History", () => {
    render(
      <TrainingCalendar
        model={calendarModel({
          completedSessions: [completedWorkout],
          scheduledDays: [scheduledDay],
          hasActiveRoutine: true,
        })}
      />,
    );

    expect(screen.getByText("Plan realizado")).toBeVisible();
    expect(screen.getByText("1 h 04 min")).toBeVisible();
    expect(screen.getByText("Series").parentElement).toHaveTextContent("22");
    expect(
      screen.getByRole("link", { name: "Ver entrenamiento" }),
    ).toHaveAttribute("href", `/history/${completedWorkout.id}`);
    expect(
      screen.queryByRole("button", { name: "Empezar entrenamiento" }),
    ).not.toBeInTheDocument();
  });

  it("prioriza LIVE y sólo permite continuar", () => {
    const activeSession = {
      ...completedWorkout,
      id: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
      completedAt: null,
      status: "in_progress" as const,
      completedSetCount: 1,
    };
    render(
      <TrainingCalendar
        model={calendarModel({
          scheduledDays: [scheduledDay],
          activeSession,
          hasActiveRoutine: true,
        })}
      />,
    );

    expect(screen.getByText("Entrenamiento activo")).toBeVisible();
    expect(screen.getByText("1 serie registrada")).toBeVisible();
    expect(screen.getAllByRole("link", { name: /Continuar/ })).toHaveLength(1);
    expect(screen.getByRole("link", { name: "Continuar" })).toHaveAttribute(
      "href",
      `/workout/${activeSession.id}`,
    );
    expect(
      screen.queryByRole("button", { name: "Empezar entrenamiento" }),
    ).not.toBeInTheDocument();
  });

  it("comunica selección y varias sesiones sin perder ninguna", () => {
    const second = {
      ...completedWorkout,
      id: "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
      routineDayId: null,
      dayName: "Piernas",
      completedAt: "2026-08-10T15:00:00.000Z",
    };
    const model = calendarModel({
      completedSessions: [completedWorkout, second],
    });
    render(<TrainingCalendar model={model} />);

    expect(screen.getByText("2 entrenamientos completados")).toBeVisible();
    expect(
      screen.getAllByRole("link", { name: "Ver entrenamiento" }),
    ).toHaveLength(2);
    expect(
      screen.getByRole("link", { name: /10 ago.*seleccionado/i }),
    ).toHaveAttribute("data-selected", "true");
  });
});
