import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/ui/page-shell";
import { listOfficialExercises } from "@/features/exercises/queries";
import { RoutineEditor } from "@/features/routines/components/routine-editor";
import { getRoutineById } from "@/features/routines/queries";
import { isUuid } from "@/features/routines/validation";

export const metadata: Metadata = {
  title: "Editar rutina",
};

export default async function EditRoutinePage({
  params,
}: Readonly<{ params: Promise<{ id: string }> }>) {
  const { id } = await params;
  if (!isUuid(id)) notFound();

  const [routine, catalog] = await Promise.all([
    getRoutineById(id),
    listOfficialExercises(),
  ]);
  if (!routine || routine.archivedAt) notFound();

  return (
    <PageShell
      description="Configurá la plantilla que más adelante utilizará el modo Entrenar."
      eyebrow="Editor"
      title={routine.name}
    >
      <RoutineEditor catalog={catalog} routine={routine} />
    </PageShell>
  );
}
