import type {
  PreviousExercisePerformance,
  ProgressCue,
  SetPrefill,
  TrainingState,
  WorkoutExercise,
  WorkoutSession,
  WorkoutSet,
  WorkoutSummary,
} from "./types";

export function deriveTrainingState(
  session: WorkoutSession | null,
  now: number,
): TrainingState {
  if (!session) return "setup";
  if (session.status === "completed") return "completed";
  if (
    session.status === "in_progress" &&
    session.restEndsAt !== null &&
    Date.parse(session.restEndsAt) > now
  ) {
    return "resting";
  }
  return "live";
}

export function isRecoverableSession(session: WorkoutSession | null) {
  return session?.status === "in_progress";
}

export function getNextSetNumber(exercise: WorkoutExercise) {
  const completedNumbers = new Set(exercise.sets.map((set) => set.setNumber));

  for (let setNumber = 1; setNumber <= exercise.targetSets; setNumber += 1) {
    if (!completedNumbers.has(setNumber)) return setNumber;
  }

  return null;
}

export function getNextExerciseId(
  exercises: readonly WorkoutExercise[],
  activeExerciseId: string,
) {
  const activeIndex = exercises.findIndex(({ id }) => id === activeExerciseId);
  const orderedCandidates = [
    ...exercises.slice(activeIndex + 1),
    ...exercises.slice(0, Math.max(activeIndex + 1, 0)),
  ];

  return (
    orderedCandidates.find((exercise) => getNextSetNumber(exercise) !== null)
      ?.id ?? null
  );
}

function setForNumber(
  performance: PreviousExercisePerformance | undefined,
  setNumber: number,
) {
  return (
    performance?.sets.find((set) => set.setNumber === setNumber) ??
    performance?.sets.at(-1)
  );
}

export function getSetPrefill(
  exercise: WorkoutExercise,
  setNumber: number,
  previous: PreviousExercisePerformance | undefined,
): SetPrefill {
  const latestCurrentSet = [...exercise.sets]
    .sort(
      (left, right) =>
        Date.parse(left.completedAt) - Date.parse(right.completedAt),
    )
    .at(-1);

  if (latestCurrentSet) {
    return {
      weightKg: latestCurrentSet.weightKg,
      repetitions: latestCurrentSet.repetitions,
      source: "current-session",
    };
  }

  const previousSet = setForNumber(previous, setNumber);
  if (previousSet) {
    return {
      weightKg: previousSet.weightKg,
      repetitions: previousSet.repetitions,
      source: "previous-session",
    };
  }

  return {
    weightKg: null,
    repetitions: exercise.targetRepsMin,
    source: "prescription",
  };
}

function formatDifference(value: number) {
  return Number.isInteger(value)
    ? String(value)
    : value.toFixed(3).replace(/0+$/, "").replace(/\.$/, "");
}

export function compareFactualProgress(
  current: Pick<WorkoutSet, "weightKg" | "repetitions">,
  previous: Pick<WorkoutSet, "weightKg" | "repetitions"> | undefined,
): ProgressCue | null {
  if (!previous) return null;

  if (
    current.weightKg === previous.weightKg &&
    current.repetitions > previous.repetitions
  ) {
    const difference = current.repetitions - previous.repetitions;
    return {
      kind: "repetitions",
      label: `+${difference} ${difference === 1 ? "REP" : "REPS"}`,
    };
  }

  if (
    current.repetitions === previous.repetitions &&
    current.weightKg > previous.weightKg
  ) {
    return {
      kind: "weight",
      label: `+${formatDifference(current.weightKg - previous.weightKg)} KG`,
    };
  }

  return null;
}

export function getComparablePreviousSet(
  previous: PreviousExercisePerformance | undefined,
  setNumber: number,
) {
  return setForNumber(previous, setNumber);
}

export function getRestSecondsRemaining(
  restEndsAt: string | null,
  now: number,
) {
  if (!restEndsAt) return 0;
  return Math.max(0, Math.ceil((Date.parse(restEndsAt) - now) / 1000));
}

export function formatCountdown(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function formatWeight(weightKg: number) {
  return `${formatDifference(weightKg)} kg`;
}

export function getRemainingExerciseCount(session: WorkoutSession) {
  return session.exercises.filter(
    (exercise) => getNextSetNumber(exercise) !== null,
  ).length;
}

export function getLatestWorkoutSet(session: WorkoutSession) {
  return session.exercises
    .flatMap((exercise) => exercise.sets)
    .sort(
      (left, right) =>
        Date.parse(right.completedAt) - Date.parse(left.completedAt),
    )[0];
}

export function canUndoWorkoutSet(
  session: WorkoutSession,
  workoutSetId: string,
) {
  return (
    session.status === "in_progress" &&
    getLatestWorkoutSet(session)?.id === workoutSetId
  );
}

export function buildWorkoutSummary(
  session: WorkoutSession,
  previousByExercise: Readonly<
    Record<string, PreviousExercisePerformance | undefined>
  >,
  now: number,
): WorkoutSummary {
  const improvements: { exerciseName: string; label: string }[] = [];

  for (const exercise of session.exercises) {
    for (const set of exercise.sets) {
      const previousSet = getComparablePreviousSet(
        previousByExercise[exercise.exerciseId],
        set.setNumber,
      );
      const cue = compareFactualProgress(set, previousSet);
      if (cue) {
        improvements.push({
          exerciseName: exercise.exerciseName,
          label: cue.label,
        });
        break;
      }
    }
  }

  return {
    durationSeconds: getWorkoutDurationSeconds(
      session.startedAt,
      session.completedAt,
      now,
    ),
    completedSetCount: session.exercises.reduce(
      (total, exercise) => total + exercise.sets.length,
      0,
    ),
    primaryMuscleGroups: [
      ...new Set(
        session.exercises.flatMap((exercise) => exercise.primaryMuscleGroups),
      ),
    ],
    improvements,
  };
}

export function getWorkoutDurationSeconds(
  startedAt: string,
  completedAt: string | null,
  now = Date.now(),
) {
  const end = completedAt ? Date.parse(completedAt) : now;
  return Math.max(0, Math.floor((end - Date.parse(startedAt)) / 1000));
}

export function formatDuration(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (hours === 0) return `${minutes} min`;
  return `${hours} h ${String(minutes).padStart(2, "0")} min`;
}
