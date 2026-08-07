"use client";

import { PageShell } from "@/components/ui/page-shell";

type ExerciseLibraryErrorProps = Readonly<{
  reset: () => void;
}>;

export default function ExerciseLibraryError({
  reset,
}: ExerciseLibraryErrorProps) {
  return (
    <PageShell
      description="La biblioteca no está disponible en este momento."
      eyebrow="Ejercicios"
      title="No pudimos cargar los ejercicios"
    >
      <button
        className="min-h-12 rounded-lg bg-[#f4cf3a] px-5 text-sm font-extrabold text-[#11120f] hover:bg-[#ffdc4f] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f4cf3a]"
        onClick={reset}
        type="button"
      >
        Reintentar
      </button>
    </PageShell>
  );
}
