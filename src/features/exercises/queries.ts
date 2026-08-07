import { cache } from "react";
import type { QueryData } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import type { ExerciseCatalogItem } from "./types";

const exerciseSelect = `
  id,
  name,
  slug,
  description,
  difficulty,
  movement_pattern,
  instructions,
  common_mistakes,
  exercise_muscles (
    involvement_type,
    muscle:muscles (
      id,
      name,
      slug,
      group:muscle_groups (
        id,
        name,
        slug
      )
    )
  ),
  exercise_equipment (
    position,
    item:equipment (
      id,
      name,
      slug
    )
  )
` as const;

type ServerSupabaseClient = Awaited<ReturnType<typeof createClient>>;

function officialExercisesQuery(supabase: ServerSupabaseClient) {
  return supabase
    .from("exercises")
    .select(exerciseSelect)
    .eq("is_custom", false)
    .order("name");
}

type ExerciseQueryRow = QueryData<
  ReturnType<typeof officialExercisesQuery>
>[number];

function mapExercise(row: ExerciseQueryRow): ExerciseCatalogItem {
  if (!row.description || !row.movement_pattern) {
    throw new Error("El catálogo contiene un ejercicio oficial incompleto.");
  }

  const muscles = row.exercise_muscles.map((relation) => {
    if (!relation.muscle?.group) {
      throw new Error("El catálogo contiene una relación muscular inválida.");
    }

    return {
      involvement: relation.involvement_type,
      muscle: {
        id: relation.muscle.id,
        name: relation.muscle.name,
        slug: relation.muscle.slug,
        group: relation.muscle.group,
      },
    };
  });

  const equipment = row.exercise_equipment
    .map((relation) => {
      if (!relation.item) {
        throw new Error(
          "El catálogo contiene una relación de equipo inválida.",
        );
      }

      return {
        ...relation.item,
        position: relation.position,
      };
    })
    .sort((left, right) => left.position - right.position);

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    difficulty: row.difficulty,
    movementPattern: row.movement_pattern,
    instructions: row.instructions,
    commonMistakes: row.common_mistakes,
    muscles,
    equipment,
  };
}

export const listOfficialExercises = cache(async () => {
  const supabase = await createClient();
  const { data, error } = await officialExercisesQuery(supabase);

  if (error) {
    throw new Error("No pudimos cargar la biblioteca de ejercicios.");
  }

  return data.map(mapExercise);
});

export const getOfficialExerciseBySlug = cache(async (slug: string) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("exercises")
    .select(exerciseSelect)
    .eq("is_custom", false)
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    throw new Error("No pudimos cargar el ejercicio.");
  }

  return data ? mapExercise(data) : null;
});
