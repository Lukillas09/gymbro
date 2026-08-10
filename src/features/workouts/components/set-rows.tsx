import { formatWeight, getNextSetNumber } from "../domain";
import type { WorkoutExercise } from "../types";

export function SetRows({ exercise }: Readonly<{ exercise: WorkoutExercise }>) {
  const nextSetNumber = getNextSetNumber(exercise);

  return (
    <ol
      aria-label={`Series de ${exercise.exerciseName}`}
      className="divide-y divide-[#252824] border-y border-[#252824]"
    >
      {Array.from({ length: exercise.targetSets }, (_, index) => {
        const setNumber = index + 1;
        const completed = exercise.sets.find(
          (set) => set.setNumber === setNumber,
        );
        const current = nextSetNumber === setNumber;

        return (
          <li
            className="grid min-h-14 grid-cols-[1.25rem_minmax(0,1fr)_auto] items-center gap-3 py-2"
            key={setNumber}
          >
            <span
              aria-hidden="true"
              className={`text-center font-black ${
                completed
                  ? "text-[#f4cf3a]"
                  : current
                    ? "text-white"
                    : "text-[#5f645c]"
              }`}
            >
              {completed ? "✓" : current ? "●" : "·"}
            </span>
            <span
              className={
                current ? "font-extrabold text-white" : "text-[#a9ada6]"
              }
            >
              Serie {setNumber}
            </span>
            <span className="text-right text-sm font-bold tabular-nums text-[#d6d8d3]">
              {completed
                ? `${formatWeight(completed.weightKg)} · ${completed.repetitions}`
                : `${exercise.targetRepsMin}–${exercise.targetRepsMax} reps`}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
