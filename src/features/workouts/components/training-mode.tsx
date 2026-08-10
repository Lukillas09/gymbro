"use client";

import { useMemo, useState, useTransition } from "react";
import {
  completeWorkoutSetAction,
  extendWorkoutRestAction,
  finishWorkoutAction,
  selectWorkoutExerciseAction,
  skipWorkoutRestAction,
  undoLastWorkoutSetAction,
} from "../actions";
import {
  compareFactualProgress,
  deriveTrainingState,
  getComparablePreviousSet,
  getNextSetNumber,
  getRemainingExerciseCount,
  getSetPrefill,
} from "../domain";
import type {
  PreviousPerformanceByExercise,
  WorkoutExercise,
  WorkoutSession,
  WorkoutSet,
} from "../types";
import { ExerciseSwitcher } from "./exercise-switcher";
import { LastSession } from "./last-session";
import { LiveHeader } from "./live-header";
import { RestTimer } from "./rest-timer";
import { SetEntry } from "./set-entry";
import { SetRows } from "./set-rows";
import { WorkoutSummary } from "./workout-summary";

type TrainingModeProps = Readonly<{
  generatedAt: string;
  initialSession: WorkoutSession;
  previousByExercise: PreviousPerformanceByExercise;
}>;

type CompletionNotice = Readonly<{
  setId: string;
  label: string;
  progressLabel: string | null;
}>;

function updateExerciseSets(
  exercises: readonly WorkoutExercise[],
  workoutExerciseId: string,
  update: (sets: readonly WorkoutSet[]) => readonly WorkoutSet[],
) {
  return exercises.map((exercise) =>
    exercise.id === workoutExerciseId
      ? { ...exercise, sets: update(exercise.sets) }
      : exercise,
  );
}

function vibrate(pattern: number | number[]) {
  if ("vibrate" in navigator) navigator.vibrate(pattern);
}

export function TrainingMode({
  generatedAt,
  initialSession,
  previousByExercise,
}: TrainingModeProps) {
  const [session, setSession] = useState(initialSession);
  const [error, setError] = useState<string | null>(null);
  const [completionNotice, setCompletionNotice] =
    useState<CompletionNotice | null>(null);
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [renderedAt] = useState(() => Date.parse(generatedAt));
  const [pending, startTransition] = useTransition();
  const trainingState = deriveTrainingState(session, renderedAt);
  const activeExercise =
    session.exercises.find(
      ({ id }) => id === session.activeWorkoutExerciseId,
    ) ?? session.exercises[0];
  const activeIndex = Math.max(
    0,
    session.exercises.findIndex(({ id }) => id === activeExercise?.id),
  );
  const nextSetNumber = activeExercise
    ? getNextSetNumber(activeExercise)
    : null;
  const previous = activeExercise
    ? previousByExercise[activeExercise.exerciseId]
    : undefined;
  const prefill = useMemo(
    () =>
      activeExercise && nextSetNumber
        ? getSetPrefill(activeExercise, nextSetNumber, previous)
        : null,
    [activeExercise, nextSetNumber, previous],
  );

  if (trainingState === "completed") {
    return (
      <>
        <LiveHeader
          completedAt={session.completedAt}
          dayName={session.dayName}
          exerciseCount={session.exercises.length}
          exerciseIndex={Math.max(0, session.exercises.length - 1)}
          generatedAt={generatedAt}
          startedAt={session.startedAt}
        />
        <WorkoutSummary
          previousByExercise={previousByExercise}
          session={session}
        />
      </>
    );
  }

  if (!activeExercise) {
    return (
      <p className="p-6 text-sm text-[#ff9b91]" role="alert">
        El entrenamiento no contiene ejercicios recuperables.
      </p>
    );
  }

  const remainingExercises = getRemainingExerciseCount(session);
  const remainingSets = session.exercises.reduce(
    (total, exercise) =>
      total + Math.max(0, exercise.targetSets - exercise.sets.length),
    0,
  );
  const nextLabel = nextSetNumber
    ? `Serie ${nextSetNumber} · ${activeExercise.exerciseName}`
    : remainingExercises > 0
      ? "Elegí el siguiente ejercicio"
      : "Entrenamiento listo para finalizar";

  function completeSet(weightKg: string, repetitions: string) {
    if (!nextSetNumber) return;
    setError(null);

    startTransition(async () => {
      const result = await completeWorkoutSetAction({
        workoutExerciseId: activeExercise.id,
        setNumber: nextSetNumber,
        weightKg,
        repetitions,
      });

      if (!result.ok) {
        setError(result.message);
        return;
      }

      const previousSet = getComparablePreviousSet(previous, nextSetNumber);
      const cue = compareFactualProgress(result.value.set, previousSet);
      setSession((current) => ({
        ...current,
        activeWorkoutExerciseId: result.value.activeWorkoutExerciseId,
        restEndsAt: result.value.restEndsAt,
        exercises: updateExerciseSets(
          current.exercises,
          activeExercise.id,
          (sets) =>
            [
              ...sets.filter(
                ({ setNumber }) => setNumber !== result.value.set.setNumber,
              ),
              result.value.set,
            ].sort((left, right) => left.setNumber - right.setNumber),
        ),
      }));
      setCompletionNotice({
        setId: result.value.set.id,
        label: `${result.value.set.weightKg} kg × ${result.value.set.repetitions}`,
        progressLabel: cue?.label ?? null,
      });
      if (result.value.inserted) vibrate(35);
    });
  }

  function undoSet() {
    if (!completionNotice) return;
    setError(null);
    startTransition(async () => {
      const result = await undoLastWorkoutSetAction(
        session.id,
        completionNotice.setId,
      );
      if (!result.ok) {
        setError(result.message);
        return;
      }

      setSession((current) => ({
        ...current,
        activeWorkoutExerciseId: result.value.activeWorkoutExerciseId,
        restEndsAt: result.value.restEndsAt,
        exercises: updateExerciseSets(
          current.exercises,
          result.value.workoutExerciseId,
          (sets) =>
            sets.filter(
              ({ setNumber }) => setNumber !== result.value.setNumber,
            ),
        ),
      }));
      setCompletionNotice(null);
    });
  }

  function extendRest() {
    setError(null);
    startTransition(async () => {
      const result = await extendWorkoutRestAction(session.id);
      if (!result.ok) {
        setError(result.message);
        setSession((current) => ({ ...current, restEndsAt: null }));
        return;
      }
      setSession((current) => ({ ...current, restEndsAt: result.value }));
    });
  }

  function skipRest() {
    setError(null);
    startTransition(async () => {
      const result = await skipWorkoutRestAction(session.id);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setSession((current) => ({ ...current, restEndsAt: null }));
    });
  }

  function selectExercise(workoutExerciseId: string) {
    setError(null);
    startTransition(async () => {
      const result = await selectWorkoutExerciseAction(
        session.id,
        workoutExerciseId,
      );
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setSession((current) => ({
        ...current,
        activeWorkoutExerciseId: workoutExerciseId,
      }));
      setSwitcherOpen(false);
    });
  }

  function finishWorkout() {
    if (
      remainingSets > 0 &&
      !window.confirm(
        `Quedan ${remainingSets} series pendientes. ¿Finalizar el entrenamiento igualmente?`,
      )
    ) {
      return;
    }

    setError(null);
    startTransition(async () => {
      const result = await finishWorkoutAction(session.id);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setSession((current) => ({
        ...current,
        status: "completed",
        completedAt: result.value,
        activeWorkoutExerciseId: null,
        restEndsAt: null,
      }));
      setCompletionNotice(null);
      vibrate([45, 40, 45]);
    });
  }

  return (
    <div className="min-h-dvh bg-[#090b09]">
      <LiveHeader
        dayName={session.dayName}
        exerciseCount={session.exercises.length}
        exerciseIndex={activeIndex}
        generatedAt={generatedAt}
        onOpenExercises={() => setSwitcherOpen(true)}
        startedAt={session.startedAt}
      />

      <main className="mx-auto grid w-full max-w-3xl gap-8 px-5 py-7 pb-[max(2rem,env(safe-area-inset-bottom))] sm:px-8">
        <section aria-labelledby="active-exercise-title">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase text-[#f4cf3a]">
                Ejercicio {activeIndex + 1}
              </p>
              <h1
                className="mt-2 text-3xl font-black uppercase text-white sm:text-4xl"
                id="active-exercise-title"
              >
                {activeExercise.exerciseName}
              </h1>
            </div>
            <button
              className="min-h-11 shrink-0 rounded-md px-3 text-sm font-bold text-[#c6c9c3] hover:bg-[#1b1e1a] hover:text-white"
              onClick={() => setSwitcherOpen(true)}
              type="button"
            >
              Cambiar
            </button>
          </div>
          <div className="mt-5">
            <LastSession performance={previous} />
          </div>
        </section>

        <SetRows exercise={activeExercise} />

        {remainingExercises === 1 ? (
          <p className="text-sm font-bold text-[#c7cac4]">
            Te queda 1 ejercicio.
          </p>
        ) : null}

        <section className="border-t border-[#30332e] pt-7">
          {trainingState === "resting" && session.restEndsAt ? (
            <RestTimer
              generatedAt={generatedAt}
              key={session.restEndsAt}
              nextLabel={nextLabel}
              onEnded={() =>
                setSession((current) => ({ ...current, restEndsAt: null }))
              }
              onExtend={extendRest}
              onSkip={skipRest}
              pending={pending}
              restEndsAt={session.restEndsAt}
            />
          ) : nextSetNumber && prefill ? (
            <SetEntry
              error={error}
              exerciseName={activeExercise.exerciseName}
              key={`${activeExercise.id}-${nextSetNumber}-${activeExercise.sets.length}`}
              onComplete={completeSet}
              pending={pending}
              prefill={prefill}
              setNumber={nextSetNumber}
            />
          ) : (
            <button
              className="min-h-12 w-full rounded-md border border-[#454941] px-4 text-sm font-extrabold text-white hover:border-[#f4cf3a]"
              onClick={() => setSwitcherOpen(true)}
              type="button"
            >
              Elegir otro ejercicio
            </button>
          )}
        </section>

        {completionNotice ? (
          <section
            aria-live="polite"
            className="flex flex-wrap items-center justify-between gap-3 border-y border-[#3d3a20] py-4"
          >
            <p className="font-extrabold text-white">
              <span className="text-[#f4cf3a]">✓</span> {completionNotice.label}
              {completionNotice.progressLabel ? (
                <span className="ml-2 text-[#f4cf3a]">
                  ↑ {completionNotice.progressLabel}
                </span>
              ) : null}
            </p>
            <button
              className="min-h-11 rounded-md px-3 text-sm font-bold text-[#f4cf3a] hover:bg-[#1f1d10] disabled:opacity-50"
              disabled={pending}
              onClick={undoSet}
              type="button"
            >
              Deshacer
            </button>
          </section>
        ) : null}

        {error && trainingState === "resting" ? (
          <p className="text-sm text-[#ff9b91]" role="alert">
            {error}
          </p>
        ) : null}

        <section className="border-t border-[#292c28] pt-6">
          <button
            className="min-h-12 w-full rounded-md px-4 text-sm font-bold text-[#b6bab2] hover:bg-[#171917] hover:text-white disabled:opacity-50"
            disabled={pending}
            onClick={finishWorkout}
            type="button"
          >
            Finalizar entrenamiento
          </button>
        </section>
      </main>

      {switcherOpen ? (
        <ExerciseSwitcher
          activeExerciseId={activeExercise.id}
          dayName={session.dayName}
          exercises={session.exercises}
          onClose={() => setSwitcherOpen(false)}
          onSelect={selectExercise}
          pending={pending}
        />
      ) : null}
    </div>
  );
}
