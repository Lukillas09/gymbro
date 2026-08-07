import { describe, expect, it } from "vitest";
import { validateWorkoutSetInput } from "@/features/workouts/validation";

const validInput = {
  workoutExerciseId: "99999999-9999-4999-8999-999999999991",
  setNumber: 1,
  weightKg: "82.5",
  repetitions: "9",
};

describe("validación de series realizadas", () => {
  it("normaliza peso decimal con punto o coma", () => {
    expect(validateWorkoutSetInput(validInput)).toMatchObject({
      ok: true,
      data: { weightKg: 82.5, repetitions: 9 },
    });
    expect(
      validateWorkoutSetInput({ ...validInput, weightKg: "82,5" }),
    ).toMatchObject({ ok: true, data: { weightKg: 82.5 } });
  });

  it("rechaza peso fuera de 0–2000 y más de tres decimales", () => {
    expect(
      validateWorkoutSetInput({ ...validInput, weightKg: "2000.0015" }).ok,
    ).toBe(false);
    expect(validateWorkoutSetInput({ ...validInput, weightKg: "-1" }).ok).toBe(
      false,
    );
  });

  it("rechaza repeticiones no enteras o fuera de 0–1000", () => {
    expect(
      validateWorkoutSetInput({ ...validInput, repetitions: "8.5" }).ok,
    ).toBe(false);
    expect(
      validateWorkoutSetInput({ ...validInput, repetitions: "1001" }).ok,
    ).toBe(false);
  });

  it("rechaza referencias y números de serie inválidos", () => {
    expect(
      validateWorkoutSetInput({
        ...validInput,
        workoutExerciseId: "invalid",
      }).ok,
    ).toBe(false);
    expect(validateWorkoutSetInput({ ...validInput, setNumber: 21 }).ok).toBe(
      false,
    );
  });
});
