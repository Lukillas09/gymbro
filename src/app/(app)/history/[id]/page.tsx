import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HistoryDetail } from "@/features/history/components/history-detail";
import { getCompletedWorkout } from "@/features/history/queries";
import { isUuid } from "@/features/workouts/validation";

export const metadata: Metadata = {
  title: "Entrenamiento completado",
};

type HistoryDetailPageProps = Readonly<{
  params: Promise<{ id: string }>;
}>;

export default async function HistoryDetailPage({
  params,
}: HistoryDetailPageProps) {
  const { id } = await params;
  if (!isUuid(id)) notFound();

  const history = await getCompletedWorkout(id);
  if (!history) notFound();

  return <HistoryDetail history={history} />;
}
