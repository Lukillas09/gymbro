import Link from "next/link";
import { PageShell } from "@/components/ui/page-shell";

export default function RoutineNotFound() {
  return (
    <PageShell
      description="La rutina no existe o no pertenece a tu cuenta."
      eyebrow="Rutinas"
      title="No encontramos la rutina"
    >
      <Link
        className="inline-flex min-h-12 items-center rounded-md bg-[#f4cf3a] px-4 text-sm font-extrabold text-[#11120f]"
        href="/routines"
      >
        Volver a rutinas
      </Link>
    </PageShell>
  );
}
