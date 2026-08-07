export type AuthFieldName =
  | "email"
  | "password"
  | "passwordConfirmation"
  | "username"
  | "displayName"
  | "trainingLevel"
  | "primaryGoal"
  | "preferredWeightUnit"
  | "biologicalSex"
  | "birthDate"
  | "heightCm"
  | "currentWeightKg";

export type AuthActionState = Readonly<{
  status: "idle" | "error" | "confirmation_required";
  message?: string;
  fieldErrors?: Partial<Record<AuthFieldName, string>>;
}>;

export const INITIAL_AUTH_ACTION_STATE: AuthActionState = {
  status: "idle",
};
