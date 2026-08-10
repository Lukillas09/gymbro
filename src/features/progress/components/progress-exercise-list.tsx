"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { formatWeight } from "@/features/workouts/domain";
import { APP_TIME_ZONE, formatLocalDate } from "@/lib/date-time";
import type { ProgressExerciseItem } from "../types";

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es-AR");
}

function formatRecentDate(value: string) {
  return formatLocalDate(value, APP_TIME_ZONE, {
    day: "numeric",
    month: "short",
  }).toLocaleUpperCase("es-AR");
}

export function ProgressExerciseList({
  exercises,
}: Readonly<{ exercises: readonly ProgressExerciseItem[] }>) {
  const [query, setQuery] = useState("");
  const visibleExercises = useMemo(() => {
    const normalizedQuery = normalize(query.trim());
    if (!normalizedQuery) return exercises;
    return exercises.filter(({ exerciseName }) =>
      normalize(exerciseName).includes(normalizedQuery),
    );
  }, [exercises, query]);

  return (
    <section aria-labelledby="progress-exercises-title" className="mt-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase text-[#858a82]">Detalle</p>
          <h2
            className="mt-2 text-2xl font-black text-white"
            id="progress-exercises-title"
          >
            Ejercicios entrenados
          </h2>
        </div>
        <label className="block w-full sm:max-w-xs">
          <span className="sr-only">Buscar ejercicio entrenado</span>
          <input
            className="min-h-12 w-full rounded-lg border border-[#343731] bg-[#131512] px-4 text-base text-white outline-none placeholder:text-[#747970] focus-visible:border-[#f4cf3a] focus-visible:ring-2 focus-visible:ring-[#f4cf3a]/25"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar ejercicio"
            type="search"
            value={query}
          />
        </label>
      </div>

      {visibleExercises.length > 0 ? (
        <ol className="mt-6 divide-y divide-[#343731] border-y border-[#343731]">
          {visibleExercises.map((exercise) => (
            <li key={exercise.exerciseId}>
              <Link
                aria-label={`Ver progreso de ${exercise.exerciseName}`}
                className="group flex min-h-24 items-center justify-between gap-4 px-1 py-5 outline-none focus-visible:bg-[#171916]"
                href={`/progress/exercises/${exercise.exerciseId}`}
              >
                <span className="min-w-0">
                  <span className="block text-base font-black text-white group-hover:text-[#f4cf3a]">
                    {exercise.exerciseName}
                  </span>
                  <span className="mt-2 block text-xs font-bold uppercase text-[#858a82]">
                    Último uso {formatRecentDate(exercise.lastPerformedAt)}
                  </span>
                  {exercise.periodBest ? (
                    <span className="mt-1 block text-sm text-[#c5c9c1]">
                      Mejor en 4 semanas:{" "}
                      {formatWeight(exercise.periodBest.weightKg)} ×{" "}
                      {exercise.periodBest.repetitions}
                    </span>
                  ) : null}
                </span>
                <span className="flex shrink-0 items-center gap-3">
                  {exercise.improvement ? (
                    <span className="text-xs font-black text-[#f4cf3a]">
                      {exercise.improvement.label}
                    </span>
                  ) : null}
                  <Icon
                    className="size-5 text-[#858a82] group-hover:text-[#f4cf3a]"
                    name="arrow-right"
                  />
                </span>
              </Link>
            </li>
          ))}
        </ol>
      ) : (
        <p className="mt-6 border-y border-[#343731] py-8 text-sm text-[#a9ada6]">
          No hay ejercicios entrenados que coincidan con la búsqueda.
        </p>
      )}
    </section>
  );
}
