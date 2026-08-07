import { PageShell } from "@/components/ui/page-shell";

export default function ExerciseLibraryLoading() {
  return (
    <PageShell
      description="Encontrá movimientos por músculo y equipamiento para preparar tus próximas rutinas."
      eyebrow="Ejercicios"
      title="Biblioteca"
    >
      <div aria-label="Cargando ejercicios" aria-live="polite">
        <div className="grid gap-4 border-y border-[#252824] py-5 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div
              className="h-20 animate-pulse rounded-lg bg-[#171916] motion-reduce:animate-none"
              key={index}
            />
          ))}
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <div
              className="h-44 animate-pulse rounded-lg border border-[#252824] bg-[#121411] motion-reduce:animate-none"
              key={index}
            />
          ))}
        </div>
      </div>
    </PageShell>
  );
}
