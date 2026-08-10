import Link from "next/link";
import { formatDuration } from "@/features/workouts/domain";
import {
  formatHistoryDetailDate,
  formatHistoryTime,
  getCompletedSetCount,
  getHistoricalExerciseResult,
  getHistoryDurationSeconds,
  getPrimaryMuscleSummary,
} from "../domain";
import type { CompletedWorkoutHistory } from "../types";
import { HistoricalExerciseResult } from "./historical-exercise-result";

export function HistoryDetail({
  history,
}: Readonly<{ history: CompletedWorkoutHistory }>) {
  const { session, previousByExercise } = history;
  const setCount = getCompletedSetCount(session.exercises);
  const muscles = getPrimaryMuscleSummary(session.exercises);
  const exerciseResults = session.exercises.map((exercise) =>
    getHistoricalExerciseResult(
      exercise,
      previousByExercise[exercise.exerciseId],
    ),
  );

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-7 sm:px-8 sm:py-10 lg:py-14">
      <Link
        className="inline-flex min-h-11 items-center text-sm font-bold text-[#a9ada6] hover:text-white"
        href="/history"
      >
        Volver al historial
      </Link>

      <header className="mt-7 max-w-3xl">
        <p className="text-xs font-black uppercase text-[#858a82]">
          {session.routineName}
        </p>
        <h1 className="mt-3 text-4xl leading-none font-black uppercase text-white sm:text-6xl">
          {session.dayName}
        </h1>
        <p className="mt-5 text-sm font-bold text-[#a9ada6]">
          <time dateTime={session.completedAt}>
            {formatHistoryDetailDate(session.completedAt)} ·{" "}
            {formatHistoryTime(session.completedAt)}
          </time>
        </p>
      </header>

      <dl
        aria-label="Resumen del entrenamiento"
        className="mt-8 grid grid-cols-2 border-y border-[#292c28] sm:grid-cols-3"
      >
        <div className="py-5 pr-4">
          <dt className="text-xs font-bold uppercase text-[#858a82]">
            Duración
          </dt>
          <dd className="mt-2 text-xl font-black tabular-nums text-white">
            {formatDuration(
              getHistoryDurationSeconds(session.startedAt, session.completedAt),
            )}
          </dd>
        </div>
        <div className="border-l border-[#292c28] px-4 py-5">
          <dt className="text-xs font-bold uppercase text-[#858a82]">Series</dt>
          <dd className="mt-2 text-xl font-black tabular-nums text-white">
            {setCount}
          </dd>
        </div>
        {muscles.length > 0 ? (
          <div className="col-span-2 border-t border-[#292c28] py-5 sm:col-span-1 sm:border-t-0 sm:border-l sm:pl-4">
            <dt className="text-xs font-bold uppercase text-[#858a82]">
              Músculos
            </dt>
            <dd className="mt-2 text-sm font-black text-white">
              {muscles.join(" · ")}
            </dd>
          </div>
        ) : null}
      </dl>

      <section aria-labelledby="history-results-title" className="mt-12">
        <h2
          className="text-xs font-black uppercase text-[#858a82]"
          id="history-results-title"
        >
          Ejercicios realizados
        </h2>
        <ol className="mt-6 divide-y divide-[#343731]">
          {exerciseResults.map((result) => (
            <HistoricalExerciseResult
              key={result.exercise.id}
              result={result}
            />
          ))}
        </ol>
      </section>
    </div>
  );
}
