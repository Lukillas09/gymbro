"use client";

import { PageShell } from "@/components/ui/page-shell";

export default function RoutinesError({
  reset,
}: Readonly<{ reset: () => void }>) {
  return (
    <PageShell
      description="Tus datos no se modificaron. Podés volver a intentar la operación."
      eyebrow="Rutinas"
      title="No pudimos cargar las rutinas"
    >
      <button
        className="min-h-12 rounded-md bg-[#f4cf3a] px-5 text-sm font-extrabold text-[#11120f] hover:bg-[#ffdc4f]"
        onClick={reset}
        type="button"
      >
        Reintentar
      </button>
    </PageShell>
  );
}
