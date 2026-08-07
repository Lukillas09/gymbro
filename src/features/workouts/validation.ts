import { isUuid } from "@/features/routines/validation";

type WorkoutSetValidation =
  | Readonly<{
      ok: true;
      data: Readonly<{
        workoutExerciseId: string;
        setNumber: number;
        weightKg: number;
        repetitions: number;
      }>;
    }>
  | Readonly<{
      ok: false;
      fieldErrors: Readonly<{
        weightKg?: string;
        repetitions?: string;
      }>;
    }>;

function parseInteger(value: string) {
  if (!/^\d+$/.test(value.trim())) return null;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) ? parsed : null;
}

function parseWeight(value: string) {
  const normalized = value.trim().replace(",", ".");
  if (!/^\d+(?:\.\d{1,3})?$/.test(normalized)) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

export function validateWorkoutSetInput(input: {
  workoutExerciseId: string;
  setNumber: number;
  weightKg: string;
  repetitions: string;
}): WorkoutSetValidation {
  const weightKg = parseWeight(input.weightKg);
  const repetitions = parseInteger(input.repetitions);
  const fieldErrors: { weightKg?: string; repetitions?: string } = {};

  if (weightKg === null || weightKg < 0 || weightKg > 2000) {
    fieldErrors.weightKg = "Ingresá un peso entre 0 y 2000 kg.";
  }

  if (repetitions === null || repetitions < 0 || repetitions > 1000) {
    fieldErrors.repetitions = "Ingresá repeticiones entre 0 y 1000.";
  }

  if (
    !isUuid(input.workoutExerciseId) ||
    !Number.isInteger(input.setNumber) ||
    input.setNumber < 1 ||
    input.setNumber > 20
  ) {
    return { ok: false, fieldErrors };
  }

  if (
    Object.keys(fieldErrors).length > 0 ||
    weightKg === null ||
    repetitions === null
  ) {
    return { ok: false, fieldErrors };
  }

  return {
    ok: true,
    data: {
      workoutExerciseId: input.workoutExerciseId,
      setNumber: input.setNumber,
      weightKg,
      repetitions,
    },
  };
}

export { isUuid };
