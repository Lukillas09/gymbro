"use client";

import { useActionState } from "react";
import { INITIAL_ROUTINE_ACTION_STATE } from "../action-state";
import { updateRoutineExerciseAction } from "../actions";
import type { RoutineExercisePrescription } from "../types";
import { ActionFeedback } from "./action-feedback";
import { PendingButton } from "./pending-button";
import { PrescriptionFields } from "./prescription-fields";

type PrescriptionFormProps = Readonly<{
  routineId: string;
  prescription: RoutineExercisePrescription;
}>;

export function PrescriptionForm({
  routineId,
  prescription,
}: PrescriptionFormProps) {
  const [state, formAction] = useActionState(
    updateRoutineExerciseAction.bind(
      null,
      routineId,
      prescription.id,
      prescription.updatedAt,
    ),
    INITIAL_ROUTINE_ACTION_STATE,
  );

  return (
    <form action={formAction} className="grid gap-4" noValidate>
      <PrescriptionFields
        idPrefix={`prescription-${prescription.id}`}
        state={state}
        values={prescription}
      />
      <div className="flex flex-wrap items-center gap-3">
        <PendingButton
          idleLabel="Guardar prescripción"
          pendingLabel="Guardando..."
          variant="secondary"
        />
        <ActionFeedback state={state} />
      </div>
    </form>
  );
}
