import type { Metadata } from "next";
import { EmptyState } from "@/components/ui/empty-state";
import { PageShell } from "@/components/ui/page-shell";

export const metadata: Metadata = {
  title: "Rutinas",
};

export default function RoutinesPage() {
  return (
    <PageShell
      description="Tus días y ejercicios van a mantenerse ordenados en este espacio."
      eyebrow="Planificación"
      title="Rutinas"
    >
      <EmptyState
        description="Las rutinas que configures aparecerán acá. Todavía no hay ninguna guardada."
        icon="routines"
        title="No hay rutinas todavía"
      />
    </PageShell>
  );
}
