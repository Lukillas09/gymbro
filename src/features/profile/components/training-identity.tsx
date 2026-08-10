import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import type { ProfileIdentityModel } from "../types";

function formatWeight(value: number) {
  return new Intl.NumberFormat("es-AR", {
    maximumFractionDigits: 2,
  }).format(value);
}

export function TrainingIdentity({
  model,
}: Readonly<{ model: ProfileIdentityModel }>) {
  const { activeRoutine, personalRecord, recentMuscleGroups } = model;
  const hasHistory = model.totalCompletedWorkouts > 0;
  const primaryAction = !activeRoutine
    ? { href: "/routines/new", label: "Crear rutina" }
    : activeRoutine.exerciseCount === 0
      ? {
          href: `/routines/${activeRoutine.id}/edit`,
          label: "Completar rutina",
        }
      : { href: "/workout", label: "Empezar a entrenar" };

  return (
    <section
      aria-labelledby="training-identity-title"
      className="py-9 sm:py-11"
    >
      <p className="text-xs font-black uppercase text-[#858a82]">
        Identidad de entrenamiento
      </p>
      <h2
        className="mt-2 text-2xl font-black text-white sm:text-3xl"
        id="training-identity-title"
      >
        Tu entrenamiento
      </h2>

      <div className="mt-7 grid border-y border-[#343731] lg:grid-cols-2">
        <div className="py-6 lg:pr-8">
          <p className="text-xs font-black uppercase text-[#858a82]">
            Plan actual
          </p>
          {activeRoutine ? (
            <>
              <Link
                className="mt-3 block text-xl font-black text-white outline-none hover:text-[#f4cf3a] focus-visible:text-[#f4cf3a]"
                href={`/routines/${activeRoutine.id}`}
              >
                {activeRoutine.name}
              </Link>
              <p className="mt-2 text-sm leading-6 text-[#a9ada6]">
                {activeRoutine.dayCount}{" "}
                {activeRoutine.dayCount === 1 ? "día" : "días"} ·{" "}
                {activeRoutine.exerciseCount}{" "}
                {activeRoutine.exerciseCount === 1 ? "ejercicio" : "ejercicios"}
              </p>
            </>
          ) : (
            <>
              <p className="mt-3 text-lg font-black text-white">
                Sin rutina activa
              </p>
              <p className="mt-2 max-w-md text-sm leading-6 text-[#a9ada6]">
                {hasHistory
                  ? "Tu historial sigue siendo parte de tu perfil aunque hoy no tengas un plan activo."
                  : "Creá un plan para darle una dirección concreta a tu entrenamiento."}
              </p>
            </>
          )}
        </div>

        <div className="border-t border-[#292c28] py-6 lg:border-t-0 lg:border-l lg:pl-8">
          <p className="text-xs font-black uppercase text-[#858a82]">
            Mejor registro
          </p>
          {personalRecord ? (
            <Link
              aria-label={`Ver progreso de ${personalRecord.exerciseName}`}
              className="group mt-3 block outline-none"
              href={`/progress/exercises/${personalRecord.exerciseId}`}
            >
              <span className="block text-lg font-black text-white group-hover:text-[#f4cf3a] group-focus-visible:text-[#f4cf3a]">
                {personalRecord.exerciseName}
              </span>
              <span className="mt-2 block text-2xl font-black tabular-nums text-[#f4cf3a]">
                {formatWeight(personalRecord.weightKg)} kg ×{" "}
                {personalRecord.repetitions}
              </span>
              <span className="mt-2 block text-xs font-bold uppercase text-[#858a82]">
                PR de peso
              </span>
            </Link>
          ) : (
            <p className="mt-3 max-w-md text-sm leading-6 text-[#a9ada6]">
              Aparecerá cuando una serie finalizada permita calcular un récord
              real por ejercicio.
            </p>
          )}
        </div>
      </div>

      {recentMuscleGroups.length > 0 ? (
        <div className="mt-7">
          <p className="text-xs font-black uppercase text-[#858a82]">
            Más presentes recientemente
          </p>
          <p className="mt-2 text-base font-black text-white">
            {recentMuscleGroups.join(" · ")}
          </p>
        </div>
      ) : null}

      {!hasHistory ? (
        <Link
          className="mt-7 flex min-h-12 w-full items-center justify-between rounded-md bg-[#f4cf3a] px-4 text-sm font-black text-[#11120f] outline-none hover:bg-[#ffdc4f] focus-visible:ring-2 focus-visible:ring-white sm:w-fit sm:min-w-56"
          href={primaryAction.href}
        >
          {primaryAction.label}
          <Icon className="size-5" name="arrow-right" />
        </Link>
      ) : !activeRoutine ? (
        <Link
          className="mt-7 inline-flex min-h-11 items-center font-black text-white outline-none hover:text-[#f4cf3a] focus-visible:text-[#f4cf3a]"
          href="/routines"
        >
          Ver rutinas
        </Link>
      ) : null}
    </section>
  );
}
