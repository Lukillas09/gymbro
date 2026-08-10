import { formatWeight } from "../domain";
import type { PreviousExercisePerformance } from "../types";

export function LastSession({
  performance,
}: Readonly<{ performance: PreviousExercisePerformance | undefined }>) {
  return (
    <section aria-labelledby="last-session-title">
      <p
        className="text-xs font-bold uppercase text-[#8f948c]"
        id="last-session-title"
      >
        Última vez
      </p>
      {performance && performance.sets.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm font-bold tabular-nums text-[#d0d3cd]">
          {performance.sets.map((set) => (
            <span key={set.id}>
              {formatWeight(set.weightKg)} × {set.repetitions}
            </span>
          ))}
        </div>
      ) : (
        <p className="mt-2 text-sm text-[#777c74]">Sin registros anteriores.</p>
      )}
    </section>
  );
}
