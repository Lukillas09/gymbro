import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/ui/page-shell";
import { RoutineCard } from "@/features/routines/components/routine-card";
import { RoutineEmptyState } from "@/features/routines/components/routine-empty-state";
import { listRoutines } from "@/features/routines/queries";

export const metadata: Metadata = {
  title: "Rutinas",
};

export default async function RoutinesPage() {
  const routines = await listRoutines();
  const activeRoutine = routines.find(({ isActive }) => isActive);
  const otherRoutines = routines.filter(
    ({ isActive, archivedAt }) => !isActive && !archivedAt,
  );
  const archivedRoutines = routines.filter(({ archivedAt }) => archivedAt);

  return (
    <PageShell
      description="Organizá tus días, ejercicios y objetivos antes de empezar a entrenar."
      eyebrow="Planificación"
      title="Rutinas"
    >
      {routines.length === 0 ? (
        <RoutineEmptyState />
      ) : (
        <div className="grid gap-9">
          <div className="flex justify-end">
            <Link
              className="inline-flex min-h-12 items-center justify-center rounded-md bg-[#f4cf3a] px-4 text-sm font-extrabold text-[#11120f] hover:bg-[#ffdc4f]"
              href="/routines/new"
            >
              Crear rutina
            </Link>
          </div>

          {activeRoutine ? (
            <section aria-labelledby="active-routine-title">
              <p className="text-xs font-bold uppercase text-[#f4cf3a]">
                Principal
              </p>
              <h2
                className="mt-1 text-xl font-black text-white"
                id="active-routine-title"
              >
                Rutina activa
              </h2>
              <div className="mt-4 max-w-2xl">
                <RoutineCard routine={activeRoutine} />
              </div>
            </section>
          ) : (
            <section className="border-y border-[#2a2d29] py-5">
              <h2 className="font-extrabold text-white">Sin rutina activa</h2>
              <p className="mt-1 text-sm text-[#969b93]">
                Abrí una rutina y activala cuando esté lista.
              </p>
            </section>
          )}

          {otherRoutines.length > 0 ? (
            <section aria-labelledby="other-routines-title">
              <h2
                className="text-xl font-black text-white"
                id="other-routines-title"
              >
                Otras rutinas
              </h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {otherRoutines.map((routine) => (
                  <li key={routine.id}>
                    <RoutineCard routine={routine} />
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {archivedRoutines.length > 0 ? (
            <details className="border-t border-[#2a2d29] pt-5">
              <summary className="min-h-11 cursor-pointer py-3 font-bold text-[#b8bcb5]">
                Rutinas archivadas ({archivedRoutines.length})
              </summary>
              <ul className="mt-3 grid gap-3 sm:grid-cols-2">
                {archivedRoutines.map((routine) => (
                  <li key={routine.id}>
                    <RoutineCard routine={routine} />
                  </li>
                ))}
              </ul>
            </details>
          ) : null}
        </div>
      )}
    </PageShell>
  );
}
