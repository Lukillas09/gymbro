import type { HistoricalExerciseResult as ExerciseResult } from "../types";
import { HistoricalSetRow } from "./historical-set-row";

export function HistoricalExerciseResult({
  result,
}: Readonly<{ result: ExerciseResult }>) {
  const { exercise, improvement } = result;
  const completedSets = exercise.sets.length;

  return (
    <li className="py-8 first:pt-0">
      <article aria-labelledby={`history-exercise-${exercise.id}`}>
        <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-[#858a82]">
              {completedSets} / {exercise.targetSets} series realizadas
            </p>
            <h3
              className="mt-2 text-xl font-black uppercase text-white"
              id={`history-exercise-${exercise.id}`}
            >
              {exercise.exerciseName}
            </h3>
          </div>
          {improvement ? (
            <p className="w-fit border-l-2 border-[#f4cf3a] pl-3 text-sm font-black text-[#f4cf3a]">
              ↑ {improvement} respecto de la sesión anterior
            </p>
          ) : null}
        </header>

        {exercise.sets.length > 0 ? (
          <ol className="mt-5 border-b border-[#292c28]">
            {exercise.sets.map((set) => (
              <HistoricalSetRow key={set.id} set={set} />
            ))}
          </ol>
        ) : (
          <p className="mt-5 border-y border-[#292c28] py-4 text-sm text-[#a7aba4]">
            No se registraron series para este ejercicio.
          </p>
        )}
      </article>
    </li>
  );
}
