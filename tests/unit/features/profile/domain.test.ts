import { describe, expect, it } from "vitest";
import {
  buildProfileMetrics,
  countActiveWeeks,
  formatProfileActivityDate,
  getLatestRecordedExercise,
  getProfileInitials,
  getRecentMuscleGroups,
} from "@/features/profile/domain";
import { profileIdentityFixture } from "../../../fixtures/profile";

describe("dominio de identidad de perfil", () => {
  it("genera iniciales deterministas con nombre y fallback de username", () => {
    expect(getProfileInitials("Lucas Martínez", "lucas")).toBe("LM");
    expect(getProfileInitials("GymBro", "gymbro")).toBe("GY");
    expect(getProfileInitials("", "lucas09")).toBe("LU");
  });

  it("no inventa ceros y reduce las métricas cuando hay poca evidencia", () => {
    expect(buildProfileMetrics(0, 0, 0)).toEqual([]);
    expect(buildProfileMetrics(1, 1, 1)).toEqual([
      { value: 1, label: "Entreno" },
    ]);
    expect(buildProfileMetrics(12, 5, 3)).toHaveLength(3);
  });

  it("cuenta semanas por fecha local de Buenos Aires", () => {
    expect(
      countActiveWeeks([
        "2026-08-03T02:30:00.000Z",
        "2026-08-03T03:30:00.000Z",
        "2026-08-10T03:30:00.000Z",
      ]),
    ).toBe(3);
  });

  it("no infiere grupos musculares con una sola sesión", () => {
    expect(
      getRecentMuscleGroups(profileIdentityFixture.recentActivity.slice(0, 1)),
    ).toEqual([]);
  });

  it("exige presencia repetida para representar músculos recientes", () => {
    expect(
      getRecentMuscleGroups(profileIdentityFixture.recentActivity),
    ).toEqual(["Pecho", "Tríceps"]);
  });

  it("elige el ejercicio más reciente con una serie válida", () => {
    expect(
      getLatestRecordedExercise(profileIdentityFixture.recentActivity),
    ).toMatchObject({
      exerciseName: "Press banca con barra",
      hasValidSet: true,
    });
  });

  it("formatea actividad sin moverla al día UTC siguiente", () => {
    expect(formatProfileActivityDate("2026-08-10T02:30:00.000Z")).toContain(
      "9 AGO",
    );
  });
});
