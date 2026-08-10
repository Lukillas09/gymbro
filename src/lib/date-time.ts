export const APP_TIME_ZONE = "America/Argentina/Buenos_Aires";

type ZonedCalendarDate = Readonly<{
  year: number;
  month: number;
  day: number;
}>;

const LOCAL_DATE_KEY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

const datePartFormatters = new Map<string, Intl.DateTimeFormat>();

function getDatePartFormatter(timeZone: string) {
  const existing = datePartFormatters.get(timeZone);
  if (existing) return existing;

  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });
  datePartFormatters.set(timeZone, formatter);
  return formatter;
}

function numericPart(parts: Intl.DateTimeFormatPart[], type: string) {
  const value = parts.find((part) => part.type === type)?.value;
  if (!value) throw new Error(`No pudimos resolver la fecha local: ${type}.`);
  return Number(value);
}

function getZonedParts(date: Date, timeZone: string) {
  const parts = getDatePartFormatter(timeZone).formatToParts(date);
  return {
    year: numericPart(parts, "year"),
    month: numericPart(parts, "month"),
    day: numericPart(parts, "day"),
    hour: numericPart(parts, "hour"),
    minute: numericPart(parts, "minute"),
    second: numericPart(parts, "second"),
  };
}

function calendarDate(date: Date, timeZone: string): ZonedCalendarDate {
  const { year, month, day } = getZonedParts(date, timeZone);
  return { year, month, day };
}

function addCalendarDays(date: ZonedCalendarDate, days: number) {
  const shifted = new Date(
    Date.UTC(date.year, date.month - 1, date.day + days),
  );
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate(),
  } satisfies ZonedCalendarDate;
}

function zonedMidnightToUtc(date: ZonedCalendarDate, timeZone: string) {
  const target = Date.UTC(date.year, date.month - 1, date.day);
  let candidate = target;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const parts = getZonedParts(new Date(candidate), timeZone);
    const representedAsUtc = Date.UTC(
      parts.year,
      parts.month - 1,
      parts.day,
      parts.hour,
      parts.minute,
      parts.second,
    );
    candidate = target - (representedAsUtc - candidate);
  }

  return new Date(candidate);
}

function asDate(value: Date | string) {
  return typeof value === "string" ? new Date(value) : value;
}

function parseLocalDateKey(value: string): ZonedCalendarDate {
  const match = LOCAL_DATE_KEY_PATTERN.exec(value);
  if (!match) throw new Error("La fecha local no tiene un formato valido.");

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const candidate = new Date(Date.UTC(year, month - 1, day));

  if (
    candidate.getUTCFullYear() !== year ||
    candidate.getUTCMonth() + 1 !== month ||
    candidate.getUTCDate() !== day
  ) {
    throw new Error("La fecha local no existe.");
  }

  return { year, month, day };
}

export function getLocalDateKey(value: Date | string, timeZone: string) {
  const { year, month, day } = calendarDate(asDate(value), timeZone);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function getLocalWeekday(value: Date | string, timeZone: string) {
  const local = calendarDate(asDate(value), timeZone);
  return new Date(Date.UTC(local.year, local.month - 1, local.day)).getUTCDay();
}

export function getLocalWeekRange(now: Date, timeZone: string) {
  const local = calendarDate(now, timeZone);
  const weekday = getLocalWeekday(now, timeZone);
  const daysSinceMonday = (weekday + 6) % 7;
  const start = addCalendarDays(local, -daysSinceMonday);
  const end = addCalendarDays(start, 7);

  return {
    start: zonedMidnightToUtc(start, timeZone).toISOString(),
    end: zonedMidnightToUtc(end, timeZone).toISOString(),
  };
}

export function getLocalDayRange(now: Date, timeZone: string) {
  const start = calendarDate(now, timeZone);
  return {
    start: zonedMidnightToUtc(start, timeZone).toISOString(),
    end: zonedMidnightToUtc(addCalendarDays(start, 1), timeZone).toISOString(),
  };
}

export function getLocalRollingDayRange(
  now: Date,
  timeZone: string,
  dayCount: number,
  offsetDays = 0,
) {
  if (!Number.isInteger(dayCount) || dayCount <= 0) {
    throw new Error("La cantidad de días debe ser un entero positivo.");
  }
  if (!Number.isInteger(offsetDays) || offsetDays < 0) {
    throw new Error("El desplazamiento debe ser un entero no negativo.");
  }

  const today = calendarDate(now, timeZone);
  const end = addCalendarDays(today, 1 - offsetDays);
  const start = addCalendarDays(end, -dayCount);

  return {
    start: zonedMidnightToUtc(start, timeZone).toISOString(),
    end: zonedMidnightToUtc(end, timeZone).toISOString(),
  };
}

export function getLocalDateKeyRange(
  startDateKey: string,
  endDateKey: string,
  timeZone: string,
) {
  const start = parseLocalDateKey(startDateKey);
  const end = parseLocalDateKey(endDateKey);
  const startUtc = zonedMidnightToUtc(start, timeZone);
  const endUtc = zonedMidnightToUtc(end, timeZone);

  if (startUtc >= endUtc) {
    throw new Error("El rango local debe finalizar despues de comenzar.");
  }

  return { start: startUtc.toISOString(), end: endUtc.toISOString() };
}

export function formatLocalDate(
  value: Date | string,
  timeZone: string,
  options: Intl.DateTimeFormatOptions,
) {
  return new Intl.DateTimeFormat("es-AR", { ...options, timeZone })
    .format(asDate(value))
    .replaceAll(".", "");
}
