"use client";

import Link from "next/link";
import { useActionState } from "react";
import { SelectField, TextField } from "@/components/ui/form-field";
import { SubmitButton } from "@/components/ui/submit-button";
import { TRAINING_GOAL_OPTIONS } from "@/features/auth/constants";
import { INITIAL_ROUTINE_ACTION_STATE } from "../action-state";
import { createRoutineAction, updateRoutineAction } from "../actions";
import type { TrainingGoal } from "../types";
import { ActionFeedback } from "./action-feedback";

type RoutineFormProps = Readonly<{
  routine?: Readonly<{
    id: string;
    name: string;
    goal: TrainingGoal;
    updatedAt: string;
  }>;
  defaultGoal: TrainingGoal;
}>;

export function RoutineForm({ routine, defaultGoal }: RoutineFormProps) {
  const action = routine
    ? updateRoutineAction.bind(null, routine.id, routine.updatedAt)
    : createRoutineAction;
  const [state, formAction] = useActionState(
    action,
    INITIAL_ROUTINE_ACTION_STATE,
  );

  return (
    <form action={formAction} className="grid gap-5" noValidate>
      <ActionFeedback state={state} />
      <TextField
        autoComplete="off"
        defaultValue={routine?.name ?? ""}
        error={state.fieldErrors?.name}
        id={routine ? "routine-edit-name" : "routine-new-name"}
        label="Nombre de la rutina"
        maxLength={100}
        name="name"
        placeholder="Ej. Push Pull Legs"
        required
        type="text"
      />
      <SelectField
        defaultValue={routine?.goal ?? defaultGoal}
        error={state.fieldErrors?.goal}
        id={routine ? "routine-edit-goal" : "routine-new-goal"}
        label="Objetivo"
        name="goal"
        required
      >
        {TRAINING_GOAL_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </SelectField>
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
        <SubmitButton
          idleLabel={routine ? "Guardar datos" : "Crear rutina"}
          pendingLabel={routine ? "Guardando..." : "Creando..."}
        />
        <Link
          className="inline-flex min-h-11 items-center justify-center rounded-md px-4 text-sm font-bold text-[#b8bcb5] hover:bg-[#1a1c19] hover:text-white"
          href={routine ? `/routines/${routine.id}` : "/routines"}
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
