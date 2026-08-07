import { describe, expect, it } from "vitest";
import {
  calculatePrimaryMuscleSummary,
  duplicateDayTemplate,
  formatPrescription,
  formatRestTime,
  getRoutineStatus,
  moveOrderedId,
} from "@/features/routines/domain";
import { routineFixture } from "../../../fixtures/routines";

describe("dominio de rutinas", () => {
  it("distingue estados activo, inactivo y archivado", () => {
    expect(getRoutineStatus(routineFixture)).toBe("active");
    expect(getRoutineStatus({ isActive: false, archivedAt: null })).toBe(
      "inactive",
    );
    expect(
      getRoutineStatus({
        isActive: false,
        archivedAt: "2026-08-09T12:00:00.000Z",
      }),
    ).toBe("archived");
  });

  it("sube y baja elementos sin salir de los límites", () => {
    expect(moveOrderedId(["a", "b", "c"], "b", "up")).toEqual(["b", "a", "c"]);
    expect(moveOrderedId(["a", "b", "c"], "b", "down")).toEqual([
      "a",
      "c",
      "b",
    ]);
    expect(moveOrderedId(["a", "b"], "a", "up")).toEqual(["a", "b"]);
  });

  it("duplica nombre, orden y prescripciones sin conservar ids", () => {
    const duplicate = duplicateDayTemplate(routineFixture.days[0], 2);

    expect(duplicate).toMatchObject({
      id: "",
      name: "Torso A copia",
      position: 2,
      weekday: null,
    });
    expect(duplicate.exercises[0]).toMatchObject({
      id: "",
      targetSets: 4,
      targetRepsMin: 8,
      targetRepsMax: 10,
      restSeconds: 120,
      targetRir: 2,
    });
  });

  it("calcula sólo series primary una vez por macrogrupo y prescripción", () => {
    const summary = calculatePrimaryMuscleSummary(routineFixture.days);

    expect(summary).toEqual([
      {
        groupId: "group-chest",
        groupName: "Pecho",
        groupSlug: "chest",
        primarySets: 4,
        prescriptionCount: 1,
      },
      {
        groupId: "group-legs",
        groupName: "Piernas",
        groupSlug: "legs",
        primarySets: 3,
        prescriptionCount: 1,
      },
    ]);
  });

  it("formatea prescripciones y descansos", () => {
    expect(formatPrescription(routineFixture.days[0].exercises[0])).toBe(
      "4 × 8–10",
    );
    expect(formatRestTime(120)).toBe("2 min");
    expect(formatRestTime(90)).toBe("1 min 30 s");
    expect(formatRestTime(0)).toBe("Sin descanso");
  });
});
