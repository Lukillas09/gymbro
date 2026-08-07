"use client";

import { useActionState, useMemo, useState } from "react";
import { ExerciseFilterControls } from "@/features/exercises/components/exercise-filter-controls";
import { difficultyLabels } from "@/features/exercises/constants";
import {
  emptyExerciseFilters,
  filterExercises,
  getEquipmentLabel,
  getExerciseFilterOptions,
  getPrimaryMuscleLabel,
} from "@/features/exercises/domain";
import type {
  ExerciseCatalogItem,
  ExerciseFilters,
} from "@/features/exercises/types";
import { INITIAL_ROUTINE_ACTION_STATE } from "../action-state";
import type { RoutineActionState } from "../action-state";
import { addRoutineExerciseAction } from "../actions";
import { DEFAULT_PRESCRIPTION } from "../constants";
import { ActionFeedback } from "./action-feedback";
import { PendingButton } from "./pending-button";
import { PrescriptionFields } from "./prescription-fields";

type ExercisePickerProps = Readonly<{
  routineId: string;
  dayId: string;
  dayName: string;
  exercises: readonly ExerciseCatalogItem[];
  selectedExerciseIds: readonly string[];
}>;

type PickerDialogProps = ExercisePickerProps &
  Readonly<{
    onClose: () => void;
  }>;

function PickerDialog({
  routineId,
  dayId,
  dayName,
  exercises,
  selectedExerciseIds,
  onClose,
}: PickerDialogProps) {
  const [filters, setFilters] = useState(emptyExerciseFilters);
  const [selectedExercise, setSelectedExercise] =
    useState<ExerciseCatalogItem | null>(null);
  const options = useMemo(
    () => getExerciseFilterOptions(exercises),
    [exercises],
  );
  const results = useMemo(
    () => filterExercises(exercises, filters),
    [exercises, filters],
  );
  const selectedIds = useMemo(
    () => new Set(selectedExerciseIds),
    [selectedExerciseIds],
  );
  const boundAction = addRoutineExerciseAction.bind(null, routineId, dayId);
  const [state, formAction] = useActionState(
    async (previousState: RoutineActionState, formData: FormData) => {
      const nextState = await boundAction(previousState, formData);
      if (nextState.status === "success") onClose();
      return nextState;
    },
    INITIAL_ROUTINE_ACTION_STATE,
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
    <div
      aria-labelledby={`exercise-picker-title-${dayId}`}
      aria-modal="true"
      className="fixed inset-0 z-50 overflow-y-auto bg-[#090b09] px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(2rem,env(safe-area-inset-bottom))] sm:px-6"
      onKeyDown={(event) => {
        if (event.key === "Escape") onClose();
      }}
      role="dialog"
    >
      <div className="mx-auto w-full max-w-5xl">
        <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-[#2a2d29] bg-[#090b09]/95 py-4 backdrop-blur">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase text-[#8f948c]">
              {dayName}
            </p>
            <h2
              className="mt-1 text-2xl font-black text-white"
              id={`exercise-picker-title-${dayId}`}
            >
              {selectedExercise ? "Configurar ejercicio" : "Agregar ejercicio"}
            </h2>
          </div>
          <button
            aria-label="Cerrar selector de ejercicios"
            autoFocus
            className="grid size-11 shrink-0 place-items-center rounded-md border border-[#3a3d37] text-2xl text-white hover:border-[#f4cf3a]"
            onClick={onClose}
            type="button"
          >
            ×
          </button>
        </header>

        {selectedExercise ? (
          <div className="py-6">
            <button
              className="min-h-11 rounded-md px-2 text-sm font-bold text-[#f4cf3a] hover:bg-[#1a1c19]"
              onClick={() => setSelectedExercise(null)}
              type="button"
            >
              ← Volver a resultados
            </button>
            <div className="mt-4 border-y border-[#2a2d29] py-5">
              <p className="text-xs font-bold uppercase text-[#969b93]">
                {difficultyLabels[selectedExercise.difficulty]}
              </p>
              <h3 className="mt-2 text-xl font-black text-white">
                {selectedExercise.name}
              </h3>
              <p className="mt-2 text-sm text-[#a9ada6]">
                {getPrimaryMuscleLabel(selectedExercise)} ·{" "}
                {getEquipmentLabel(selectedExercise)}
              </p>
            </div>
            <form action={formAction} className="mt-6 grid gap-5" noValidate>
              <input
                name="exerciseId"
                type="hidden"
                value={selectedExercise.id}
              />
              <PrescriptionFields
                idPrefix={`picker-${dayId}`}
                state={state}
                values={DEFAULT_PRESCRIPTION}
              />
              <ActionFeedback state={state} />
              <div className="sticky bottom-0 border-t border-[#2a2d29] bg-[#090b09] py-4">
                <PendingButton
                  idleLabel={`Agregar ${selectedExercise.name}`}
                  pendingLabel="Agregando..."
                  variant="primary"
                />
              </div>
            </form>
          </div>
        ) : (
          <div className="py-6">
            <ExerciseFilterControls
              filters={filters}
              idPrefix={`picker-${dayId}`}
              onChange={updateFilter}
              onClear={() => setFilters(emptyExerciseFilters)}
              options={options}
              resultCount={results.length}
            />
            {results.length > 0 ? (
              <ul className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {results.map((exercise) => {
                  const alreadySelected = selectedIds.has(exercise.id);
                  return (
                    <li
                      className="flex min-h-32 flex-col justify-between rounded-md border border-[#2c302b] bg-[#121411] p-4"
                      key={exercise.id}
                    >
                      <div>
                        <p className="text-xs font-bold text-[#969b93]">
                          {difficultyLabels[exercise.difficulty]}
                        </p>
                        <h3 className="mt-2 text-base font-extrabold text-white">
                          {exercise.name}
                        </h3>
                        <p className="mt-1 text-sm text-[#a9ada6]">
                          {getPrimaryMuscleLabel(exercise)}
                        </p>
                      </div>
                      <button
                        className="mt-4 min-h-11 rounded-md border border-[#4a4e46] px-3 text-sm font-extrabold text-white hover:border-[#f4cf3a] disabled:cursor-not-allowed disabled:border-[#2d302c] disabled:text-[#6e736b]"
                        disabled={alreadySelected}
                        onClick={() => setSelectedExercise(exercise)}
                        type="button"
                      >
                        {alreadySelected ? "Ya agregado" : "Agregar"}
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="mt-8 rounded-md border border-[#2a2d29] px-4 py-6 text-center text-sm text-[#a9ada6]">
                No encontramos ejercicios con esos filtros.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function ExercisePicker(props: ExercisePickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className="inline-flex min-h-12 w-full items-center justify-center rounded-md border border-[#6f6220] bg-[#1f1d10] px-4 text-sm font-extrabold text-[#f4cf3a] hover:bg-[#2b2710] sm:w-auto"
        onClick={() => setOpen(true)}
        type="button"
      >
        Agregar ejercicio
      </button>
      {open ? <PickerDialog {...props} onClose={() => setOpen(false)} /> : null}
    </>
  );
}
