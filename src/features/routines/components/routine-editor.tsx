import Link from "next/link";
import type { ExerciseCatalogItem } from "@/features/exercises/types";
import {
  activateRoutineAction,
  deleteRoutineDayAction,
  deleteRoutineExerciseAction,
  duplicateRoutineDayAction,
  moveRoutineDayAction,
  moveRoutineExerciseAction,
} from "../actions";
import { formatPrescription, formatRestTime } from "../domain";
import type { RoutineDay, RoutineDetail } from "../types";
import { AddDayForm } from "./add-day-form";
import { ConfirmActionButton } from "./confirm-action-button";
import { DayNameForm } from "./day-name-form";
import { ExercisePicker } from "./exercise-picker";
import { PendingButton } from "./pending-button";
import { PrescriptionForm } from "./prescription-form";
import { RoutineForm } from "./routine-form";

type RoutineEditorProps = Readonly<{
  routine: RoutineDetail;
  catalog: readonly ExerciseCatalogItem[];
}>;

function DayEditor({
  routineId,
  day,
  dayIndex,
  dayCount,
  catalog,
}: Readonly<{
  routineId: string;
  day: RoutineDay;
  dayIndex: number;
  dayCount: number;
  catalog: readonly ExerciseCatalogItem[];
}>) {
  return (
    <section
      aria-labelledby={`day-editor-title-${day.id}`}
      className="border-t border-[#30332e] py-6 first:border-t-0 first:pt-0"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase text-[#8f948c]">
            Día {dayIndex + 1}
          </p>
          <h3 className="sr-only" id={`day-editor-title-${day.id}`}>
            Editar {day.name}
          </h3>
          <div className="mt-2 max-w-xl">
            <DayNameForm
              dayId={day.id}
              name={day.name}
              routineId={routineId}
              updatedAt={day.updatedAt}
            />
          </div>
        </div>
        <div
          aria-label={`Acciones de ${day.name}`}
          className="flex flex-wrap gap-2"
        >
          <form
            action={moveRoutineDayAction.bind(null, routineId, day.id, "up")}
          >
            <PendingButton
              disabled={dayIndex === 0}
              idleLabel={`Subir ${day.name}`}
              pendingLabel="…"
              variant="icon"
              visualLabel="↑"
            />
          </form>
          <form
            action={moveRoutineDayAction.bind(null, routineId, day.id, "down")}
          >
            <PendingButton
              disabled={dayIndex === dayCount - 1}
              idleLabel={`Bajar ${day.name}`}
              pendingLabel="…"
              variant="icon"
              visualLabel="↓"
            />
          </form>
          <form
            action={duplicateRoutineDayAction.bind(null, routineId, day.id)}
          >
            <PendingButton
              idleLabel="Duplicar día"
              pendingLabel="Duplicando..."
            />
          </form>
          <form action={deleteRoutineDayAction.bind(null, routineId, day.id)}>
            <ConfirmActionButton
              confirmation={`¿Eliminar ${day.name} y todas sus prescripciones?`}
              idleLabel="Eliminar día"
              pendingLabel="Eliminando..."
            />
          </form>
        </div>
      </div>

      <div className="mt-6 border-t border-[#252824]">
        {day.exercises.length > 0 ? (
          day.exercises.map((prescription, exerciseIndex) => (
            <article
              className="border-b border-[#252824] py-5"
              key={prescription.id}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <Link
                    className="text-base font-black text-white hover:text-[#f4cf3a]"
                    href={`/exercises/${prescription.exercise.slug}`}
                  >
                    {prescription.exercise.name}
                  </Link>
                  <p className="mt-1 text-sm text-[#a9ada6]">
                    {formatPrescription(prescription)} · Descanso{" "}
                    {formatRestTime(prescription.restSeconds)}
                    {prescription.targetRir === null
                      ? ""
                      : ` · RIR ${prescription.targetRir}`}
                  </p>
                </div>
                <div
                  aria-label={`Orden de ${prescription.exercise.name}`}
                  className="flex gap-2"
                >
                  <form
                    action={moveRoutineExerciseAction.bind(
                      null,
                      routineId,
                      day.id,
                      prescription.id,
                      "up",
                    )}
                  >
                    <PendingButton
                      disabled={exerciseIndex === 0}
                      idleLabel={`Subir ${prescription.exercise.name}`}
                      pendingLabel="…"
                      variant="icon"
                      visualLabel="↑"
                    />
                  </form>
                  <form
                    action={moveRoutineExerciseAction.bind(
                      null,
                      routineId,
                      day.id,
                      prescription.id,
                      "down",
                    )}
                  >
                    <PendingButton
                      disabled={exerciseIndex === day.exercises.length - 1}
                      idleLabel={`Bajar ${prescription.exercise.name}`}
                      pendingLabel="…"
                      variant="icon"
                      visualLabel="↓"
                    />
                  </form>
                  <form
                    action={deleteRoutineExerciseAction.bind(
                      null,
                      routineId,
                      prescription.id,
                    )}
                  >
                    <ConfirmActionButton
                      confirmation={`¿Quitar ${prescription.exercise.name} de ${day.name}?`}
                      idleLabel="Quitar"
                      pendingLabel="..."
                    />
                  </form>
                </div>
              </div>
              <details className="mt-4">
                <summary className="min-h-11 cursor-pointer py-3 text-sm font-bold text-[#f4cf3a] focus-visible:outline-2 focus-visible:outline-[#f4cf3a]">
                  Editar prescripción
                </summary>
                <div className="pb-2 pt-3">
                  <PrescriptionForm
                    prescription={prescription}
                    routineId={routineId}
                  />
                </div>
              </details>
            </article>
          ))
        ) : (
          <p className="py-6 text-sm text-[#969b93]">
            Este día todavía no tiene ejercicios.
          </p>
        )}
      </div>

      <div className="mt-5">
        <ExercisePicker
          dayId={day.id}
          dayName={day.name}
          exercises={catalog}
          routineId={routineId}
          selectedExerciseIds={day.exercises.map(({ exercise }) => exercise.id)}
        />
      </div>
    </section>
  );
}

export function RoutineEditor({ routine, catalog }: RoutineEditorProps) {
  return (
    <div className="grid gap-10">
      <section aria-labelledby="routine-data-title">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-black text-white" id="routine-data-title">
            Datos de la rutina
          </h2>
          <Link
            className="inline-flex min-h-11 items-center rounded-md px-3 text-sm font-bold text-[#b8bcb5] hover:bg-[#1a1c19] hover:text-white"
            href={`/routines/${routine.id}`}
          >
            Ver rutina
          </Link>
        </div>
        <div className="mt-5 max-w-2xl">
          <RoutineForm defaultGoal={routine.goal} routine={routine} />
        </div>
      </section>

      {!routine.isActive ? (
        <section className="border-y border-[#2a2d29] py-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-extrabold text-white">Rutina inactiva</h2>
              <p className="mt-1 text-sm text-[#969b93]">
                Podés terminar de configurarla antes de usarla como principal.
              </p>
            </div>
            <form action={activateRoutineAction.bind(null, routine.id)}>
              <PendingButton
                idleLabel="Marcar como activa"
                pendingLabel="Activando..."
                variant="primary"
              />
            </form>
          </div>
        </section>
      ) : null}

      <section aria-labelledby="routine-days-title">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase text-[#8f948c]">
              Estructura
            </p>
            <h2
              className="mt-1 text-xl font-black text-white"
              id="routine-days-title"
            >
              Días de rutina
            </h2>
          </div>
          <span className="text-sm text-[#969b93]">
            {routine.days.length} {routine.days.length === 1 ? "día" : "días"}
          </span>
        </div>

        <div className="mt-6">
          {routine.days.length > 0 ? (
            routine.days.map((day, index) => (
              <DayEditor
                catalog={catalog}
                day={day}
                dayCount={routine.days.length}
                dayIndex={index}
                key={day.id}
                routineId={routine.id}
              />
            ))
          ) : (
            <p className="border-y border-[#2a2d29] py-8 text-sm text-[#a9ada6]">
              Agregá el primer día para empezar a organizar ejercicios.
            </p>
          )}
        </div>

        <div className="mt-7 border-t border-[#2a2d29] pt-6">
          <AddDayForm routineId={routine.id} />
        </div>
      </section>
    </div>
  );
}
