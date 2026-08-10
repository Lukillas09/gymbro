import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExerciseProgressDetail } from "@/features/progress/components/exercise-progress-detail";
import { getExerciseProgress } from "@/features/progress/queries";
import { isUuid } from "@/features/workouts/validation";

export const metadata: Metadata = {
  title: "Evolución del ejercicio",
};

type ExerciseProgressPageProps = Readonly<{
  params: Promise<{ exerciseId: string }>;
}>;

export default async function ExerciseProgressPage({
  params,
}: ExerciseProgressPageProps) {
  const { exerciseId } = await params;
  if (!isUuid(exerciseId)) notFound();

  const detail = await getExerciseProgress(exerciseId);
  if (!detail) notFound();

  return <ExerciseProgressDetail detail={detail} />;
}
