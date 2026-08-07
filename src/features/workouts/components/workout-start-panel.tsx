"use client";

import { useActionState, useState } from "react";
import { SubmitButton } from "@/components/ui/submit-button";
import {
  INITIAL_START_WORKOUT_STATE,
  type StartWorkoutActionState,
} from "../action-state";
import { startWorkoutAction } from "../actions";
import type { WorkoutDayOption } from "../types";

type WorkoutStartPanelProps = Readonly<{
  routineName: string;
  days: readonly WorkoutDayOption[];
  suggestedDayId: string | null;
}>;

export function WorkoutStartPanel({
  routineName,
  days,
  suggestedDayId,
}: WorkoutStartPanelProps) {
  const firstAvailableDay = days.find(({ exerciseCount }) => exerciseCount > 0);
  const [selectedDayId, setSelectedDayId] = useState(
    suggestedDayId ?? firstAvailableDay?.id ?? "",
  );
  const [state, formAction] = useActionState<StartWorkoutActionState, FormData>(
    startWorkoutAction,
    INITIAL_START_WORKOUT_STATE,
  );

  return (
    <form action={formAction} className="grid gap-7">
      <input name="routineDayId" type="hidden" value={selectedDayId} />

      <div>
        <p className="text-sm font-bold text-[#f4cf3a]">{routineName}</p>
        <h2 className="mt-2 text-2xl font-black text-white">
          ¿Qué entrenás hoy?
        </h2>
      </div>

      {days.length > 0 ? (
        <div aria-label="Días de rutina" className="grid gap-2" role="list">
          {days.map((day) => {
            const selected = selectedDayId === day.id;
            const unavailable = day.exerciseCount === 0;

            return (
              <div key={day.id} role="listitem">
                <button
                  aria-pressed={selected}
                  className={`flex min-h-20 items-center justify-between gap-4 rounded-md border px-4 text-left transition-colors ${
                    selected
                      ? "border-[#f4cf3a] bg-[#1d1b0f]"
                      : "border-[#30332e] bg-[#121411] hover:border-[#686d63]"
                  } disabled:cursor-not-allowed disabled:opacity-45`}
                  disabled={unavailable}
                  onClick={() => setSelectedDayId(day.id)}
                  type="button"
                >
                  <span className="min-w-0">
                    <span className="block text-base font-black text-white">
                      {day.name}
                    </span>
                    <span className="mt-1 block text-sm text-[#a9ada6]">
                      {day.exerciseCount === 1
                        ? "1 ejercicio"
                        : `${day.exerciseCount} ejercicios`}
                    </span>
                  </span>
                  {day.id === suggestedDayId && !unavailable ? (
                    <span className="shrink-0 text-xs font-extrabold uppercase text-[#f4cf3a]">
                      Sugerido
                    </span>
                  ) : null}
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="border-y border-[#2a2d29] py-6 text-sm text-[#a9ada6]">
          La rutina activa todavía no tiene días configurados.
        </p>
      )}

      {state.status === "error" ? (
        <p className="text-sm text-[#ff9b91]" role="alert">
          {state.message}
        </p>
      ) : null}

      <div className="sticky bottom-[calc(5rem+env(safe-area-inset-bottom))] border-t border-[#292c28] bg-[#0b0d0b] py-4 lg:bottom-0">
        <SubmitButton
          disabled={!selectedDayId}
          idleLabel="Empezar entrenamiento"
          pendingLabel="Preparando entrenamiento..."
        />
      </div>
    </form>
  );
}
