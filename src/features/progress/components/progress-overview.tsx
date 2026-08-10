import Link from "next/link";
import { EmptyState } from "@/components/ui/empty-state";
import { Icon } from "@/components/ui/icon";
import { APP_TIME_ZONE, formatLocalDate } from "@/lib/date-time";
import { getProgressInterpretation } from "../domain";
import type {
  ProgressOverview as ProgressOverviewData,
  ProgressPeriod,
} from "../types";
import { ProgressExerciseList } from "./progress-exercise-list";

function formatWeekRange(start: string, end: string) {
  const endDate = new Date(Date.parse(end) - 1);
  const startLabel = formatLocalDate(start, APP_TIME_ZONE, {
    day: "numeric",
    month: "short",
  });
  const endLabel = formatLocalDate(endDate, APP_TIME_ZONE, {
    day: "numeric",
    month: "short",
  });
  return `${startLabel} – ${endLabel}`;
}

function formatDelta(delta: number) {
  if (delta === 0) return "Sin cambio";
  return `${delta > 0 ? "+" : ""}${delta}`;
}

export function ProgressOverview({
  overview,
  period,
}: Readonly<{
  overview: ProgressOverviewData;
  period: ProgressPeriod;
}>) {
  const interpretation = getProgressInterpretation(overview);

  if (overview.exercises.length === 0) {
    return (
      <EmptyState
        action={{ href: "/workout", label: "Entrenar" }}
        description="Finalizá una sesión con al menos una serie para empezar a construir evidencia de tu progreso."
        icon="progress"
        title="Todavía no hay progreso para mostrar"
      />
    );
  }

  return (
    <>
      <section
        aria-labelledby="progress-interpretation-title"
        className="border-y border-[#343731] py-7"
      >
        <p className="text-xs font-black uppercase text-[#f4cf3a]">
          Últimas 4 semanas
        </p>
        <h2
          className="mt-3 max-w-2xl text-2xl leading-tight font-black text-white sm:text-3xl"
          id="progress-interpretation-title"
        >
          {interpretation.title}
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#a9ada6]">
          {interpretation.description}
        </p>

        <dl className="mt-7 grid grid-cols-2 border-t border-[#292c28] sm:max-w-lg">
          <div className="py-5 pr-4">
            <dt className="text-xs font-bold uppercase text-[#858a82]">
              Sesiones
            </dt>
            <dd className="mt-2 text-3xl font-black tabular-nums text-white">
              {overview.currentSessionCount}
            </dd>
          </div>
          <div className="border-l border-[#292c28] px-4 py-5">
            <dt className="text-xs font-bold uppercase text-[#858a82]">
              vs. período anterior
            </dt>
            <dd className="mt-2 text-3xl font-black tabular-nums text-white">
              {formatDelta(overview.frequencyDelta)}
            </dd>
          </div>
        </dl>
      </section>

      <section aria-labelledby="weekly-consistency-title" className="mt-10">
        <p className="text-xs font-black uppercase text-[#858a82]">Evidencia</p>
        <h2
          className="mt-2 text-xl font-black text-white"
          id="weekly-consistency-title"
        >
          Frecuencia semanal
        </h2>
        <ol className="mt-5 grid grid-cols-2 border border-[#343731] sm:grid-cols-4">
          {period.weeks.map((week, index) => (
            <li
              className="border-[#343731] p-4 even:border-l sm:border-l sm:first:border-l-0"
              key={week.start}
            >
              <span className="block text-2xl font-black tabular-nums text-white">
                {overview.weeklySessionCounts[index]}
              </span>
              <span className="mt-1 block text-xs font-bold text-[#858a82]">
                {formatWeekRange(week.start, week.end)}
              </span>
            </li>
          ))}
        </ol>
      </section>

      {overview.improvements.length > 0 ? (
        <section aria-labelledby="recent-improvements-title" className="mt-10">
          <h2
            className="text-xs font-black uppercase text-[#858a82]"
            id="recent-improvements-title"
          >
            Mejoras recientes
          </h2>
          <ul className="mt-4 divide-y divide-[#343731] border-y border-[#343731]">
            {overview.improvements.slice(0, 3).map((exercise) => (
              <li
                className="flex min-h-14 items-center justify-between gap-4 py-3"
                key={exercise.exerciseId}
              >
                <span className="text-sm font-bold text-white">
                  {exercise.exerciseName}
                </span>
                <span className="shrink-0 text-xs font-black text-[#f4cf3a]">
                  {exercise.improvement?.label}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <ProgressExerciseList exercises={overview.exercises} />

      <Link
        className="group mt-10 flex min-h-16 items-center justify-between gap-4 border-y border-[#343731] px-1 text-sm font-black text-white outline-none hover:text-[#f4cf3a] focus-visible:border-[#f4cf3a]"
        href="/history"
      >
        Ver historial completo
        <Icon
          className="size-5 text-[#858a82] group-hover:text-[#f4cf3a]"
          name="arrow-right"
        />
      </Link>
    </>
  );
}
