import { EmptyState } from "@/components/ui/empty-state";
import { PageShell } from "@/components/ui/page-shell";

export default function ExerciseNotFound() {
  return (
    <PageShell
      description="El ejercicio solicitado no forma parte del catálogo disponible."
      eyebrow="Biblioteca"
      title="Ejercicio no encontrado"
    >
      <EmptyState
        action={{ href: "/exercises", label: "Volver a Biblioteca" }}
        description="Puede haberse eliminado o la dirección no es válida."
        icon="routines"
        title="No encontramos ese ejercicio"
      />
    </PageShell>
  );
}
