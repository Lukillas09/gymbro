import Link from "next/link";
import { EmptyState } from "@/components/ui/empty-state";
import {
  formatDuration,
  getWorkoutDurationSeconds,
} from "@/features/workouts/domain";
import { formatCalendarDayLabel } from "../domain";
import type { CalendarPageModel, CalendarScheduledDay } from "../types";
import { CalendarStartButton } from "./calendar-start-button";

function CompletedSession({
  session,
}: Readonly<{
  session: CalendarPageModel["selectedDay"]["completedSessions"][number];
}>) {
  if (!session.completedAt) return null;

  return (
    <article className="border-t border-[#343731] py-6 first:border-t-0 first:pt-0">
      <p className="text-xs font-black uppercase text-[#b9bdb6]">Completado</p>
      <h3 className="mt-2 text-2xl font-black uppercase text-white">
        {session.dayName}
      </h3>
      <p className="mt-2 text-sm font-bold text-[#858a82]">
        {session.routineName}
      </p>
      <dl className="mt-5 grid grid-cols-2 border-y border-[#292c28]">
        <div className="py-4 pr-3">
          <dt className="text-xs font-bold uppercase text-[#858a82]">
            Duración
          </dt>
          <dd className="mt-1 font-black tabular-nums text-white">
            {formatDuration(
              getWorkoutDurationSeconds(session.startedAt, session.completedAt),
            )}
          </dd>
        </div>
        <div className="border-l border-[#292c28] px-3 py-4">
          <dt className="text-xs font-bold uppercase text-[#858a82]">Series</dt>
          <dd className="mt-1 font-black tabular-nums text-white">
            {session.completedSetCount}
          </dd>
        </div>
      </dl>
      <Link
        className="mt-5 flex min-h-12 items-center justify-center rounded-md border border-[#52564e] px-4 text-sm font-black text-white outline-none hover:border-white focus-visible:border-[#f4cf3a]"
        href={`/history/${session.id}`}
      >
        Ver entrenamiento
      </Link>
    </article>
  );
}

function ScheduledDay({
  day,
  activeSessionId,
  isMatched,
  hideAction,
}: Readonly<{
  day: CalendarScheduledDay;
  activeSessionId: string | null;
  isMatched: boolean;
  hideAction: boolean;
}>) {
  return (
    <article className="border-t border-[#343731] py-6 first:border-t-0 first:pt-0">
      <p className="text-xs font-black uppercase text-[#f4cf3a]">
        {isMatched ? "Plan realizado" : "Programado"}
      </p>
      <h3 className="mt-2 text-2xl font-black uppercase text-white">
        {day.name}
      </h3>
      {day.primaryMuscleGroups.length > 0 ? (
        <p className="mt-3 text-sm font-bold text-[#b8bcb5]">
          {day.primaryMuscleGroups.join(" · ")}
        </p>
      ) : null}
      <p className="mt-2 text-sm text-[#92978f]">
        {day.exerciseCount === 1
          ? "1 ejercicio"
          : `${day.exerciseCount} ejercicios`}
      </p>

      {hideAction ? null : activeSessionId ? (
        <Link
          className="mt-5 flex min-h-12 items-center justify-center rounded-md bg-[#f4cf3a] px-4 text-sm font-black text-[#11120f] outline-none hover:bg-[#ffdc4f] focus-visible:ring-2 focus-visible:ring-white"
          href={`/workout/${activeSessionId}`}
        >
          Continuar entrenamiento
        </Link>
      ) : isMatched ? null : (
        <CalendarStartButton routineDayId={day.id} />
      )}
    </article>
  );
}

export function CalendarDayDetail({
  model,
}: Readonly<{ model: CalendarPageModel }>) {
  const { selectedDay, activeSession } = model;
  const hasSelectedContent =
    Boolean(selectedDay.activeSession) ||
    selectedDay.completedSessions.length > 0 ||
    selectedDay.scheduledDays.length > 0;

  if (!hasSelectedContent && !model.hasActiveRoutine && !model.hasAnyWorkout) {
    return (
      <EmptyState
        action={{ href: "/routines/new", label: "Crear rutina" }}
        description="Creá una rutina o completá tu primer entrenamiento para empezar a construir esta línea temporal."
        icon="progress"
        title="No hay entrenamientos todavía"
      />
    );
  }

  return (
    <section aria-labelledby="selected-day-title" aria-live="polite">
      <p className="text-xs font-black uppercase text-[#858a82]">
        {selectedDay.isToday ? "Hoy · " : ""}
        {formatCalendarDayLabel(selectedDay.dateKey)}
      </p>
      <h2 className="sr-only" id="selected-day-title">
        Detalle del día seleccionado
      </h2>

      {selectedDay.activeSession ? (
        <article className="pb-6">
          <p className="text-xs font-black uppercase text-[#f4cf3a]">
            Entrenamiento activo
          </p>
          <h3 className="mt-2 text-2xl font-black uppercase text-white">
            {selectedDay.activeSession.dayName}
          </h3>
          <p className="mt-2 text-sm font-bold text-[#92978f]">
            {selectedDay.activeSession.completedSetCount === 1
              ? "1 serie registrada"
              : `${selectedDay.activeSession.completedSetCount} series registradas`}
          </p>
          <Link
            className="mt-5 flex min-h-12 items-center justify-center rounded-md bg-[#f4cf3a] px-4 text-sm font-black text-[#11120f] outline-none hover:bg-[#ffdc4f] focus-visible:ring-2 focus-visible:ring-white"
            href={`/workout/${selectedDay.activeSession.id}`}
          >
            Continuar
          </Link>
        </article>
      ) : null}

      {selectedDay.completedSessions.length > 1 ? (
        <p className="mb-5 text-sm font-bold text-[#b8bcb5]">
          {selectedDay.completedSessions.length} entrenamientos completados
        </p>
      ) : null}

      {selectedDay.completedSessions.map((session) => (
        <CompletedSession key={session.id} session={session} />
      ))}

      {selectedDay.scheduledDays.map((day) => {
        const isMatched = selectedDay.completedSessions.some(
          ({ routineDayId }) => routineDayId === day.id,
        );
        return (
          <ScheduledDay
            activeSessionId={activeSession?.id ?? null}
            day={day}
            hideAction={Boolean(selectedDay.activeSession)}
            isMatched={isMatched}
            key={day.id}
          />
        );
      })}

      {!hasSelectedContent ? (
        <div className="border-y border-[#343731] py-8">
          <p className="text-lg font-black text-white">
            Sin entrenamiento registrado o programado
          </p>
          <p className="mt-2 text-sm leading-6 text-[#92978f]">
            Elegí otra fecha para revisar tu planificación o tu historial.
          </p>
          {activeSession ? (
            <Link
              className="mt-5 inline-flex min-h-11 items-center font-black text-[#f4cf3a] outline-none focus-visible:underline"
              href={`/workout/${activeSession.id}`}
            >
              Continuar entrenamiento
            </Link>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
