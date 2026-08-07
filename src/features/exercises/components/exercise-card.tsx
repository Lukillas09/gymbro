import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { difficultyLabels } from "../constants";
import { getEquipmentLabel, getPrimaryMuscleLabel } from "../domain";
import type { ExerciseCatalogItem } from "../types";

type ExerciseCardProps = Readonly<{
  exercise: ExerciseCatalogItem;
}>;

export function ExerciseCard({ exercise }: ExerciseCardProps) {
  return (
    <article className="h-full rounded-lg border border-[#2a2d29] bg-[#121411] transition-colors hover:border-[#484c43] focus-within:border-[#f4cf3a]">
      <Link
        aria-label={`Ver ${exercise.name}`}
        className="flex h-full min-h-44 flex-col p-5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f4cf3a]"
        href={`/exercises/${exercise.slug}`}
      >
        <div className="flex items-start justify-between gap-4">
          <span className="rounded-md border border-[#3a3d35] px-2 py-1 text-xs font-bold text-[#b9bdb5]">
            {difficultyLabels[exercise.difficulty]}
          </span>
          <Icon className="size-5 shrink-0 text-[#747970]" name="arrow-right" />
        </div>

        <h2 className="mt-4 text-lg leading-6 font-extrabold text-white">
          {exercise.name}
        </h2>
        <p className="mt-2 text-sm leading-5 text-[#a9ada6]">
          {getPrimaryMuscleLabel(exercise)}
        </p>
        <p className="mt-auto pt-5 text-xs font-bold uppercase text-[#7f847c]">
          {getEquipmentLabel(exercise)}
        </p>
      </Link>
    </article>
  );
}
