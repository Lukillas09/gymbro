import { compareFactualProgress } from "@/features/workouts/domain";
import { APP_TIME_ZONE, getLocalRollingDayRange } from "@/lib/date-time";
import type {
  ExercisePerformance,
  ExerciseProgressDetail,
  ProgressExerciseCatalogItem,
  ProgressExerciseItem,
  ProgressOverview,
  ProgressPeriod,
  ProgressSourceExercise,
  ProgressSourceSession,
  ProgressSourceSet,
  WeightPersonalRecord,
} from "./types";

export const PROGRESS_PERIOD_DAYS = 28;
export const PROGRESS_WEEK_DAYS = 7;

export type ProgressInterpretation = Readonly<{
  title: string;
  description: string;
}>;

export function getProgressPeriod(
  now: Date,
  timeZone = APP_TIME_ZONE,
): ProgressPeriod {
  const current = getLocalRollingDayRange(now, timeZone, PROGRESS_PERIOD_DAYS);
  const previous = getLocalRollingDayRange(
    now,
    timeZone,
    PROGRESS_PERIOD_DAYS,
    PROGRESS_PERIOD_DAYS,
  );
  const weeks = Array.from({ length: 4 }, (_, index) =>
    getLocalRollingDayRange(
      now,
      timeZone,
      PROGRESS_WEEK_DAYS,
      PROGRESS_WEEK_DAYS * (3 - index),
    ),
  );

  return { current, previous, weeks };
}

function compareRepresentativeSets(
  left: ProgressSourceSet,
  right: ProgressSourceSet,
) {
  return (
    right.weightKg - left.weightKg ||
    right.repetitions - left.repetitions ||
    left.setNumber - right.setNumber ||
    left.id.localeCompare(right.id)
  );
}

export function getRepresentativeSet(
  sets: readonly ProgressSourceSet[],
): ProgressSourceSet | null {
  return (
    sets
      .filter(({ repetitions }) => repetitions > 0)
      .toSorted(compareRepresentativeSets)[0] ?? null
  );
}

function asPerformance(
  session: ProgressSourceSession,
  exercise: ProgressSourceExercise,
): ExercisePerformance | null {
  const representativeSet = getRepresentativeSet(exercise.sets);
  if (!representativeSet) return null;
  return {
    sessionId: session.id,
    completedAt: session.completedAt,
    representativeSet,
  };
}

function performancesForExercise(
  sessions: readonly ProgressSourceSession[],
  exerciseId: string,
) {
  return sessions
    .flatMap((session) => {
      const exercise = session.exercises.find(
        (candidate) => candidate.exerciseId === exerciseId,
      );
      if (!exercise) return [];
      const performance = asPerformance(session, exercise);
      return performance ? [performance] : [];
    })
    .toSorted(
      (left, right) =>
        Date.parse(right.completedAt) - Date.parse(left.completedAt) ||
        right.sessionId.localeCompare(left.sessionId),
    );
}

function getPeriodBest(
  sessions: readonly ProgressSourceSession[],
  exerciseId: string,
) {
  return (
    sessions
      .flatMap((session) =>
        session.exercises
          .filter((exercise) => exercise.exerciseId === exerciseId)
          .flatMap((exercise) => exercise.sets),
      )
      .filter(({ repetitions }) => repetitions > 0)
      .toSorted(compareRepresentativeSets)[0] ?? null
  );
}

export function buildProgressOverview(
  currentSessions: readonly ProgressSourceSession[],
  previousSessions: readonly ProgressSourceSession[],
  catalog: readonly ProgressExerciseCatalogItem[],
  period: ProgressPeriod,
  currentSessionCount = currentSessions.length,
  previousSessionCount = previousSessions.length,
): ProgressOverview {
  const sessions = [...currentSessions, ...previousSessions];
  const exercises = catalog.map((catalogItem): ProgressExerciseItem => {
    const performances = performancesForExercise(
      sessions,
      catalogItem.exerciseId,
    );
    const latest = performances[0] ?? null;
    const previous = performances[1] ?? null;
    return {
      ...catalogItem,
      latest,
      previous,
      periodBest: getPeriodBest(currentSessions, catalogItem.exerciseId),
      improvement:
        latest && previous
          ? compareFactualProgress(
              latest.representativeSet,
              previous.representativeSet,
            )
          : null,
    };
  });

  return {
    currentSessionCount,
    previousSessionCount,
    frequencyDelta: currentSessionCount - previousSessionCount,
    weeklySessionCounts: period.weeks.map(
      (week) =>
        currentSessions.filter(
          ({ completedAt }) =>
            completedAt >= week.start && completedAt < week.end,
        ).length,
    ),
    exercises,
    improvements: exercises.filter(({ improvement }) => improvement !== null),
  };
}

export function buildExerciseProgressDetail(
  exerciseId: string,
  exerciseName: string,
  sessions: readonly ProgressSourceSession[],
  sessionCount: number,
  personalRecord: WeightPersonalRecord | null,
  visibleSessionCount: number,
): ExerciseProgressDetail | null {
  const performances = performancesForExercise(sessions, exerciseId);
  const latest = performances[0];
  if (!latest) return null;

  const visiblePerformances = performances
    .slice(0, visibleSessionCount)
    .map((performance, index) => {
      const previous = performances[index + 1];
      return {
        ...performance,
        comparison: previous
          ? compareFactualProgress(
              performance.representativeSet,
              previous.representativeSet,
            )
          : null,
      };
    });

  return {
    exerciseId,
    exerciseName,
    sessionCount,
    latest,
    personalRecord,
    performances: visiblePerformances,
    hasMore: sessionCount > visibleSessionCount,
  };
}

export function compareWeightRecords(
  left: WeightPersonalRecord,
  right: WeightPersonalRecord,
) {
  return (
    right.set.weightKg - left.set.weightKg ||
    right.set.repetitions - left.set.repetitions ||
    Date.parse(right.completedAt) - Date.parse(left.completedAt) ||
    left.set.setNumber - right.set.setNumber ||
    left.set.id.localeCompare(right.set.id)
  );
}

export function getProgressInterpretation(
  overview: Pick<
    ProgressOverview,
    | "currentSessionCount"
    | "previousSessionCount"
    | "improvements"
    | "exercises"
  >,
): ProgressInterpretation {
  if (overview.exercises.length === 0) {
    return {
      title: "Tu progreso empieza con una sesión",
      description:
        "Cuando finalices un entrenamiento, vas a encontrar acá evidencia basada en tus registros.",
    };
  }

  if (overview.currentSessionCount === 0) {
    return {
      title: "No hay sesiones en las últimas 4 semanas",
      description:
        "Tus ejercicios anteriores siguen disponibles para consultar sin convertir la ausencia reciente en una conclusión.",
    };
  }

  if (overview.currentSessionCount === 1) {
    return {
      title: "Ya tenés un primer registro reciente",
      description:
        "Hace falta otra sesión comparable para afirmar un cambio de peso o repeticiones.",
    };
  }

  if (overview.improvements.length > 0) {
    return {
      title: "Hay señales concretas de progreso",
      description: `${overview.improvements.length} ${overview.improvements.length === 1 ? "ejercicio mejoró" : "ejercicios mejoraron"} con el mismo peso o las mismas repeticiones.`,
    };
  }

  if (overview.currentSessionCount > overview.previousSessionCount) {
    return {
      title: "Entrenaste con más frecuencia",
      description:
        "La frecuencia aumentó, pero todavía no hay una mejora directa de peso o repeticiones que podamos defender.",
    };
  }

  if (overview.currentSessionCount === overview.previousSessionCount) {
    return {
      title: "Tu frecuencia se sostiene",
      description:
        "Todavía no hay una mejora directa de peso o repeticiones que podamos defender con estos registros.",
    };
  }

  return {
    title: "Ya hay datos para comparar",
    description:
      "Los cambios mezclan peso y repeticiones, así que GymBro los muestra sin clasificarlos como mejora o retroceso.",
  };
}
