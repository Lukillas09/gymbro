import Link from "next/link";
import { buildWorkoutSummary, formatDuration } from "../domain";
import type { PreviousPerformanceByExercise, WorkoutSession } from "../types";

type WorkoutSummaryProps = Readonly<{
  session: WorkoutSession;
  previousByExercise: PreviousPerformanceByExercise;
}>;

export function WorkoutSummary({
  session,
  previousByExercise,
}: WorkoutSummaryProps) {
  const summary = buildWorkoutSummary(
    session,
    previousByExercise,
    Date.parse(session.completedAt ?? session.startedAt),
  );

  return (
    <main className="mx-auto grid min-h-[calc(100dvh-4rem)] w-full max-w-3xl content-start gap-10 px-5 py-10 sm:px-8">
      <header>
        <p className="text-sm font-black uppercase text-[#f4cf3a]">
          Entrenamiento completado
        </p>
        <h1 className="mt-2 text-4xl font-black uppercase text-white sm:text-5xl">
          {session.dayName}
        </h1>
      </header>

      <section
        aria-label="Resumen factual"
        className="grid grid-cols-2 gap-px overflow-hidden rounded-md bg-[#2a2d29]"
      >
        <div className="bg-[#111310] p-5">
          <p className="text-xs font-bold uppercase text-[#8f948c]">Duración</p>
          <p className="mt-2 text-xl font-black tabular-nums text-white">
            {formatDuration(summary.durationSeconds)}
          </p>
        </div>
        <div className="bg-[#111310] p-5">
          <p className="text-xs font-bold uppercase text-[#8f948c]">Series</p>
          <p className="mt-2 text-xl font-black tabular-nums text-white">
            {summary.completedSetCount}
          </p>
        </div>
      </section>

      {summary.primaryMuscleGroups.length > 0 ? (
        <section aria-labelledby="summary-muscles-title">
          <h2
            className="text-xs font-bold uppercase text-[#8f948c]"
            id="summary-muscles-title"
          >
            Músculos principales
          </h2>
          <p className="mt-3 text-lg font-extrabold text-white">
            {summary.primaryMuscleGroups.join(" · ")}
          </p>
        </section>
      ) : null}

      {summary.improvements.length > 0 ? (
        <section aria-labelledby="summary-improvements-title">
          <h2
            className="text-xs font-bold uppercase text-[#8f948c]"
            id="summary-improvements-title"
          >
            Mejoras
          </h2>
          <ul className="mt-3 divide-y divide-[#292c28] border-y border-[#292c28]">
            {summary.improvements.map((improvement) => (
              <li
                className="flex items-center justify-between gap-4 py-4"
                key={improvement.exerciseName}
              >
                <span className="font-bold text-white">
                  {improvement.exerciseName}
                </span>
                <span className="font-black text-[#f4cf3a]">
                  ↑ {improvement.label}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <Link
        className="inline-flex min-h-12 items-center justify-center rounded-md bg-[#f4cf3a] px-5 text-sm font-black text-[#11120f] hover:bg-[#ffdc4f]"
        href="/"
      >
        Volver al inicio
      </Link>
    </main>
  );
}
