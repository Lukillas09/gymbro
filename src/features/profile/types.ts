export type ProfileMetric = Readonly<{
  value: number;
  label: string;
}>;

export type ProfileActivityExercise = Readonly<{
  exerciseId: string;
  exerciseName: string;
  hasValidSet: boolean;
}>;

export type ProfileActivity = Readonly<{
  id: string;
  dayName: string;
  startedAt: string;
  completedAt: string;
  completedSetCount: number;
  primaryMuscleGroups: readonly string[];
  exercises: readonly ProfileActivityExercise[];
}>;

export type ProfileActiveRoutine = Readonly<{
  id: string;
  name: string;
  dayCount: number;
  exerciseCount: number;
}>;

export type ProfileRecord = Readonly<{
  exerciseId: string;
  exerciseName: string;
  sessionId: string;
  completedAt: string;
  weightKg: number;
  repetitions: number;
}>;

export type ProfileIdentityModel = Readonly<{
  identity: Readonly<{
    displayName: string;
    username: string;
    initials: string;
    trainingLevel: string;
    primaryGoal: string;
  }>;
  metrics: readonly ProfileMetric[];
  activeRoutine: ProfileActiveRoutine | null;
  recentMuscleGroups: readonly string[];
  personalRecord: ProfileRecord | null;
  recentActivity: readonly ProfileActivity[];
  totalCompletedWorkouts: number;
}>;
