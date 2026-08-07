import type { Metadata } from "next";
import { PageShell } from "@/components/ui/page-shell";
import { requireCompletedProfile } from "@/features/auth/server";
import { RoutineForm } from "@/features/routines/components/routine-form";

export const metadata: Metadata = {
  title: "Crear rutina",
};

export default async function NewRoutinePage() {
  const { profile } = await requireCompletedProfile();

  return (
    <PageShell
      description="Definí un nombre y objetivo. Después vas a organizar los días y ejercicios."
      eyebrow="Nueva rutina"
      title="Crear rutina"
    >
      <div className="max-w-2xl">
        <RoutineForm defaultGoal={profile.primary_goal ?? "general_fitness"} />
      </div>
    </PageShell>
  );
}
