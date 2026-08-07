import Link from "next/link";
import { EmptyState } from "@/components/ui/empty-state";

export function RoutineEmptyState() {
  return (
    <div>
      <EmptyState
        action={{ href: "/routines/new", label: "Crear mi primera rutina" }}
        description="Todavía no tenés rutinas. Creá una estructura propia o revisá primero la biblioteca."
        icon="routines"
        title="Todavía no tenés rutinas"
      />
      <Link
        className="mt-4 inline-flex min-h-11 items-center rounded-md px-3 text-sm font-bold text-[#f4cf3a] hover:bg-[#1a1c19]"
        href="/exercises"
      >
        Explorar ejercicios
      </Link>
    </div>
  );
}
