import type { Metadata } from "next";
import { PageShell } from "@/components/ui/page-shell";
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
      <ProgressOverview overview={overview} period={period} />
    </PageShell>
  );
}
