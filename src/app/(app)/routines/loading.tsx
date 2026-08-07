import { PageShell } from "@/components/ui/page-shell";

export default function RoutinesLoading() {
  return (
    <PageShell
      description="Organizá tus días, ejercicios y objetivos antes de empezar a entrenar."
      eyebrow="Planificación"
      title="Rutinas"
    >
      <div aria-label="Cargando rutinas" className="grid gap-3 sm:grid-cols-2">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            className="h-36 animate-pulse rounded-md border border-[#252824] bg-[#121411] motion-reduce:animate-none"
            key={index}
          />
        ))}
      </div>
    </PageShell>
  );
}
