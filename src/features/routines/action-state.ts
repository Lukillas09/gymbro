import type {
  DayFieldName,
  PrescriptionFieldName,
  RoutineFieldName,
} from "./validation";

export type RoutineActionFieldName =
  RoutineFieldName | DayFieldName | PrescriptionFieldName;

export type RoutineActionState = Readonly<{
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Partial<Record<RoutineActionFieldName, string>>;
}>;

export const INITIAL_ROUTINE_ACTION_STATE: RoutineActionState = {
  status: "idle",
};
