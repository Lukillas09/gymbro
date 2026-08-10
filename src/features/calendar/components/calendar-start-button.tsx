"use client";

import { useActionState } from "react";
import { SubmitButton } from "@/components/ui/submit-button";
import {
  INITIAL_START_WORKOUT_STATE,
  type StartWorkoutActionState,
} from "@/features/workouts/action-state";
import { startWorkoutAction } from "@/features/workouts/actions";

export function CalendarStartButton({
  routineDayId,
}: Readonly<{ routineDayId: string }>) {
  const [state, formAction] = useActionState<StartWorkoutActionState, FormData>(
    startWorkoutAction,
    INITIAL_START_WORKOUT_STATE,
  );

  return (
    <form action={formAction} className="mt-5">
      <input name="routineDayId" type="hidden" value={routineDayId} />
      <SubmitButton
        idleLabel="Empezar entrenamiento"
        pendingLabel="Preparando entrenamiento..."
      />
      {state.status === "error" ? (
        <p className="mt-3 text-sm text-[#ff9b91]" role="alert">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
