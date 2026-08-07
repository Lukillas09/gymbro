import { TRAINING_GOAL_OPTIONS } from "@/features/auth/constants";
import type { TrainingGoal } from "./types";

export const ROUTINE_NAME_MAX_LENGTH = 100;
export const DAY_NAME_MAX_LENGTH = 100;
export const TARGET_SETS_MIN = 1;
export const TARGET_SETS_MAX = 20;
export const TARGET_REPS_MIN = 1;
export const TARGET_REPS_MAX = 1000;
export const REST_SECONDS_MIN = 0;
export const REST_SECONDS_MAX = 3600;
export const TARGET_RIR_MIN = 0;
export const TARGET_RIR_MAX = 5;

export const DEFAULT_PRESCRIPTION = {
  targetSets: 3,
  targetRepsMin: 8,
  targetRepsMax: 12,
  restSeconds: 90,
  targetRir: null,
} as const;

export const REST_PRESETS = [60, 90, 120, 180] as const;

export function getTrainingGoalLabel(goal: TrainingGoal) {
  return (
    TRAINING_GOAL_OPTIONS.find((option) => option.value === goal)?.label ?? goal
  );
}
