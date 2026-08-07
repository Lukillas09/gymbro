export type StartWorkoutActionState = Readonly<{
  status: "idle" | "error";
  message?: string;
}>;

export const INITIAL_START_WORKOUT_STATE: StartWorkoutActionState = {
  status: "idle",
};
