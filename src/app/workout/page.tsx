import type { Metadata } from "next";
import { EmptyState } from "@/components/ui/empty-state";
import { PageShell } from "@/components/ui/page-shell";

export const metadata: Metadata = {
  title: "Entrenar",
};

export default function WorkoutPage() {
  return (
    <PageShell
      description="Cuando empieces un entrenamiento, esta vista va a concentrar la sesión y los descansos."
      eyebrow="Sesión"
      title="Entrenar"
    >
      <EmptyState
        action={{ href: "/routines", label: "Revisar Rutinas" }}
        description="Necesitás una rutina preparada antes de iniciar tu primera sesión."
        icon="workout"
        title="No hay una sesión activa"
      />
    </PageShell>
  );
}
