"use client";

import { useActionState } from "react";
import { INITIAL_ROUTINE_ACTION_STATE } from "../action-state";
import { updateRoutineDayWeekdayAction } from "../actions";
import { ActionFeedback } from "./action-feedback";
import { PendingButton } from "./pending-button";

const WEEKDAY_OPTIONS = [
  { value: "1", label: "Lunes" },
  { value: "2", label: "Martes" },
  { value: "3", label: "Miércoles" },
  { value: "4", label: "Jueves" },
  { value: "5", label: "Viernes" },
  { value: "6", label: "Sábado" },
  { value: "0", label: "Domingo" },
] as const;

export function WeekdayForm({
  routineId,
  dayId,
  dayName,
  weekday,
  updatedAt,
}: Readonly<{
  routineId: string;
  dayId: string;
  dayName: string;
  weekday: number | null;
  updatedAt: string;
}>) {
  const [state, formAction] = useActionState(
    updateRoutineDayWeekdayAction.bind(null, routineId, dayId, updatedAt),
    INITIAL_ROUTINE_ACTION_STATE,
  );

  return (
    <form action={formAction} className="mt-3 grid gap-2" noValidate>
      <div className="flex min-w-0 gap-2">
        <label className="sr-only" htmlFor={`weekday-${dayId}`}>
          Día fijo de {dayName}
        </label>
        <select
          aria-invalid={Boolean(state.fieldErrors?.weekday)}
          className="min-h-11 min-w-0 flex-1 rounded-md border border-[#353832] bg-[#0d0f0d] px-3 text-sm font-bold text-white focus:border-[#f4cf3a]"
          defaultValue={weekday?.toString() ?? ""}
          id={`weekday-${dayId}`}
          name="weekday"
        >
          <option value="">Sin día fijo</option>
          {WEEKDAY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <PendingButton idleLabel="Guardar día fijo" pendingLabel="..." />
      </div>
      {state.fieldErrors?.weekday ? (
        <p className="text-sm text-[#ff9b91]" role="alert">
          {state.fieldErrors.weekday}
        </p>
      ) : null}
      <ActionFeedback state={state} />
    </form>
  );
}
