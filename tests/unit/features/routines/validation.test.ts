import { describe, expect, it } from "vitest";
import {
  normalizeRoutineText,
  validateDayName,
  validatePrescriptionInput,
  validateRoutineInput,
} from "@/features/routines/validation";

describe("validación de rutinas", () => {
  it("normaliza espacios exteriores e interiores", () => {
    expect(normalizeRoutineText("  Push   Pull\nLegs  ")).toBe(
      "Push Pull Legs",
    );
  });

  it("valida y normaliza nombre y objetivo", () => {
    const result = validateRoutineInput({
      name: "  Torso   Pierna ",
      goal: "muscle_gain",
    });

    expect(result).toEqual({
      ok: true,
      data: { name: "Torso Pierna", goal: "muscle_gain" },
    });
  });

  it("rechaza nombre vacío, demasiado largo y objetivo desconocido", () => {
    expect(validateRoutineInput({ name: "   ", goal: "otro" })).toMatchObject({
      ok: false,
      fieldErrors: { name: expect.any(String), goal: expect.any(String) },
    });
    expect(
      validateRoutineInput({ name: "a".repeat(101), goal: "strength" }),
    ).toMatchObject({ ok: false, fieldErrors: { name: expect.any(String) } });
  });

  it("valida el nombre del día", () => {
    expect(validateDayName("  Push   A ")).toEqual({
      ok: true,
      data: "Push A",
    });
    expect(validateDayName(" ")).toMatchObject({
      ok: false,
      fieldErrors: { dayName: expect.any(String) },
    });
  });
});

describe("validación de prescripción", () => {
  const validInput = {
    targetSets: "4",
    targetRepsMin: "8",
    targetRepsMax: "10",
    restSeconds: "120",
    targetRir: "2",
  };

  it("acepta sets, rango de reps, descanso y RIR válidos", () => {
    expect(validatePrescriptionInput(validInput)).toEqual({
      ok: true,
      data: {
        targetSets: 4,
        targetRepsMin: 8,
        targetRepsMax: 10,
        restSeconds: 120,
        targetRir: 2,
      },
    });
  });

  it("permite RIR vacío", () => {
    expect(
      validatePrescriptionInput({ ...validInput, targetRir: "" }),
    ).toMatchObject({ ok: true, data: { targetRir: null } });
  });

  it("rechaza sets fuera de 1 a 20", () => {
    expect(
      validatePrescriptionInput({ ...validInput, targetSets: "21" }),
    ).toMatchObject({
      ok: false,
      fieldErrors: { targetSets: expect.any(String) },
    });
  });

  it("rechaza un máximo de reps menor al mínimo", () => {
    expect(
      validatePrescriptionInput({
        ...validInput,
        targetRepsMin: "12",
        targetRepsMax: "8",
      }),
    ).toMatchObject({
      ok: false,
      fieldErrors: { targetRepsMax: expect.any(String) },
    });
  });

  it("rechaza descanso fuera de 0 a 3600", () => {
    expect(
      validatePrescriptionInput({ ...validInput, restSeconds: "3601" }),
    ).toMatchObject({
      ok: false,
      fieldErrors: { restSeconds: expect.any(String) },
    });
  });

  it("rechaza RIR fuera de 0 a 5", () => {
    expect(
      validatePrescriptionInput({ ...validInput, targetRir: "6" }),
    ).toMatchObject({
      ok: false,
      fieldErrors: { targetRir: expect.any(String) },
    });
  });
});
