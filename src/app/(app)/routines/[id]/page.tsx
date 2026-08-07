import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/ui/page-shell";
import { RoutineDetail } from "@/features/routines/components/routine-detail";
import { getRoutineById } from "@/features/routines/queries";
import { isUuid } from "@/features/routines/validation";

export const metadata: Metadata = {
  title: "Detalle de rutina",
};

export default async function RoutineDetailPage({
  params,
}: Readonly<{ params: Promise<{ id: string }> }>) {
  const { id } = await params;
  if (!isUuid(id)) notFound();

  const routine = await getRoutineById(id);
  if (!routine) notFound();

  return (
    <PageShell
      description={
        routine.isActive
          ? "Esta es tu rutina activa. Revisá su planificación antes de entrenar."
          : "Revisá los días, prescripciones y distribución muscular de esta rutina."
      }
      eyebrow={routine.isActive ? "Rutina activa" : "Rutina"}
      title={routine.name}
    >
      <RoutineDetail routine={routine} />
    </PageShell>
  );
}
