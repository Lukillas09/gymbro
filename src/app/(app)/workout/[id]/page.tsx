import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TrainingMode } from "@/features/workouts/components/training-mode";
import { getWorkoutSessionById } from "@/features/workouts/queries";
import { isUuid } from "@/features/workouts/validation";

export const metadata: Metadata = {
  title: "Entrenamiento activo",
};

export default async function ActiveWorkoutPage({
  params,
}: Readonly<{ params: Promise<{ id: string }> }>) {
  const { id } = await params;
  if (!isUuid(id)) notFound();

  const data = await getWorkoutSessionById(id);
  if (!data) notFound();

  return (
    <TrainingMode
      initialSession={data.session}
      previousByExercise={data.previousByExercise}
    />
  );
}
