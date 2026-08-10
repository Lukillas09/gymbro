"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  INITIAL_START_WORKOUT_STATE,
  type StartWorkoutActionState,
} from "@/features/workouts/action-state";
import { startWorkoutAction } from "@/features/workouts/actions";
import { getDayMuscleGroups } from "../domain";
import type { HomeState } from "../types";

type ReadyState = Extract<HomeState, { kind: "ready" }>;

function StartButton() {
  const { pending } = useFormStatus();
  return (
    <button
      className="flex min-h-14 w-full items-center justify-center rounded-md bg-[#f4cf3a] px-5 text-sm font-black text-[#11120f] transition-colors hover:bg-[#ffdc4f] disabled:cursor-wait disabled:bg-[#91812f] sm:w-fit sm:min-w-64"
      disabled={pending}
      type="submit"
    >
      {pending ? "Preparando entrenamiento..." : "Empezar entrenamiento"}
    </button>
  );
}

export function ReadyHomeHero({ state }: Readonly<{ state: ReadyState }>) {
  const [selectedDayId, setSelectedDayId] = useState(state.suggestedDayId);
  const [actionState, formAction] = useActionState<
    StartWorkoutActionState,
    FormData
  >(startWorkoutAction, INITIAL_START_WORKOUT_STATE);
  const selectedDay =
    state.days.find((day) => day.id === selectedDayId) ?? state.days[0];
  const muscles = selectedDay ? getDayMuscleGroups(selectedDay) : [];

  return (
    <section aria-labelledby="home-title" className="pb-10 sm:pb-14">
      <p className="text-xs font-black uppercase text-[#f4cf3a]">
        {state.schedule === "scheduled" ? "Hoy" : "Listo para entrenar"}
      </p>
      <p className="mt-3 text-sm font-bold text-[#92978f]">
        {state.routine.name}
      </p>
      <h1
        className="mt-2 max-w-3xl text-4xl leading-none font-black uppercase text-white sm:text-6xl"
        id="home-title"
      >
        {state.schedule === "manual" && !selectedDay
          ? "¿Qué entrenás?"
          : selectedDay?.name}
      </h1>

      {selectedDay ? (
        <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm font-bold text-[#b8bcb5]">
          {muscles.length > 0 ? <span>{muscles.join(" · ")}</span> : null}
          {muscles.length > 0 ? (
            <span aria-hidden="true" className="text-[#4d514b]">
              /
            </span>
          ) : null}
          <span>
            {selectedDay.exercises.length === 1
              ? "1 ejercicio"
              : `${selectedDay.exercises.length} ejercicios`}
          </span>
        </div>
      ) : null}

      <form action={formAction} className="mt-8 grid gap-7">
        <fieldset>
          <legend className="text-xs font-bold uppercase text-[#858a82]">
            {state.schedule === "scheduled"
              ? "Podés elegir otro día"
              : "Elegí el día"}
          </legend>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
            {state.days.map((day) => (
              <label className="min-w-0 cursor-pointer" key={day.id}>
                <input
                  checked={selectedDayId === day.id}
                  className="peer sr-only"
                  name="routineDayId"
                  onChange={() => setSelectedDayId(day.id)}
                  type="radio"
                  value={day.id}
                />
                <span className="flex min-h-12 items-center justify-center rounded-md border border-[#30332e] bg-[#121411] px-3 text-center text-sm font-extrabold text-[#b6bab3] transition-colors peer-checked:border-[#f4cf3a] peer-checked:bg-[#24200d] peer-checked:text-white peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#f4cf3a] sm:min-w-28">
                  {day.name}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        {actionState.status === "error" ? (
          <p className="text-sm text-[#ff9b91]" role="alert">
            {actionState.message}
          </p>
        ) : null}

        <StartButton />
      </form>
    </section>
  );
}
