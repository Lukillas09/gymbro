"use client";

import { useState } from "react";
import type { SetPrefill } from "../types";

type SetEntryProps = Readonly<{
  exerciseName: string;
  setNumber: number;
  prefill: SetPrefill;
  pending: boolean;
  error: string | null;
  onComplete: (weightKg: string, repetitions: string) => void;
}>;

export function SetEntry({
  exerciseName,
  setNumber,
  prefill,
  pending,
  error,
  onComplete,
}: SetEntryProps) {
  const [weightKg, setWeightKg] = useState(
    prefill.weightKg === null ? "" : String(prefill.weightKg),
  );
  const [repetitions, setRepetitions] = useState(String(prefill.repetitions));

  return (
    <form
      className="grid gap-5"
      onSubmit={(event) => {
        event.preventDefault();
        onComplete(weightKg, repetitions);
      }}
    >
      <div className="grid grid-cols-2 gap-3">
        <label className="grid min-w-0 gap-2 text-center">
          <span className="text-xs font-extrabold uppercase text-[#969b93]">
            Peso
          </span>
          <input
            aria-label="Peso en kilogramos"
            autoComplete="off"
            className="min-h-24 min-w-0 rounded-md border border-[#343832] bg-[#111310] px-2 text-center text-4xl font-black tabular-nums text-white focus:border-[#f4cf3a]"
            inputMode="decimal"
            max="2000"
            min="0"
            name="weightKg"
            onChange={(event) => setWeightKg(event.target.value)}
            placeholder="0"
            required
            step="0.5"
            type="number"
            value={weightKg}
          />
          <span className="text-xs font-black text-[#777c74]">KG</span>
        </label>
        <label className="grid min-w-0 gap-2 text-center">
          <span className="text-xs font-extrabold uppercase text-[#969b93]">
            Repeticiones
          </span>
          <input
            aria-label="Repeticiones realizadas"
            autoComplete="off"
            className="min-h-24 min-w-0 rounded-md border border-[#343832] bg-[#111310] px-2 text-center text-4xl font-black tabular-nums text-white focus:border-[#f4cf3a]"
            inputMode="numeric"
            max="1000"
            min="0"
            name="repetitions"
            onChange={(event) => setRepetitions(event.target.value)}
            required
            step="1"
            type="number"
            value={repetitions}
          />
          <span className="text-xs font-black text-[#777c74]">REPS</span>
        </label>
      </div>

      {error ? (
        <p className="text-center text-sm text-[#ff9b91]" role="alert">
          {error}
        </p>
      ) : null}

      <button
        className="min-h-14 w-full rounded-md bg-[#f4cf3a] px-5 text-base font-black uppercase text-[#11120f] transition-colors hover:bg-[#ffdc4f] disabled:cursor-wait disabled:bg-[#83752e]"
        disabled={pending}
        type="submit"
      >
        {pending ? "Guardando..." : "Completar serie"}
        <span className="sr-only">
          {setNumber} de {exerciseName}
        </span>
      </button>
    </form>
  );
}
