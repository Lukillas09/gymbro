import { TRAINING_GOAL_OPTIONS } from "@/features/auth/constants";
import {
  DAY_NAME_MAX_LENGTH,
  REST_SECONDS_MAX,
  REST_SECONDS_MIN,
  ROUTINE_NAME_MAX_LENGTH,
  TARGET_REPS_MAX,
  TARGET_REPS_MIN,
  TARGET_RIR_MAX,
  TARGET_RIR_MIN,
  TARGET_SETS_MAX,
  TARGET_SETS_MIN,
} from "./constants";
import type { TrainingGoal } from "./types";

export type RoutineFieldName = "name" | "goal";
export type DayFieldName = "dayName";
export type PrescriptionFieldName =
  | "targetSets"
  | "targetRepsMin"
  | "targetRepsMax"
  | "restSeconds"
  | "targetRir";

type ValidationResult<Data, FieldName extends string> =
  | Readonly<{ ok: true; data: Data }>
  | Readonly<{
      ok: false;
      fieldErrors: Partial<Record<FieldName, string>>;
    }>;

export type RoutineInput = Readonly<{
  name: string;
  goal: string;
}>;

export type ValidRoutineInput = Readonly<{
  name: string;
  goal: TrainingGoal;
}>;

export type PrescriptionInput = Readonly<{
  targetSets: string;
  targetRepsMin: string;
  targetRepsMax: string;
  restSeconds: string;
  targetRir: string;
}>;

export type ValidPrescriptionInput = Readonly<{
  targetSets: number;
  targetRepsMin: number;
  targetRepsMax: number;
  restSeconds: number;
  targetRir: number | null;
}>;

export function normalizeRoutineText(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

function parseInteger(value: string) {
  const normalized = value.trim();

  if (!/^-?\d+$/.test(normalized)) {
    return null;
  }

  const parsed = Number(normalized);
  return Number.isSafeInteger(parsed) ? parsed : null;
}

export function validateRoutineInput(
  input: RoutineInput,
): ValidationResult<ValidRoutineInput, RoutineFieldName> {
  const name = normalizeRoutineText(input.name);
  const fieldErrors: Partial<Record<RoutineFieldName, string>> = {};
  const goal = TRAINING_GOAL_OPTIONS.find(
    (option) => option.value === input.goal,
  )?.value;

  if (!name) {
    fieldErrors.name = "Ingresá un nombre para la rutina.";
  } else if (name.length > ROUTINE_NAME_MAX_LENGTH) {
    fieldErrors.name = `Usá hasta ${ROUTINE_NAME_MAX_LENGTH} caracteres.`;
  }

  if (!goal) {
    fieldErrors.goal = "Elegí un objetivo válido.";
  }

  if (Object.keys(fieldErrors).length > 0 || !goal) {
    return { ok: false, fieldErrors };
  }

  return { ok: true, data: { name, goal } };
}

export function validateDayName(
  value: string,
): ValidationResult<string, DayFieldName> {
  const dayName = normalizeRoutineText(value);

  if (!dayName) {
    return {
      ok: false,
      fieldErrors: { dayName: "Ingresá un nombre para el día." },
    };
  }

  if (dayName.length > DAY_NAME_MAX_LENGTH) {
    return {
      ok: false,
      fieldErrors: {
        dayName: `Usá hasta ${DAY_NAME_MAX_LENGTH} caracteres.`,
      },
    };
  }

  return { ok: true, data: dayName };
}

export function validatePrescriptionInput(
  input: PrescriptionInput,
): ValidationResult<ValidPrescriptionInput, PrescriptionFieldName> {
  const targetSets = parseInteger(input.targetSets);
  const targetRepsMin = parseInteger(input.targetRepsMin);
  const targetRepsMax = parseInteger(input.targetRepsMax);
  const restSeconds = parseInteger(input.restSeconds);
  const targetRir = input.targetRir.trim()
    ? parseInteger(input.targetRir)
    : null;
  const fieldErrors: Partial<Record<PrescriptionFieldName, string>> = {};

  if (
    targetSets === null ||
    targetSets < TARGET_SETS_MIN ||
    targetSets > TARGET_SETS_MAX
  ) {
    fieldErrors.targetSets = `Usá entre ${TARGET_SETS_MIN} y ${TARGET_SETS_MAX} series.`;
  }

  if (
    targetRepsMin === null ||
    targetRepsMin < TARGET_REPS_MIN ||
    targetRepsMin > TARGET_REPS_MAX
  ) {
    fieldErrors.targetRepsMin = `Usá entre ${TARGET_REPS_MIN} y ${TARGET_REPS_MAX} repeticiones.`;
  }

  if (
    targetRepsMax === null ||
    targetRepsMax < TARGET_REPS_MIN ||
    targetRepsMax > TARGET_REPS_MAX
  ) {
    fieldErrors.targetRepsMax = `Usá entre ${TARGET_REPS_MIN} y ${TARGET_REPS_MAX} repeticiones.`;
  } else if (targetRepsMin !== null && targetRepsMax < targetRepsMin) {
    fieldErrors.targetRepsMax = "El máximo no puede ser menor que el mínimo.";
  }

  if (
    restSeconds === null ||
    restSeconds < REST_SECONDS_MIN ||
    restSeconds > REST_SECONDS_MAX
  ) {
    fieldErrors.restSeconds = `Usá entre ${REST_SECONDS_MIN} y ${REST_SECONDS_MAX} segundos.`;
  }

  if (
    input.targetRir.trim() &&
    (targetRir === null ||
      targetRir < TARGET_RIR_MIN ||
      targetRir > TARGET_RIR_MAX)
  ) {
    fieldErrors.targetRir = `Usá un RIR entre ${TARGET_RIR_MIN} y ${TARGET_RIR_MAX}, o dejalo vacío.`;
  }

  if (
    Object.keys(fieldErrors).length > 0 ||
    targetSets === null ||
    targetRepsMin === null ||
    targetRepsMax === null ||
    restSeconds === null
  ) {
    return { ok: false, fieldErrors };
  }

  return {
    ok: true,
    data: {
      targetSets,
      targetRepsMin,
      targetRepsMax,
      restSeconds,
      targetRir,
    },
  };
}
