import { APP_TIME_ZONE, getLocalDateKey } from "@/lib/date-time";
import type {
  CalendarDay,
  CalendarDayState,
  CalendarMonthFrame,
  CalendarScheduledDay,
  CalendarWorkout,
} from "./types";

const MONTH_KEY_PATTERN = /^(\d{4})-(\d{2})$/;
const DATE_KEY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

type CalendarDate = Readonly<{ year: number; month: number; day: number }>;

function dateKey(date: Date) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
}

function monthKey(date: Date) {
  return dateKey(date).slice(0, 7);
}

function dateFromParts({ year, month, day }: CalendarDate) {
  return new Date(Date.UTC(year, month - 1, day));
}

function parseMonthKey(value: string): CalendarDate | null {
  const match = MONTH_KEY_PATTERN.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  if (year < 2000 || year > 2100 || month < 1 || month > 12) return null;
  return { year, month, day: 1 };
}

function parseDateKey(value: string): CalendarDate | null {
  const match = DATE_KEY_PATTERN.exec(value);
  if (!match) return null;
  const parts = {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
  };
  const candidate = dateFromParts(parts);
  return dateKey(candidate) === value ? parts : null;
}

function addDays(value: Date, days: number) {
  return new Date(
    Date.UTC(
      value.getUTCFullYear(),
      value.getUTCMonth(),
      value.getUTCDate() + days,
    ),
  );
}

export function resolveCalendarMonthKey(
  candidate: string | string[] | undefined,
  todayDateKey: string,
) {
  const value = Array.isArray(candidate) ? candidate[0] : candidate;
  return value && parseMonthKey(value) ? value : todayDateKey.slice(0, 7);
}

export function resolveSelectedDateKey(
  candidate: string | string[] | undefined,
  month: CalendarMonthFrame,
  todayDateKey: string,
) {
  const value = Array.isArray(candidate) ? candidate[0] : candidate;
  if (value && parseDateKey(value) && value.startsWith(`${month.monthKey}-`)) {
    return value;
  }
  return todayDateKey.startsWith(`${month.monthKey}-`)
    ? todayDateKey
    : `${month.monthKey}-01`;
}

export function buildCalendarMonthFrame(
  monthValue: string,
): CalendarMonthFrame {
  const parsed = parseMonthKey(monthValue);
  if (!parsed) throw new Error("El mes del calendario no es valido.");

  const firstOfMonth = dateFromParts(parsed);
  const daysSinceMonday = (firstOfMonth.getUTCDay() + 6) % 7;
  const firstVisible = addDays(firstOfMonth, -daysSinceMonday);
  const firstOfNextMonth = new Date(Date.UTC(parsed.year, parsed.month, 1));
  const lastOfMonth = addDays(firstOfNextMonth, -1);
  const daysUntilSunday = (7 - lastOfMonth.getUTCDay()) % 7;
  const lastVisible = addDays(lastOfMonth, daysUntilSunday);
  const endVisible = addDays(lastVisible, 1);
  const dateKeys: string[] = [];

  for (
    let current = firstVisible;
    current < endVisible;
    current = addDays(current, 1)
  ) {
    dateKeys.push(dateKey(current));
  }

  return {
    monthKey: monthValue,
    monthLabel: new Intl.DateTimeFormat("es-AR", {
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }).format(firstOfMonth),
    previousMonthKey: monthKey(
      new Date(Date.UTC(parsed.year, parsed.month - 2, 1)),
    ),
    nextMonthKey: monthKey(firstOfNextMonth),
    firstDateKey: dateKey(firstVisible),
    endDateKey: dateKey(endVisible),
    dateKeys,
  };
}

export function deriveCalendarDayState(
  input: Readonly<{
    scheduledDays: readonly CalendarScheduledDay[];
    completedSessions: readonly CalendarWorkout[];
    activeSession: CalendarWorkout | null;
  }>,
): CalendarDayState {
  if (input.activeSession) return "training";

  if (input.completedSessions.length > 0) {
    const scheduledIds = new Set(input.scheduledDays.map(({ id }) => id));
    const matchesPlan = input.completedSessions.some(
      ({ routineDayId }) => routineDayId && scheduledIds.has(routineDayId),
    );
    return matchesPlan ? "scheduled-and-completed" : "completed";
  }

  return input.scheduledDays.length > 0 ? "scheduled" : "empty";
}

export function buildCalendarDays(
  input: Readonly<{
    frame: CalendarMonthFrame;
    todayDateKey: string;
    selectedDateKey: string;
    scheduledDays: readonly CalendarScheduledDay[];
    completedSessions: readonly CalendarWorkout[];
    activeSession: CalendarWorkout | null;
    timeZone?: string;
  }>,
): readonly CalendarDay[] {
  const timeZone = input.timeZone ?? APP_TIME_ZONE;
  const completedByDate = new Map<string, CalendarWorkout[]>();

  for (const session of input.completedSessions) {
    if (!session.completedAt) continue;
    const key = getLocalDateKey(session.completedAt, timeZone);
    const sessions = completedByDate.get(key) ?? [];
    sessions.push(session);
    completedByDate.set(key, sessions);
  }

  const activeDateKey = input.activeSession
    ? getLocalDateKey(input.activeSession.startedAt, timeZone)
    : null;

  return input.frame.dateKeys.map((key) => {
    const weekday = dateFromParts(parseDateKey(key)!).getUTCDay();
    const scheduledDays =
      key >= input.todayDateKey
        ? input.scheduledDays.filter((day) => day.weekday === weekday)
        : [];
    const completedSessions = (completedByDate.get(key) ?? []).sort(
      (left, right) =>
        Date.parse(right.completedAt ?? right.startedAt) -
        Date.parse(left.completedAt ?? left.startedAt),
    );
    const activeSession = activeDateKey === key ? input.activeSession : null;

    return {
      dateKey: key,
      dayNumber: Number(key.slice(-2)),
      inCurrentMonth: key.startsWith(`${input.frame.monthKey}-`),
      isToday: key === input.todayDateKey,
      isSelected: key === input.selectedDateKey,
      state: deriveCalendarDayState({
        scheduledDays,
        completedSessions,
        activeSession,
      }),
      scheduledDays,
      completedSessions,
      activeSession,
    };
  });
}

export function formatCalendarDayLabel(dateValue: string) {
  const parsed = parseDateKey(dateValue);
  if (!parsed) throw new Error("La fecha del calendario no es valida.");
  return new Intl.DateTimeFormat("es-AR", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  })
    .format(dateFromParts(parsed))
    .replaceAll(".", "")
    .toLocaleUpperCase("es-AR");
}

export function getCalendarDayAccessibleLabel(day: CalendarDay) {
  const parts = [formatCalendarDayLabel(day.dateKey)];
  if (day.isToday) parts.push("hoy");
  if (day.activeSession) parts.push("entrenamiento activo");
  if (day.completedSessions.length > 0) {
    parts.push(
      day.completedSessions.length === 1
        ? "un entrenamiento completado"
        : `${day.completedSessions.length} entrenamientos completados`,
    );
  }
  if (day.scheduledDays.length > 0) {
    parts.push(
      day.scheduledDays.length === 1
        ? "un entrenamiento programado"
        : `${day.scheduledDays.length} entrenamientos programados`,
    );
  }
  if (day.state === "empty") parts.push("sin entrenamiento");
  if (day.isSelected) parts.push("seleccionado");
  return parts.join(", ");
}
