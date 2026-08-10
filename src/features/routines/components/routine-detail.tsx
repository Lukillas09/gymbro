import Link from "next/link";
import { activateRoutineAction, archiveRoutineAction } from "../actions";
import { getTrainingGoalLabel } from "../constants";
import {
  calculatePrimaryMuscleSummary,
  formatPrescription,
  formatRestTime,
} from "../domain";
import type { RoutineDetail as RoutineDetailType } from "../types";
import { ConfirmActionButton } from "./confirm-action-button";
import { PendingButton } from "./pending-button";

export function RoutineDetail({
  routine,
}: Readonly<{ routine: RoutineDetailType }>) {
  const muscleSummary = calculatePrimaryMuscleSummary(routine.days);
  const exerciseCount = routine.days.reduce(
    (total, day) => total + day.exercises.length,
    0,
  );

  return (
    <div className="grid gap-9">
      {routine.archivedAt ? (
        <p className="border-y border-[#2a2d29] py-4 text-sm text-[#b8bcb5]">
          Esta rutina está archivada y se conserva como referencia histórica.
        </p>
      ) : (
        <div className="flex flex-wrap gap-3">
          <Link
            className="inline-flex min-h-12 items-center justify-center rounded-md bg-[#f4cf3a] px-4 text-sm font-extrabold text-[#11120f] hover:bg-[#ffdc4f]"
            href={`/routines/${routine.id}/edit`}
          >
            Editar rutina
          </Link>
          {!routine.isActive ? (
            <form action={activateRoutineAction.bind(null, routine.id)}>
              <PendingButton idleLabel="Activar" pendingLabel="Activando..." />
            </form>
          ) : null}
          <form
            action={archiveRoutineAction.bind(
              null,
              routine.id,
              routine.updatedAt,
            )}
          >
            <ConfirmActionButton
              confirmation={`¿Archivar ${routine.name}? Su configuración y los entrenamientos históricos se conservarán.`}
              idleLabel="Archivar"
              pendingLabel="Archivando..."
            />
          </form>
        </div>
      )}

      <section
        aria-label="Resumen de rutina"
        className="grid gap-px overflow-hidden rounded-md border border-[#2a2d29] bg-[#2a2d29] sm:grid-cols-3"
      >
        <div className="bg-[#121411] p-4">
          <p className="text-xs font-bold uppercase text-[#8f948c]">Objetivo</p>
          <p className="mt-2 font-extrabold text-white">
            {getTrainingGoalLabel(routine.goal)}
          </p>
        </div>
        <div className="bg-[#121411] p-4">
          <p className="text-xs font-bold uppercase text-[#8f948c]">Días</p>
          <p className="mt-2 font-extrabold text-white">
            {routine.days.length}
          </p>
        </div>
        <div className="bg-[#121411] p-4">
          <p className="text-xs font-bold uppercase text-[#8f948c]">
            Prescripciones
          </p>
          <p className="mt-2 font-extrabold text-white">{exerciseCount}</p>
        </div>
      </section>

      <section aria-labelledby="routine-plan-title">
        <h2 className="text-xl font-black text-white" id="routine-plan-title">
          Plan completo
        </h2>
        {routine.days.length > 0 ? (
          <div className="mt-5">
            {routine.days.map((day, dayIndex) => (
              <section
                className="border-t border-[#2d302c] py-6 first:border-t-0 first:pt-0"
                key={day.id}
              >
                <p className="text-xs font-bold uppercase text-[#8f948c]">
                  Día {dayIndex + 1}
                </p>
                <h3 className="mt-1 text-lg font-black text-white">
                  {day.name}
                </h3>
                {day.exercises.length > 0 ? (
                  <ul className="mt-4 divide-y divide-[#252824] border-y border-[#252824]">
                    {day.exercises.map((prescription) => (
                      <li className="py-4" key={prescription.id}>
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
                          <Link
                            className="font-extrabold text-white hover:text-[#f4cf3a]"
                            href={`/exercises/${prescription.exercise.slug}`}
                          >
                            {prescription.exercise.name}
                          </Link>
                          <p className="text-sm font-bold text-[#d0d3cd]">
                            {formatPrescription(prescription)}
                          </p>
                        </div>
                        <p className="mt-1 text-sm text-[#969b93]">
                          Descanso {formatRestTime(prescription.restSeconds)}
                          {prescription.targetRir === null
                            ? ""
                            : ` · RIR ${prescription.targetRir}`}
                        </p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 text-sm text-[#969b93]">
                    Sin ejercicios configurados.
                  </p>
                )}
              </section>
            ))}
          </div>
        ) : (
          <p className="mt-4 border-y border-[#2a2d29] py-6 text-sm text-[#a9ada6]">
            Esta rutina todavía no tiene días.
          </p>
        )}
      </section>

      <section aria-labelledby="muscle-summary-title">
        <h2 className="text-xl font-black text-white" id="muscle-summary-title">
          Resumen muscular
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#969b93]">
          Estimación basada únicamente en series objetivo asociadas a músculos
          principales. No representa volumen efectivo ni reemplaza el registro
          del entrenamiento.
        </p>
        {muscleSummary.length > 0 ? (
          <ul className="mt-5 divide-y divide-[#2a2d29] border-y border-[#2a2d29]">
            {muscleSummary.map((item) => (
              <li
                className="flex items-center justify-between gap-4 py-3"
                key={item.groupId}
              >
                <span className="font-bold text-white">{item.groupName}</span>
                <span className="text-sm text-[#b8bcb5]">
                  {item.primarySets} series primary
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-[#969b93]">
            Agregá ejercicios para obtener este resumen.
          </p>
        )}
      </section>
    </div>
  );
}
