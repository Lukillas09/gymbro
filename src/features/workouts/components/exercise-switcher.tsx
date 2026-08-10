"use client";

import { getNextSetNumber } from "../domain";
import type { WorkoutExercise } from "../types";

type ExerciseSwitcherProps = Readonly<{
  dayName: string;
  exercises: readonly WorkoutExercise[];
  activeExerciseId: string;
  pending: boolean;
  onClose: () => void;
  onSelect: (workoutExerciseId: string) => void;
}>;

export function ExerciseSwitcher({
  dayName,
  exercises,
  activeExerciseId,
  pending,
  onClose,
  onSelect,
}: ExerciseSwitcherProps) {
  return (
    <div
      aria-labelledby="exercise-switcher-title"
      aria-modal="true"
      className="fixed inset-0 z-50 overflow-y-auto bg-[#090b09] px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(2rem,env(safe-area-inset-bottom))]"
      onKeyDown={(event) => {
        if (event.key === "Escape") onClose();
      }}
      role="dialog"
    >
      <div className="mx-auto w-full max-w-2xl">
        <header className="sticky top-0 flex items-start justify-between gap-4 border-b border-[#292c28] bg-[#090b09]/95 py-4 backdrop-blur">
          <div>
            <p className="text-xs font-bold uppercase text-[#8f948c]">
              {dayName}
            </p>
            <h2
              className="mt-1 text-2xl font-black text-white"
              id="exercise-switcher-title"
            >
              Ejercicios
            </h2>
          </div>
          <button
            aria-label="Cerrar lista de ejercicios"
            autoFocus
            className="grid size-11 place-items-center rounded-md border border-[#3a3d37] text-2xl text-white hover:border-[#f4cf3a]"
            onClick={onClose}
            type="button"
          >
            ×
          </button>
        </header>

        <ol className="divide-y divide-[#292c28]">
          {exercises.map((exercise) => {
            const completed = exercise.sets.length;
            const isActive = exercise.id === activeExerciseId;
            const isDone = getNextSetNumber(exercise) === null;

            return (
              <li key={exercise.id}>
                <button
                  aria-current={isActive ? "true" : undefined}
                  className="grid min-h-20 w-full grid-cols-[1.5rem_minmax(0,1fr)_auto] items-center gap-3 py-3 text-left hover:bg-[#141614] disabled:opacity-50"
                  disabled={pending}
                  onClick={() => onSelect(exercise.id)}
                  type="button"
                >
                  <span
                    aria-hidden="true"
                    className={
                      isDone
                        ? "font-black text-[#f4cf3a]"
                        : isActive
                          ? "font-black text-white"
                          : "text-[#62675f]"
                    }
                  >
                    {isDone ? "✓" : isActive ? "●" : "·"}
                  </span>
                  <span className="min-w-0 truncate font-extrabold text-white">
                    {exercise.exerciseName}
                  </span>
                  <span className="text-sm font-bold tabular-nums text-[#a9ada6]">
                    {completed}/{exercise.targetSets}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
