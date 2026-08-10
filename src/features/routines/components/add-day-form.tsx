"use client";

import { useActionState } from "react";
import { TextField } from "@/components/ui/form-field";
import { INITIAL_ROUTINE_ACTION_STATE } from "../action-state";
import { addRoutineDayAction } from "../actions";
import { ActionFeedback } from "./action-feedback";
import { PendingButton } from "./pending-button";

export function AddDayForm({ routineId }: Readonly<{ routineId: string }>) {
  const [state, formAction] = useActionState(
    addRoutineDayAction.bind(null, routineId),
    INITIAL_ROUTINE_ACTION_STATE,
  );

  return (
    <form
      action={formAction}
      className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end"
      noValidate
    >
      <TextField
        autoComplete="off"
        error={state.fieldErrors?.dayName}
        id="routine-new-day-name"
        label="Nuevo día"
        maxLength={100}
        name="dayName"
        placeholder="Ej. Push A"
        required
        type="text"
      />
      <PendingButton
        idleLabel="Agregar día"
        pendingLabel="Agregando..."
        variant="primary"
      />
      <div className="sm:col-span-2">
        <ActionFeedback state={state} />
      </div>
    </form>
  );
}
