import type { AuthFieldName } from "./action-state";
import {
  BIOLOGICAL_SEX_OPTIONS,
  MINIMUM_PASSWORD_LENGTH,
  TRAINING_GOAL_OPTIONS,
  TRAINING_LEVEL_OPTIONS,
  WEIGHT_UNIT_OPTIONS,
  type BiologicalSex,
  type TrainingGoal,
  type TrainingLevel,
  type WeightUnit,
} from "./constants";

type FieldErrors = Partial<Record<AuthFieldName, string>>;

type ValidationResult<T> =
  | Readonly<{ ok: true; data: T }>
  | Readonly<{ ok: false; fieldErrors: FieldErrors }>;

export type LoginInput = Readonly<{
  email: string;
  password: string;
}>;

export type RegisterInput = LoginInput &
  Readonly<{
    passwordConfirmation: string;
  }>;

export type OnboardingInput = Readonly<{
  username: string;
  displayName: string;
  trainingLevel: string;
  primaryGoal: string;
  preferredWeightUnit: string;
  biologicalSex: string;
  birthDate: string;
  heightCm: string;
  currentWeightKg: string;
}>;

export type ValidatedOnboarding = Readonly<{
  username: string;
  display_name: string;
  training_level: TrainingLevel;
  primary_goal: TrainingGoal;
  preferred_weight_unit: WeightUnit;
  biological_sex: BiologicalSex | null;
  birth_date: string | null;
  height_cm: number | null;
  current_weight_kg: number | null;
}>;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const usernamePattern = /^[a-z0-9_.]{3,20}$/;

function hasOption<T extends string>(
  options: ReadonlyArray<Readonly<{ value: T }>>,
  value: string,
): value is T {
  return options.some((option) => option.value === value);
}

function parseOptionalNumber(
  value: string,
  minimum: number,
  maximum: number,
  field: "heightCm" | "currentWeightKg",
  label: string,
  fieldErrors: FieldErrors,
) {
  const normalized = value.trim();

  if (!normalized) {
    return null;
  }

  const number = Number(normalized);

  if (!Number.isFinite(number) || number < minimum || number > maximum) {
    fieldErrors[field] = `${label} debe estar entre ${minimum} y ${maximum}.`;
    return null;
  }

  return number;
}

function isValidCalendarDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

export function normalizeUsername(value: string) {
  return value.trim().toLowerCase();
}

export function validateLoginInput(
  input: LoginInput,
): ValidationResult<LoginInput> {
  const email = input.email.trim().toLowerCase();
  const fieldErrors: FieldErrors = {};

  if (!emailPattern.test(email)) {
    fieldErrors.email = "Ingresá un correo electrónico válido.";
  }

  if (!input.password) {
    fieldErrors.password = "Ingresá tu contraseña.";
  }

  return Object.keys(fieldErrors).length > 0
    ? { ok: false, fieldErrors }
    : { ok: true, data: { email, password: input.password } };
}

export function validateRegisterInput(
  input: RegisterInput,
): ValidationResult<RegisterInput> {
  const loginResult = validateLoginInput(input);
  const fieldErrors: FieldErrors = loginResult.ok
    ? {}
    : { ...loginResult.fieldErrors };

  if (input.password.length < MINIMUM_PASSWORD_LENGTH) {
    fieldErrors.password = `Usá al menos ${MINIMUM_PASSWORD_LENGTH} caracteres.`;
  }

  if (input.password.length > 72) {
    fieldErrors.password = "La contraseña no puede superar 72 caracteres.";
  }

  if (input.password !== input.passwordConfirmation) {
    fieldErrors.passwordConfirmation = "Las contraseñas no coinciden.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, fieldErrors };
  }

  return {
    ok: true,
    data: {
      email: input.email.trim().toLowerCase(),
      password: input.password,
      passwordConfirmation: input.passwordConfirmation,
    },
  };
}

export function validateOnboardingInput(
  input: OnboardingInput,
  today = new Date(),
): ValidationResult<ValidatedOnboarding> {
  const fieldErrors: FieldErrors = {};
  const username = normalizeUsername(input.username);
  const displayName = input.displayName.trim();

  if (!usernamePattern.test(username)) {
    fieldErrors.username =
      "Usá de 3 a 20 letras minúsculas, números, punto o guion bajo.";
  }

  if (displayName.length < 1 || displayName.length > 80) {
    fieldErrors.displayName = "Ingresá un nombre de hasta 80 caracteres.";
  }

  if (!hasOption(TRAINING_LEVEL_OPTIONS, input.trainingLevel)) {
    fieldErrors.trainingLevel = "Elegí un nivel de entrenamiento válido.";
  }

  if (!hasOption(TRAINING_GOAL_OPTIONS, input.primaryGoal)) {
    fieldErrors.primaryGoal = "Elegí un objetivo válido.";
  }

  if (!hasOption(WEIGHT_UNIT_OPTIONS, input.preferredWeightUnit)) {
    fieldErrors.preferredWeightUnit = "Elegí una unidad de peso válida.";
  }

  if (
    input.biologicalSex &&
    !hasOption(BIOLOGICAL_SEX_OPTIONS, input.biologicalSex)
  ) {
    fieldErrors.biologicalSex = "Elegí una opción válida.";
  }

  const birthDate = input.birthDate.trim();

  if (birthDate) {
    const todayValue = [
      today.getUTCFullYear().toString().padStart(4, "0"),
      (today.getUTCMonth() + 1).toString().padStart(2, "0"),
      today.getUTCDate().toString().padStart(2, "0"),
    ].join("-");

    if (
      !isValidCalendarDate(birthDate) ||
      birthDate < "1900-01-01" ||
      birthDate > todayValue
    ) {
      fieldErrors.birthDate = "Ingresá una fecha válida que no sea futura.";
    }
  }

  const heightCm = parseOptionalNumber(
    input.heightCm,
    50,
    300,
    "heightCm",
    "La altura",
    fieldErrors,
  );
  const currentWeightKg = parseOptionalNumber(
    input.currentWeightKg,
    20,
    500,
    "currentWeightKg",
    "El peso",
    fieldErrors,
  );

  if (
    Object.keys(fieldErrors).length > 0 ||
    !hasOption(TRAINING_LEVEL_OPTIONS, input.trainingLevel) ||
    !hasOption(TRAINING_GOAL_OPTIONS, input.primaryGoal) ||
    !hasOption(WEIGHT_UNIT_OPTIONS, input.preferredWeightUnit)
  ) {
    return { ok: false, fieldErrors };
  }

  return {
    ok: true,
    data: {
      username,
      display_name: displayName,
      training_level: input.trainingLevel,
      primary_goal: input.primaryGoal,
      preferred_weight_unit: input.preferredWeightUnit,
      biological_sex: input.biologicalSex
        ? (input.biologicalSex as BiologicalSex)
        : null,
      birth_date: birthDate || null,
      height_cm: heightCm,
      current_weight_kg: currentWeightKg,
    },
  };
}
