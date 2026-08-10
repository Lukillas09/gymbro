import {
  difficultyLabels,
  involvementLabels,
  movementPatternLabels,
} from "../constants";
import { groupExerciseMuscles } from "../domain";
import type { ExerciseCatalogItem } from "../types";

type ExerciseDetailProps = Readonly<{
  exercise: ExerciseCatalogItem;
}>;

const involvementStyles = {
  primary: "border-[#6f5b12] bg-[#2b260f] text-[#f4cf3a]",
  secondary: "border-[#3a3e37] bg-[#1b1e1a] text-[#c2c6bf]",
  stabilizer: "border-[#30342e] bg-transparent text-[#8f948c]",
} as const;

export function ExerciseDetail({ exercise }: ExerciseDetailProps) {
  const muscleGroups = groupExerciseMuscles(exercise);

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap gap-2" aria-label="Clasificación">
        <span className="rounded-md border border-[#5d501d] bg-[#24200f] px-3 py-1.5 text-xs font-bold text-[#f4cf3a]">
          {difficultyLabels[exercise.difficulty]}
        </span>
        <span className="rounded-md border border-[#353932] px-3 py-1.5 text-xs font-bold text-[#b8bcb5]">
          {movementPatternLabels[exercise.movementPattern]}
        </span>
      </div>

      <section aria-labelledby="equipment-title">
        <h2 className="text-lg font-extrabold text-white" id="equipment-title">
          Equipamiento requerido
        </h2>
        <ul className="mt-4 flex flex-wrap gap-2">
          {exercise.equipment.map((item) => (
            <li
              className="rounded-md border border-[#353932] bg-[#151714] px-3 py-2 text-sm text-[#d3d6d0]"
              key={item.id}
            >
              {item.name}
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="muscles-title">
        <h2 className="text-lg font-extrabold text-white" id="muscles-title">
          Músculos trabajados
        </h2>
        <div className="mt-4 divide-y divide-[#282b27] border-y border-[#282b27]">
          {muscleGroups.map(({ group, muscles }) => (
            <div className="py-5" key={group.id}>
              <h3 className="text-xs font-black uppercase text-[#8f948c]">
                {group.name}
              </h3>
              <ul className="mt-3 space-y-3">
                {muscles.map(({ involvement, muscle }) => (
                  <li
                    className="flex flex-wrap items-center justify-between gap-3"
                    key={muscle.id}
                  >
                    <span className="text-sm font-semibold text-white">
                      {muscle.name}
                    </span>
                    <span
                      className={`rounded-md border px-2 py-1 text-xs font-bold ${involvementStyles[involvement]}`}
                    >
                      {involvementLabels[involvement]}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="technique-title">
        <h2 className="text-lg font-extrabold text-white" id="technique-title">
          Técnica paso a paso
        </h2>
        <ol className="mt-4 space-y-4">
          {exercise.instructions.map((instruction, index) => (
            <li className="flex gap-4" key={instruction}>
              <span className="grid size-8 shrink-0 place-items-center rounded-md bg-[#f4cf3a] text-sm font-black text-[#11120f]">
                {index + 1}
              </span>
              <p className="pt-1 text-sm leading-6 text-[#c4c8c1]">
                {instruction}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="mistakes-title">
        <h2 className="text-lg font-extrabold text-white" id="mistakes-title">
          Errores comunes
        </h2>
        <ul className="mt-4 space-y-3 border-l-2 border-[#5a4c17] pl-5">
          {exercise.commonMistakes.map((mistake) => (
            <li className="text-sm leading-6 text-[#c4c8c1]" key={mistake}>
              {mistake}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
