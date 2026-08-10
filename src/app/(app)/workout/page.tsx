import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { EmptyState } from "@/components/ui/empty-state";
import { PageShell } from "@/components/ui/page-shell";
import { WorkoutStartPanel } from "@/features/workouts/components/workout-start-panel";
import { getWorkoutLandingState } from "@/features/workouts/queries";

export const metadata: Metadata = {
  title: "Entrenar",
};

export default async function WorkoutPage() {
  const state = await getWorkoutLandingState();

  if (state.kind === "active") {
    redirect(`/workout/${state.sessionId}`);
  }

  return (
    <PageShell
      description="Elegí el día real que vas a entrenar. GymBro conservará su plan aunque después edites la rutina."
      eyebrow="Listo"
      title="Entrenar"
    >
      {state.kind === "no-routine" ? (
        <EmptyState
          action={{ href: "/routines", label: "Ver mis rutinas" }}
          description="Creá o activá una rutina para preparar tu próximo entrenamiento."
          icon="workout"
          title="No tenés una rutina activa"
        />
      ) : (
        <WorkoutStartPanel
          days={state.days}
          routineName={state.routineName}
          suggestedDayId={state.suggestedDayId}
        />
      )}
    </PageShell>
  );
}
