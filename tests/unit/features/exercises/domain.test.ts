import { describe, expect, it } from "vitest";
import {
  difficultyLabels,
  movementPatternLabels,
} from "@/features/exercises/constants";
import {
  filterExercises,
  getEquipmentLabel,
  getExerciseFilterOptions,
  groupExerciseMuscles,
  normalizeSearch,
  parseExerciseFilters,
} from "@/features/exercises/domain";
import { exerciseFixtures } from "../../../fixtures/exercises";

describe("filtros de ejercicios", () => {
  it("normaliza búsqueda, espacios, mayúsculas y tildes", () => {
    expect(normalizeSearch("  EXTENSIÓN   de Cadera ")).toBe(
      "extension de cadera",
    );
  });

  it("parsea parámetros válidos y descarta slugs inseguros", () => {
    const params = new URLSearchParams({
      q: "  press   banca ",
      group: " CHEST ",
      muscle: "mid-chest",
      equipment: "../barbell",
    });

    expect(parseExerciseFilters(params)).toEqual({
      query: "press banca",
      muscleGroup: "chest",
      muscle: "mid-chest",
      equipment: "",
    });
  });

  it("busca por nombre sin distinguir mayúsculas", () => {
    const result = filterExercises(exerciseFixtures, {
      query: "PRESS BANCA",
      muscleGroup: "",
      muscle: "",
      equipment: "",
    });

    expect(result.map(({ slug }) => slug)).toEqual(["barbell-bench-press"]);
  });

  it("combina macrogrupo, músculo y equipamiento", () => {
    const result = filterExercises(exerciseFixtures, {
      query: "",
      muscleGroup: "legs",
      muscle: "glutes",
      equipment: "bench",
    });

    expect(result.map(({ slug }) => slug)).toEqual(["barbell-hip-thrust"]);
  });

  it("interpreta equipamiento como un elemento incluido entre los requeridos", () => {
    const result = filterExercises(exerciseFixtures, {
      query: "",
      muscleGroup: "",
      muscle: "",
      equipment: "bench",
    });

    expect(result).toHaveLength(2);
    expect(getEquipmentLabel(result[0])).toBe("Barra +1");
  });

  it("deriva opciones únicas desde las relaciones", () => {
    const options = getExerciseFilterOptions(exerciseFixtures);

    expect(options.muscleGroups.map(({ name }) => name)).toEqual([
      "Abdomen",
      "Pecho",
      "Piernas",
      "Tríceps",
    ]);
    expect(options.equipment.map(({ name }) => name)).toEqual([
      "Banco",
      "Barra",
      "Peso corporal",
    ]);
  });
});

describe("presentación del dominio", () => {
  it("agrupa músculos y coloca primero los grupos con participación principal", () => {
    const groups = groupExerciseMuscles(exerciseFixtures[0]);

    expect(groups.map(({ group }) => group.name)).toEqual(["Pecho", "Tríceps"]);
    expect(groups[0].muscles[0].involvement).toBe("primary");
  });

  it("mapea dificultad y patrón a etiquetas españolas", () => {
    expect(difficultyLabels.intermediate).toBe("Intermedio");
    expect(movementPatternLabels.horizontal_push).toBe("Empuje horizontal");
  });
});
