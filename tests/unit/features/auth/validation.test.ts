import { describe, expect, it } from "vitest";
import {
  normalizeUsername,
  validateOnboardingInput,
  validateRegisterInput,
} from "@/features/auth/validation";

const validOnboarding = {
  username: "lucas.m",
  displayName: "Lucas Martínez",
  trainingLevel: "intermediate",
  primaryGoal: "muscle_gain",
  preferredWeightUnit: "kg",
  biologicalSex: "",
  birthDate: "",
  heightCm: "",
  currentWeightKg: "",
};

describe("validación de registro", () => {
  it("normaliza el correo y acepta contraseñas coincidentes", () => {
    const result = validateRegisterInput({
      email: "  LUCAS@example.com ",
      password: "password-segura",
      passwordConfirmation: "password-segura",
    });

    expect(result).toEqual({
      ok: true,
      data: {
        email: "lucas@example.com",
        password: "password-segura",
        passwordConfirmation: "password-segura",
      },
    });
  });

  it("rechaza una confirmación distinta", () => {
    const result = validateRegisterInput({
      email: "lucas@example.com",
      password: "password-segura",
      passwordConfirmation: "otra-password",
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.fieldErrors.passwordConfirmation).toMatch(/no coinciden/i);
    }
  });

  it("rechaza una contraseña demasiado corta", () => {
    const result = validateRegisterInput({
      email: "lucas@example.com",
      password: "corta",
      passwordConfirmation: "corta",
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.fieldErrors.password).toMatch(/al menos 8/i);
    }
  });
});

describe("validación de onboarding", () => {
  it("normaliza el username y admite punto y guion bajo", () => {
    expect(normalizeUsername("  Lucas.M_09 ")).toBe("lucas.m_09");

    const result = validateOnboardingInput({
      ...validOnboarding,
      username: "  Lucas.M_09 ",
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.username).toBe("lucas.m_09");
    }
  });

  it("rechaza caracteres y longitudes inválidas de username", () => {
    const result = validateOnboardingInput({
      ...validOnboarding,
      username: "lucas martínez",
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.fieldErrors.username).toBeDefined();
    }
  });

  it("rechaza un nombre visible demasiado largo", () => {
    const result = validateOnboardingInput({
      ...validOnboarding,
      displayName: "a".repeat(81),
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.fieldErrors.displayName).toBeDefined();
    }
  });

  it("acepta exclusivamente enums reales", () => {
    const validResult = validateOnboardingInput(validOnboarding);
    const invalidResult = validateOnboardingInput({
      ...validOnboarding,
      trainingLevel: "expert",
      primaryGoal: "definition",
      preferredWeightUnit: "stone",
      biologicalSex: "unknown",
    });

    expect(validResult.ok).toBe(true);
    expect(invalidResult.ok).toBe(false);
    if (!invalidResult.ok) {
      expect(invalidResult.fieldErrors).toMatchObject({
        trainingLevel: expect.any(String),
        primaryGoal: expect.any(String),
        preferredWeightUnit: expect.any(String),
        biologicalSex: expect.any(String),
      });
    }
  });

  it("rechaza fechas futuras y fechas inexistentes", () => {
    const future = validateOnboardingInput(
      { ...validOnboarding, birthDate: "2026-08-07" },
      new Date("2026-08-06T12:00:00Z"),
    );
    const nonexistent = validateOnboardingInput(
      { ...validOnboarding, birthDate: "2024-02-30" },
      new Date("2026-08-06T12:00:00Z"),
    );

    expect(future.ok).toBe(false);
    expect(nonexistent.ok).toBe(false);
  });

  it("aplica los rangos PostgreSQL de altura y peso", () => {
    const invalid = validateOnboardingInput({
      ...validOnboarding,
      heightCm: "301",
      currentWeightKg: "19.9",
    });
    const valid = validateOnboardingInput({
      ...validOnboarding,
      heightCm: "180.5",
      currentWeightKg: "82.4",
    });

    expect(invalid.ok).toBe(false);
    expect(valid.ok).toBe(true);
  });
});
