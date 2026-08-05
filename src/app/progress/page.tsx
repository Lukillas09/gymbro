import type { Metadata } from "next";
import { EmptyState } from "@/components/ui/empty-state";
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
      <EmptyState
        description="Cuando completes entrenamientos, vas a encontrar su historial y evolución en este espacio."
        icon="progress"
        title="Todavía no hay progreso registrado"
      />
    </PageShell>
  );
}
