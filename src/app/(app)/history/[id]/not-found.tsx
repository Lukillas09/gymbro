import { EmptyState } from "@/components/ui/empty-state";

export default function HistoryNotFound() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-8 sm:py-14">
      <EmptyState
        action={{ href: "/history", label: "Volver al historial" }}
        description="La sesión no existe, no fue finalizada o no pertenece a tu cuenta."
        icon="progress"
        title="No encontramos este entrenamiento"
      />
    </div>
  );
}
