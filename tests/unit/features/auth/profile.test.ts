import { describe, expect, it } from "vitest";
import { isProfileComplete, type Profile } from "@/features/auth/profile";

const profile: Profile = {
  avatar_url: null,
  biological_sex: null,
  birth_date: null,
  created_at: "2026-08-06T00:00:00Z",
  current_weight_kg: null,
  display_name: "Lucas",
  height_cm: null,
  id: "11111111-1111-4111-8111-111111111111",
  preferred_weight_unit: "kg",
  primary_goal: "strength",
  training_level: "beginner",
  updated_at: "2026-08-06T00:00:00Z",
  username: "lucas.09",
};

describe("criterio de onboarding", () => {
  it("considera completo un perfil con los cinco campos requeridos", () => {
    expect(isProfileComplete(profile)).toBe(true);
  });

  it.each([
    ["username", null],
    ["display_name", null],
    ["training_level", null],
    ["primary_goal", null],
  ] as const)("considera incompleto el perfil sin %s", (field, value) => {
    expect(isProfileComplete({ ...profile, [field]: value })).toBe(false);
  });

  it("considera incompleto un profile inexistente", () => {
    expect(isProfileComplete(null)).toBe(false);
  });
});
