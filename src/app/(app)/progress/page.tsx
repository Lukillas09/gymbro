import type { Metadata } from "next";
import Link from "next/link";
import { EmptyState } from "@/components/ui/empty-state";
import { Icon } from "@/components/ui/icon";
import { PageShell } from "@/components/ui/page-shell";

export const metadata: Metadata = {
  title: "Progreso",
};

export default function ProgressPage() {
  return (
    <PageShell
      description="Historial, calendario y evolución van a partir de sesiones realmente finalizadas."
      eyebrow="Seguimiento"
      title="Progreso"
    >
      <Link
        className="group flex min-h-24 items-center justify-between gap-4 border-y border-[#30332e] px-1 py-5 outline-none focus-visible:border-[#f4cf3a]"
        href="/history"
      >
        <span>
          <span className="block text-xs font-black uppercase text-[#858a82]">
            Sesiones finalizadas
          </span>
          <span className="mt-2 block text-xl font-black text-white group-hover:text-[#f4cf3a]">
            Historial de entrenamientos
          </span>
        </span>
        <Icon
          className="size-5 shrink-0 text-[#858a82] group-hover:text-[#f4cf3a]"
          name="arrow-right"
        />
      </Link>

      <div className="mt-8">
        <EmptyState
          description="El calendario y la evolución por ejercicio se incorporarán a partir de sesiones finalizadas."
          icon="progress"
          title="Más progreso, próximamente"
        />
      </div>
    </PageShell>
  );
}
