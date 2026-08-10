"use client";

import { useState } from "react";
import { TextField } from "@/components/ui/form-field";
import type { RoutineActionState } from "../action-state";
import { REST_PRESETS } from "../constants";

type PrescriptionValues = Readonly<{
  targetSets: number;
  targetRepsMin: number;
  targetRepsMax: number;
  restSeconds: number;
  targetRir: number | null;
}>;

type PrescriptionFieldsProps = Readonly<{
  idPrefix: string;
  values: PrescriptionValues;
  state: RoutineActionState;
}>;

export function PrescriptionFields({
  idPrefix,
  values,
  state,
}: PrescriptionFieldsProps) {
  const [restSeconds, setRestSeconds] = useState(String(values.restSeconds));

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <TextField
        defaultValue={values.targetSets}
        error={state.fieldErrors?.targetSets}
        id={`${idPrefix}-sets`}
        inputMode="numeric"
        label="Series"
        max="20"
        min="1"
        name="targetSets"
        required
        type="number"
      />
      <TextField
        defaultValue={values.targetRepsMin}
        error={state.fieldErrors?.targetRepsMin}
        id={`${idPrefix}-reps-min`}
        inputMode="numeric"
        label="Reps mín."
        max="1000"
        min="1"
        name="targetRepsMin"
        required
        type="number"
      />
      <TextField
        defaultValue={values.targetRepsMax}
        error={state.fieldErrors?.targetRepsMax}
        id={`${idPrefix}-reps-max`}
        inputMode="numeric"
        label="Reps máx."
        max="1000"
        min="1"
        name="targetRepsMax"
        required
        type="number"
      />
      <div className="sm:col-span-2 lg:col-span-1">
        <TextField
          error={state.fieldErrors?.restSeconds}
          id={`${idPrefix}-rest`}
          inputMode="numeric"
          label="Descanso (s)"
          max="3600"
          min="0"
          name="restSeconds"
          onChange={(event) => setRestSeconds(event.target.value)}
          required
          type="number"
          value={restSeconds}
        />
        <div
          aria-label="Descansos rápidos"
          className="mt-2 flex flex-wrap gap-1"
        >
          {REST_PRESETS.map((seconds) => (
            <button
              className="min-h-9 rounded-md border border-[#363a34] px-2 text-xs font-bold text-[#b8bcb5] hover:border-[#f4cf3a] hover:text-white"
              key={seconds}
              onClick={() => setRestSeconds(String(seconds))}
              type="button"
            >
              {seconds}s
            </button>
          ))}
        </div>
      </div>
      <TextField
        defaultValue={values.targetRir ?? ""}
        description="Repeticiones que estimás que quedarían antes del fallo. Opcional."
        error={state.fieldErrors?.targetRir}
        id={`${idPrefix}-rir`}
        inputMode="numeric"
        label="RIR"
        max="5"
        min="0"
        name="targetRir"
        type="number"
      />
    </div>
  );
}
