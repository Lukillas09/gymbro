import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { PageShell } from "@/components/ui/page-shell";
import { ExerciseDetail } from "@/features/exercises/components/exercise-detail";
import { getOfficialExerciseBySlug } from "@/features/exercises/queries";

type ExerciseDetailPageProps = Readonly<{
  params: Promise<{ slug: string }>;
}>;

export async function generateMetadata({
  params,
}: ExerciseDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const exercise = await getOfficialExerciseBySlug(slug);

  return exercise
    ? { title: exercise.name, description: exercise.description }
    : { title: "Ejercicio no encontrado" };
}

export default async function ExerciseDetailPage({
  params,
}: ExerciseDetailPageProps) {
  const { slug } = await params;

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) notFound();

  const exercise = await getOfficialExerciseBySlug(slug);

  if (!exercise) notFound();

  return (
    <PageShell
      description={exercise.description}
      eyebrow="Biblioteca"
      title={exercise.name}
    >
      <Link
        className="mb-8 inline-flex min-h-11 items-center gap-2 rounded-md pr-3 text-sm font-bold text-[#c4c8c1] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f4cf3a]"
        href="/exercises"
      >
        <span className="rotate-180">
          <Icon className="size-5" name="arrow-right" />
        </span>
        Volver a Biblioteca
      </Link>
      <ExerciseDetail exercise={exercise} />
    </PageShell>
  );
}
