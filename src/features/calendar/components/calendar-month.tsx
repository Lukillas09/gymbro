import Link from "next/link";
import { getCalendarDayAccessibleLabel } from "../domain";
import type { CalendarDay, CalendarMonth as CalendarMonthData } from "../types";

const WEEKDAY_LABELS = ["L", "M", "X", "J", "V", "S", "D"] as const;

function calendarHref(monthKey: string, dayKey: string) {
  return `/calendar?month=${monthKey}&day=${dayKey}`;
}

function dayHref(day: CalendarDay) {
  return calendarHref(day.dateKey.slice(0, 7), day.dateKey);
}

function DayMarkers({ day }: Readonly<{ day: CalendarDay }>) {
  if (day.state === "training") {
    return (
      <span
        aria-hidden="true"
        className="mt-1 text-[0.5625rem] leading-none font-black text-[#f4cf3a]"
      >
        LIVE
      </span>
    );
  }

  return (
    <span
      aria-hidden="true"
      className="mt-1 flex h-3 items-center justify-center gap-1 text-[0.6875rem] leading-none"
    >
      {day.completedSessions.length > 0 ? (
        <span className="font-black text-white">✓</span>
      ) : null}
      {day.scheduledDays.length > 0 ? (
        <span className="text-[#f4cf3a]">●</span>
      ) : null}
    </span>
  );
}

export function CalendarMonth({
  month,
}: Readonly<{ month: CalendarMonthData }>) {
  return (
    <section aria-labelledby="calendar-month-title">
      <div className="flex items-center justify-between gap-3">
        <Link
          aria-label="Mes anterior"
          className="grid min-h-11 min-w-11 place-items-center rounded-md border border-[#343731] text-xl text-white outline-none hover:border-[#777c73] focus-visible:border-[#f4cf3a]"
          href={`/calendar?month=${month.previousMonthKey}`}
          title="Mes anterior"
        >
          <span aria-hidden="true">←</span>
        </Link>
        <h2
          className="text-center text-xl font-black capitalize text-white"
          id="calendar-month-title"
        >
          {month.monthLabel}
        </h2>
        <Link
          aria-label="Mes siguiente"
          className="grid min-h-11 min-w-11 place-items-center rounded-md border border-[#343731] text-xl text-white outline-none hover:border-[#777c73] focus-visible:border-[#f4cf3a]"
          href={`/calendar?month=${month.nextMonthKey}`}
          title="Mes siguiente"
        >
          <span aria-hidden="true">→</span>
        </Link>
      </div>

      <div className="mt-4 flex justify-center">
        <Link
          className="inline-flex min-h-11 items-center px-3 text-sm font-extrabold text-[#c5c9c2] outline-none hover:text-white focus-visible:text-[#f4cf3a]"
          href={calendarHref(
            month.todayDateKey.slice(0, 7),
            month.todayDateKey,
          )}
        >
          Volver a hoy
        </Link>
      </div>

      <div
        aria-hidden="true"
        className="mt-3 grid grid-cols-7 text-center text-[0.6875rem] font-black text-[#858a82]"
      >
        {WEEKDAY_LABELS.map((label) => (
          <span className="py-2" key={label}>
            {label}
          </span>
        ))}
      </div>

      <ol
        aria-label={`Calendario de ${month.monthLabel}`}
        className="grid grid-cols-7 overflow-hidden rounded-md border border-[#343731] bg-[#343731]"
      >
        {month.days.map((day) => {
          const selectedStyles = day.isSelected
            ? "bg-[#292b26] text-white ring-2 ring-inset ring-[#f4cf3a]"
            : day.inCurrentMonth
              ? "bg-[#111310] text-white hover:bg-[#1d201b]"
              : "bg-[#0d0f0d] text-[#666b64] hover:bg-[#171916]";
          const todayStyles = day.isToday
            ? "font-black underline decoration-2 underline-offset-4"
            : "font-bold";

          return (
            <li
              className="min-w-0 border-r border-b border-[#343731]"
              key={day.dateKey}
            >
              <Link
                aria-current={day.isToday ? "date" : undefined}
                aria-label={getCalendarDayAccessibleLabel(day)}
                className={`flex min-h-12 w-full flex-col items-center justify-center outline-none focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#f4cf3a] ${selectedStyles}`}
                data-calendar-day={day.dateKey}
                data-calendar-state={day.state}
                data-selected={day.isSelected ? "true" : "false"}
                href={dayHref(day)}
              >
                <time
                  className={`text-sm leading-none tabular-nums ${todayStyles}`}
                  dateTime={day.dateKey}
                >
                  {day.dayNumber}
                </time>
                <DayMarkers day={day} />
              </Link>
            </li>
          );
        })}
      </ol>

      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs font-bold text-[#989d95]">
        <span>
          <span aria-hidden="true" className="mr-2 text-[#f4cf3a]">
            ●
          </span>
          Programado
        </span>
        <span>
          <span aria-hidden="true" className="mr-2 font-black text-white">
            ✓
          </span>
          Completado
        </span>
        <span>
          <span className="mr-2 text-[0.625rem] font-black text-[#f4cf3a]">
            LIVE
          </span>
          En curso
        </span>
      </div>
    </section>
  );
}
