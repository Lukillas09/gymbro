import Link from "next/link";
import { formatWeight } from "@/features/workouts/domain";
import { APP_TIME_ZONE, formatLocalDate } from "@/lib/date-time";
import type { ExerciseProgressDetail as ExerciseProgressDetailData } from "../types";

function formatProgressDate(value: string) {
  return formatLocalDate(value, APP_TIME_ZONE, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatSet(weightKg: number, repetitions: number) {
  return `${formatWeight(weightKg)} × ${repetitions}`;
}

export function ExerciseProgressDetail({
  detail,
}: Readonly<{ detail: ExerciseProgressDetailData }>) {
  const latestSet = detail.latest.representativeSet;
  const record = detail.personalRecord;

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-7 sm:px-8 sm:py-10 lg:py-14">
      <Link
        className="inline-flex min-h-11 items-center text-sm font-bold text-[#a9ada6] outline-none hover:text-white focus-visible:text-[#f4cf3a]"
        href="/progress"
      >
        Volver a Progreso
      </Link>

      <header className="mt-7 max-w-3xl">
        <p className="text-xs font-black uppercase text-[#858a82]">
          Evolución por ejercicio
        </p>
        <h1 className="mt-3 text-3xl leading-tight font-black text-white sm:text-5xl">
          {detail.exerciseName}
        </h1>
        <p className="mt-4 text-sm leading-6 text-[#a9ada6]">
          Comparaciones entre sesiones finalizadas, sin estimaciones de fuerza.
        </p>
      </header>

      <dl
        aria-label="Resumen del ejercicio"
        className="mt-8 grid grid-cols-2 border-y border-[#292c28] sm:grid-cols-3"
      >
        <div className="py-5 pr-4">
          <dt className="text-xs font-bold uppercase text-[#858a82]">
            Sesiones
          </dt>
          <dd className="mt-2 text-2xl font-black tabular-nums text-white">
            {detail.sessionCount}
          </dd>
        </div>
        <div className="border-l border-[#292c28] px-4 py-5">
          <dt className="text-xs font-bold uppercase text-[#858a82]">
            Último registro
          </dt>
          <dd className="mt-2 text-base font-black text-white">
            {formatSet(latestSet.weightKg, latestSet.repetitions)}
          </dd>
        </div>
        <div className="col-span-2 border-t border-[#292c28] py-5 sm:col-span-1 sm:border-t-0 sm:border-l sm:pl-4">
          <dt className="text-xs font-bold uppercase text-[#858a82]">
            PR de peso
          </dt>
          <dd className="mt-2 text-base font-black text-white">
            {record
              ? formatSet(record.set.weightKg, record.set.repetitions)
              : "Sin registro válido"}
          </dd>
        </div>
      </dl>

      <section aria-labelledby="evolution-title" className="mt-12">
        <p className="text-xs font-black uppercase text-[#858a82]">Evidencia</p>
        <h2
          className="mt-2 text-2xl font-black text-white"
          id="evolution-title"
        >
          Sesiones recientes
        </h2>
        <ol className="mt-6 divide-y divide-[#343731] border-y border-[#343731]">
          {detail.performances.map((performance) => (
            <li key={performance.sessionId}>
              <Link
                aria-label={`Ver entrenamiento del ${formatProgressDate(performance.completedAt)}`}
                className="group flex min-h-20 items-center justify-between gap-4 px-1 py-4 outline-none focus-visible:bg-[#171916]"
                href={`/history/${performance.sessionId}`}
              >
                <span>
                  <time
                    className="block text-sm font-black text-white group-hover:text-[#f4cf3a]"
                    dateTime={performance.completedAt}
                  >
                    {formatProgressDate(performance.completedAt)}
                  </time>
                  <span className="mt-1 block text-sm text-[#a9ada6]">
                    {formatSet(
                      performance.representativeSet.weightKg,
                      performance.representativeSet.repetitions,
                    )}
                  </span>
                </span>
                {performance.comparison ? (
                  <span className="shrink-0 text-xs font-black text-[#f4cf3a]">
                    {performance.comparison.label}
                  </span>
                ) : (
                  <span className="shrink-0 text-xs font-bold text-[#858a82]">
                    Sin comparación directa
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ol>
        {detail.hasMore ? (
          <p className="mt-4 text-sm text-[#858a82]">
            Se muestran las 12 sesiones más recientes.
          </p>
        ) : null}
      </section>
    </div>
  );
}
