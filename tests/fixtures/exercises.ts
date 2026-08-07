import type { ExerciseCatalogItem } from "@/features/exercises/types";

const groups = {
  chest: { id: "group-chest", name: "Pecho", slug: "chest" },
  triceps: { id: "group-triceps", name: "Tríceps", slug: "triceps" },
  legs: { id: "group-legs", name: "Piernas", slug: "legs" },
  abdomen: { id: "group-abdomen", name: "Abdomen", slug: "abdomen" },
} as const;

export const exerciseFixtures = [
  {
    id: "exercise-bench",
    name: "Press banca con barra",
    slug: "barbell-bench-press",
    description: "Empuje horizontal con barra para desarrollar el pecho.",
    difficulty: "intermediate",
    movementPattern: "horizontal_push",
    instructions: [
      "Apoyá los pies y fijá las escápulas.",
      "Descendé la barra con control.",
      "Empujá manteniendo estabilidad.",
    ],
    commonMistakes: ["Levantar los glúteos.", "Rebotar la barra."],
    muscles: [
      {
        involvement: "primary",
        muscle: {
          id: "muscle-chest",
          name: "Pectoral medio",
          slug: "mid-chest",
          group: groups.chest,
        },
      },
      {
        involvement: "secondary",
        muscle: {
          id: "muscle-triceps",
          name: "Cabeza lateral",
          slug: "triceps-lateral-head",
          group: groups.triceps,
        },
      },
    ],
    equipment: [
      { id: "equipment-barbell", name: "Barra", slug: "barbell", position: 1 },
      { id: "equipment-bench", name: "Banco", slug: "bench", position: 2 },
    ],
  },
  {
    id: "exercise-hip-thrust",
    name: "Hip thrust con barra",
    slug: "barbell-hip-thrust",
    description: "Extensión de cadera para priorizar glúteos.",
    difficulty: "intermediate",
    movementPattern: "hip_hinge",
    instructions: ["Apoyá la espalda.", "Extendé la cadera con control."],
    commonMistakes: ["Hiperextender la espalda."],
    muscles: [
      {
        involvement: "primary",
        muscle: {
          id: "muscle-glutes",
          name: "Glúteos",
          slug: "glutes",
          group: groups.legs,
        },
      },
    ],
    equipment: [
      { id: "equipment-barbell", name: "Barra", slug: "barbell", position: 1 },
      { id: "equipment-bench", name: "Banco", slug: "bench", position: 2 },
    ],
  },
  {
    id: "exercise-plank",
    name: "Plancha frontal",
    slug: "front-plank",
    description: "Estabilidad del tronco con peso corporal.",
    difficulty: "beginner",
    movementPattern: "core_stability",
    instructions: ["Alineá el cuerpo.", "Respirá con el abdomen activo."],
    commonMistakes: ["Dejar caer la cadera."],
    muscles: [
      {
        involvement: "primary",
        muscle: {
          id: "muscle-transverse",
          name: "Transverso abdominal",
          slug: "transverse-abdominis",
          group: groups.abdomen,
        },
      },
    ],
    equipment: [
      {
        id: "equipment-bodyweight",
        name: "Peso corporal",
        slug: "bodyweight",
        position: 1,
      },
    ],
  },
] satisfies readonly ExerciseCatalogItem[];
