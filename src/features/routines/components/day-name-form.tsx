"use client";

import { useActionState } from "react";
import { INITIAL_ROUTINE_ACTION_STATE } from "../action-state";
import { renameRoutineDayAction } from "../actions";
import { ActionFeedback } from "./action-feedback";
import { PendingButton } from "./pending-button";

type DayNameFormProps = Readonly<{
  routineId: string;
  dayId: string;
  name: string;
  updatedAt: string;
}>;

export function DayNameForm({
  routineId,
  dayId,
  name,
  updatedAt,
}: DayNameFormProps) {
  const [state, formAction] = useActionState(
    renameRoutineDayAction.bind(null, routineId, dayId, updatedAt),
    INITIAL_ROUTINE_ACTION_STATE,
  );

  return (
    <form action={formAction} className="grid gap-2" noValidate>
      <div className="flex min-w-0 gap-2">
        <label className="sr-only" htmlFor={`day-name-${dayId}`}>
          Nombre del día
        </label>
        <input
          aria-invalid={Boolean(state.fieldErrors?.dayName)}
          className="min-h-11 min-w-0 flex-1 rounded-md border border-[#353832] bg-[#0d0f0d] px-3 text-base font-extrabold text-white focus:border-[#f4cf3a]"
          defaultValue={name}
          id={`day-name-${dayId}`}
          maxLength={100}
          name="dayName"
          required
          type="text"
        />
        <PendingButton idleLabel="Guardar" pendingLabel="..." />
      </div>
      {state.fieldErrors?.dayName ? (
        <p className="text-sm text-[#ff9b91]" role="alert">
          {state.fieldErrors.dayName}
        </p>
      ) : null}
      <ActionFeedback state={state} />
    </form>
  );
}
