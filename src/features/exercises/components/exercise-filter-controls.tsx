"use client";

import { getExerciseFilterOptions } from "../domain";
import type { ExerciseFilters } from "../types";

type ExerciseFilterOptions = ReturnType<typeof getExerciseFilterOptions>;

type ExerciseFilterControlsProps = Readonly<{
  filters: ExerciseFilters;
  idPrefix: string;
  options: ExerciseFilterOptions;
  resultCount: number;
  onChange: <Key extends keyof ExerciseFilters>(
    key: Key,
    value: ExerciseFilters[Key],
  ) => void;
  onClear: () => void;
}>;

const fieldClassName =
  "min-h-12 w-full rounded-lg border border-[#363a34] bg-[#111310] px-3 text-sm text-white outline-none focus:border-[#f4cf3a] focus:ring-2 focus:ring-[#f4cf3a]/20 disabled:cursor-not-allowed disabled:text-[#686d65]";

export function ExerciseFilterControls({
  filters,
  idPrefix,
  options,
  resultCount,
  onChange,
  onClear,
}: ExerciseFilterControlsProps) {
  const muscles = filters.muscleGroup
    ? options.muscles.filter(
        ({ groupSlug }) => groupSlug === filters.muscleGroup,
      )
    : [];
  const hasFilters = Object.values(filters).some(Boolean);

  return (
    <section aria-label="Filtros de ejercicios">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="md:col-span-2 lg:col-span-1">
          <label
            className="mb-2 block text-xs font-bold text-[#b4b8b1]"
            htmlFor={`${idPrefix}-search`}
          >
            Buscar por nombre
          </label>
          <input
            className={fieldClassName}
            id={`${idPrefix}-search`}
            onChange={(event) => onChange("query", event.target.value)}
            placeholder="Ej. press banca"
            type="search"
            value={filters.query}
          />
        </div>

        <div>
          <label
            className="mb-2 block text-xs font-bold text-[#b4b8b1]"
            htmlFor={`${idPrefix}-muscle-group`}
          >
            Macrogrupo
          </label>
          <select
            className={fieldClassName}
            id={`${idPrefix}-muscle-group`}
            onChange={(event) => onChange("muscleGroup", event.target.value)}
            value={filters.muscleGroup}
          >
            <option value="">Todos</option>
            {options.muscleGroups.map((group) => (
              <option key={group.slug} value={group.slug}>
                {group.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            className="mb-2 block text-xs font-bold text-[#b4b8b1]"
            htmlFor={`${idPrefix}-muscle`}
          >
            Músculo
          </label>
          <select
            className={fieldClassName}
            disabled={!filters.muscleGroup}
            id={`${idPrefix}-muscle`}
            onChange={(event) => onChange("muscle", event.target.value)}
            value={filters.muscle}
          >
            <option value="">
              {filters.muscleGroup ? "Todos" : "Elegí un macrogrupo"}
            </option>
            {muscles.map((muscle) => (
              <option key={muscle.slug} value={muscle.slug}>
                {muscle.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            className="mb-2 block text-xs font-bold text-[#b4b8b1]"
            htmlFor={`${idPrefix}-equipment`}
          >
            Equipamiento incluido
          </label>
          <select
            className={fieldClassName}
            id={`${idPrefix}-equipment`}
            onChange={(event) => onChange("equipment", event.target.value)}
            value={filters.equipment}
          >
            <option value="">Todos</option>
            {options.equipment.map((item) => (
              <option key={item.slug} value={item.slug}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4 flex min-h-11 items-center justify-between gap-4">
        <p aria-live="polite" className="text-sm text-[#969b93]">
          {resultCount} {resultCount === 1 ? "ejercicio" : "ejercicios"}
        </p>
        {hasFilters ? (
          <button
            className="min-h-11 rounded-md px-3 text-sm font-bold text-[#f4cf3a] hover:bg-[#20231f] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f4cf3a]"
            onClick={onClear}
            type="button"
          >
            Limpiar filtros
          </button>
        ) : null}
      </div>
    </section>
  );
}
