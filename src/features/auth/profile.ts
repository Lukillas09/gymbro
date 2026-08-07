import {
  TRAINING_GOAL_OPTIONS,
  TRAINING_LEVEL_OPTIONS,
  WEIGHT_UNIT_OPTIONS,
} from "./constants";
import type { Database } from "@/types/database.generated";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export function isProfileComplete(profile: Profile | null) {
  if (!profile) {
    return false;
  }

  return Boolean(
    profile.username?.trim() &&
    profile.display_name?.trim() &&
    TRAINING_LEVEL_OPTIONS.some(
      (option) => option.value === profile.training_level,
    ) &&
    TRAINING_GOAL_OPTIONS.some(
      (option) => option.value === profile.primary_goal,
    ) &&
    WEIGHT_UNIT_OPTIONS.some(
      (option) => option.value === profile.preferred_weight_unit,
    ),
  );
}
