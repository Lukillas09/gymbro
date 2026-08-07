import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { PageShell } from "@/components/ui/page-shell";
import { requireCompletedProfile } from "@/features/auth/server";

export const metadata: Metadata = {
  title: "Inicio",
};

export default async function HomePage() {
  const { profile } = await requireCompletedProfile();
  const firstName = profile.display_name?.trim().split(/\s+/)[0] ?? "GymBro";

  return (
    <PageShell
      description="Organizá tu rutina y mantené el entrenamiento a mano cuando llegue el momento de empezar."
      eyebrow="Inicio"
      title={`Hola, ${firstName}`}
    >
      <section
        aria-labelledby="getting-started-title"
        className="rounded-lg border border-[#35382f] bg-[#151714] px-5 py-7 sm:px-8 sm:py-9"
      >
        <div className="grid size-12 place-items-center rounded-lg border border-[#333630] bg-[#1d1f1c] text-[#d4d7d1]">
          <Icon name="routines" />
        </div>
        <p className="mt-6 text-xs font-bold uppercase text-[#8f948c]">
          Sin rutina activa
        </p>
        <h2
          className="mt-2 max-w-xl text-2xl leading-tight font-extrabold text-white sm:text-3xl"
          id="getting-started-title"
        >
          Empezá por organizar tu rutina
        </h2>
        <p className="mt-3 max-w-xl text-sm leading-6 text-[#a9ada6] sm:text-base">
          Cuando exista una rutina activa, el próximo día de entrenamiento va a
          aparecer en este espacio.
        </p>
        <Link
          className="mt-7 flex min-h-12 w-full items-center justify-between rounded-lg bg-[#f4cf3a] px-4 text-sm font-extrabold text-[#11120f] hover:bg-[#ffdc4f] sm:w-fit sm:min-w-52"
          href="/routines"
        >
          Ir a Rutinas
          <Icon className="size-5" name="arrow-right" />
        </Link>
      </section>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Link
          className="group rounded-lg border border-[#2a2d29] bg-[#111310] p-5 hover:border-[#44483f]"
          href="/workout"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="grid size-10 place-items-center rounded-lg bg-[#20231f] text-[#d9ddd6]">
              <Icon className="size-5" name="workout" />
            </div>
            <Icon
              className="size-5 text-[#686d65] group-hover:text-white"
              name="arrow-right"
            />
          </div>
          <h2 className="mt-5 text-lg font-extrabold text-white">Entrenar</h2>
          <p className="mt-1 text-sm leading-6 text-[#92978f]">
            No hay una sesión activa.
          </p>
        </Link>

        <Link
          className="group rounded-lg border border-[#2a2d29] bg-[#111310] p-5 hover:border-[#44483f]"
          href="/progress"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="grid size-10 place-items-center rounded-lg bg-[#20231f] text-[#d9ddd6]">
              <Icon className="size-5" name="progress" />
            </div>
            <Icon
              className="size-5 text-[#686d65] group-hover:text-white"
              name="arrow-right"
            />
          </div>
          <h2 className="mt-5 text-lg font-extrabold text-white">Progreso</h2>
          <p className="mt-1 text-sm leading-6 text-[#92978f]">
            Todavía no hay entrenamientos finalizados.
          </p>
        </Link>
      </div>
    </PageShell>
  );
}
