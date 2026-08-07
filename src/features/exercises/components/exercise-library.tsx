"use client";

import { useMemo, useState } from "react";
import { EmptyState } from "@/components/ui/empty-state";
import {
  emptyExerciseFilters,
  filterExercises,
  getExerciseFilterOptions,
} from "../domain";
import type { ExerciseCatalogItem, ExerciseFilters } from "../types";
import { ExerciseCard } from "./exercise-card";
import { ExerciseFilterControls } from "./exercise-filter-controls";

type ExerciseLibraryProps = Readonly<{
  exercises: readonly ExerciseCatalogItem[];
  initialFilters?: ExerciseFilters;
}>;

export function ExerciseLibrary({
  exercises,
  initialFilters = emptyExerciseFilters,
}: ExerciseLibraryProps) {
  const [filters, setFilters] = useState(initialFilters);
  const options = useMemo(
    () => getExerciseFilterOptions(exercises),
    [exercises],
  );
  const results = useMemo(
    () => filterExercises(exercises, filters),
    [exercises, filters],
  );
  function updateFilter<Key extends keyof ExerciseFilters>(
    key: Key,
    value: ExerciseFilters[Key],
  ) {
    setFilters((current) => ({
      ...current,
      [key]: value,
      ...(key === "muscleGroup" ? { muscle: "" } : null),
    }));
  }

  return (
    <div>
      <section
        aria-label="Filtros de ejercicios"
        className="border-y border-[#252824] py-5"
      >
        <ExerciseFilterControls
          filters={filters}
          idPrefix="exercise"
          onChange={updateFilter}
          onClear={() => setFilters(emptyExerciseFilters)}
          options={options}
          resultCount={results.length}
        />
      </section>

      {results.length > 0 ? (
        <ul className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {results.map((exercise) => (
            <li key={exercise.id}>
              <ExerciseCard exercise={exercise} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-6">
          <EmptyState
            description="Probá con otro nombre o quitá alguno de los filtros seleccionados."
            icon="routines"
            title="No encontramos ejercicios"
          />
        </div>
      )}
    </div>
  );
}
