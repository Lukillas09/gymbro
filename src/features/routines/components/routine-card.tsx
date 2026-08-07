import Link from "next/link";
import { getTrainingGoalLabel } from "../constants";
import type { RoutineListItem } from "../types";

export function RoutineCard({
  routine,
}: Readonly<{ routine: RoutineListItem }>) {
  return (
    <Link
      className="block rounded-md border border-[#2c302b] bg-[#121411] p-4 transition-colors hover:border-[#555a50] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f4cf3a]"
      href={`/routines/${routine.id}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase text-[#969b93]">
            {getTrainingGoalLabel(routine.goal)}
          </p>
          <h2 className="mt-2 text-lg font-black text-white">{routine.name}</h2>
        </div>
        {routine.isActive ? (
          <span className="shrink-0 rounded-md bg-[#f4cf3a] px-2 py-1 text-xs font-black text-[#11120f]">
            Activa
          </span>
        ) : null}
      </div>
      <p className="mt-4 text-sm text-[#a9ada6]">
        {routine.dayCount} {routine.dayCount === 1 ? "día" : "días"} ·{" "}
        {routine.exerciseCount}{" "}
        {routine.exerciseCount === 1 ? "ejercicio" : "ejercicios"}
      </p>
    </Link>
  );
}
