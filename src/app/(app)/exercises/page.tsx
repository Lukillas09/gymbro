import type { Metadata } from "next";
import { ExerciseLibrary } from "@/features/exercises/components/exercise-library";
import { parseExerciseFilters } from "@/features/exercises/domain";
import { listOfficialExercises } from "@/features/exercises/queries";
import { PageShell } from "@/components/ui/page-shell";

export const metadata: Metadata = {
  title: "Biblioteca",
};

type ExerciseLibraryPageProps = Readonly<{
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}>;

export default async function ExerciseLibraryPage({
  searchParams,
}: ExerciseLibraryPageProps) {
  const [exercises, params] = await Promise.all([
    listOfficialExercises(),
    searchParams,
  ]);
  const urlSearchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (typeof value === "string") urlSearchParams.set(key, value);
  }

  return (
    <PageShell
      description="Encontrá movimientos por músculo y equipamiento para preparar tus próximas rutinas."
      eyebrow="Ejercicios"
      title="Biblioteca"
    >
      <ExerciseLibrary
        exercises={exercises}
        initialFilters={parseExerciseFilters(urlSearchParams)}
      />
    </PageShell>
  );
}
