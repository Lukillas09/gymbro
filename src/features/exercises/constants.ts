export const difficultyLabels = {
  beginner: "Principiante",
  intermediate: "Intermedio",
  advanced: "Avanzado",
} as const;

export const movementPatternLabels = {
  horizontal_push: "Empuje horizontal",
  vertical_push: "Empuje vertical",
  horizontal_pull: "Tracción horizontal",
  vertical_pull: "Tracción vertical",
  squat: "Sentadilla",
  hip_hinge: "Bisagra de cadera",
  lunge: "Zancada",
  knee_extension: "Extensión de rodilla",
  knee_flexion: "Flexión de rodilla",
  elbow_flexion: "Flexión de codo",
  elbow_extension: "Extensión de codo",
  shoulder_abduction: "Abducción de hombro",
  shoulder_flexion: "Flexión de hombro",
  shoulder_extension: "Extensión de hombro",
  chest_fly: "Apertura de pecho",
  reverse_fly: "Apertura inversa",
  hip_abduction: "Abducción de cadera",
  hip_adduction: "Aducción de cadera",
  calf_raise: "Elevación de talones",
  core_flexion: "Flexión de tronco",
  core_rotation: "Rotación de tronco",
  core_stability: "Estabilidad del tronco",
} as const;

export const involvementLabels = {
  primary: "Principal",
  secondary: "Secundario",
  stabilizer: "Estabilizador",
} as const;

export type ExerciseDifficulty = keyof typeof difficultyLabels;
export type MovementPattern = keyof typeof movementPatternLabels;
export type MuscleInvolvement = keyof typeof involvementLabels;
