import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/ui/page-shell";
import { Icon } from "@/components/ui/icon";
import { ProgressOverview } from "@/features/progress/components/progress-overview";
import { getProgressOverview } from "@/features/progress/queries";

export const metadata: Metadata = {
  title: "Progreso",
};

export default async function ProgressPage() {
  const { overview, period } = await getProgressOverview();

  return (
    <PageShell
      description="Frecuencia, evolución y récords construidos únicamente desde entrenamientos finalizados."
      eyebrow="Seguimiento"
      title="¿Estoy mejorando?"
    >
      <Link
        className="group mb-10 flex min-h-16 items-center justify-between gap-4 border-y border-[#343731] px-1 text-sm font-black text-white outline-none hover:text-[#f4cf3a] focus-visible:border-[#f4cf3a]"
        href="/calendar"
      >
        Abrir calendario de entrenamientos
        <Icon
          className="size-5 text-[#858a82] group-hover:text-[#f4cf3a]"
          name="arrow-right"
        />
      </Link>
      <ProgressOverview overview={overview} period={period} />
    </PageShell>
  );
}
