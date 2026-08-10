import { formatWeight } from "@/features/workouts/domain";
import type { WorkoutSet } from "@/features/workouts/types";
import { getSetTypeLabel } from "../domain";

export function HistoricalSetRow({ set }: Readonly<{ set: WorkoutSet }>) {
  const setType = getSetTypeLabel(set.setType);

  return (
    <li className="grid min-h-14 grid-cols-[4.25rem_minmax(0,1fr)] items-center gap-3 border-t border-[#292c28] py-3 sm:grid-cols-[5rem_minmax(0,1fr)_auto]">
      <span className="text-xs font-bold uppercase text-[#858a82]">
        Serie {set.setNumber}
      </span>
      <span className="font-black tabular-nums text-white">
        {formatWeight(set.weightKg)} × {set.repetitions}
      </span>
      {set.rir !== null || setType ? (
        <span className="col-start-2 flex flex-wrap gap-x-3 text-xs font-bold text-[#a7aba4] sm:col-start-auto">
          {set.rir !== null ? <span>RIR {set.rir}</span> : null}
          {setType ? <span>{setType}</span> : null}
        </span>
      ) : null}
    </li>
  );
}
