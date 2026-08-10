import { createHash, createHmac } from "node:crypto";
import { createServer } from "node:http";

const host = "127.0.0.1";
const port = 3201;
const issuedAt = Math.floor(Date.now() / 1000);
const timestamp = new Date().toISOString();
const sessions = new Map();
const accountStates = new Map();
let idSequence = 1;

function encode(value) {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

function uuidForEmail(email) {
  const hex = createHash("sha256").update(email).digest("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-8${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}

function nextUuid() {
  const suffix = String(idSequence++).padStart(12, "0");
  return `00000000-0000-4000-8000-${suffix}`;
}

function createAccount(email) {
  const userId = uuidForEmail(email);
  const header = encode({ alg: "HS256", typ: "JWT" });
  const payload = encode({
    sub: userId,
    aud: "authenticated",
    role: "authenticated",
    email,
    exp: issuedAt + 3600,
    iat: issuedAt,
    iss: `http://${host}:${port}/auth/v1`,
    aal: "aal1",
    session_id: nextUuid(),
    is_anonymous: false,
  });
  const signature = createHmac("sha256", "gymbro-e2e-secret")
    .update(`${header}.${payload}`)
    .digest("base64url");
  const accessToken = `${header}.${payload}.${signature}`;
  const user = {
    id: userId,
    aud: "authenticated",
    role: "authenticated",
    email,
    email_confirmed_at: timestamp,
    phone: "",
    confirmed_at: timestamp,
    last_sign_in_at: timestamp,
    app_metadata: { provider: "email", providers: ["email"] },
    user_metadata: {},
    identities: [],
    created_at: timestamp,
    updated_at: timestamp,
    is_anonymous: false,
  };
  const profile = {
    id: userId,
    username: `gymbro_${userId.slice(0, 8)}`,
    display_name: "GymBro E2E",
    avatar_url: null,
    birth_date: null,
    biological_sex: null,
    height_cm: null,
    current_weight_kg: null,
    training_level: "intermediate",
    primary_goal: "muscle_gain",
    preferred_weight_unit: "kg",
    created_at: timestamp,
    updated_at: timestamp,
  };
  const existingState = accountStates.get(email);
  const state = existingState ?? {
    routines: [],
    days: [],
    routineExercises: [],
    workoutSessions: [],
    workoutExercises: [],
    workoutSets: [],
  };

  if (!existingState) {
    seedHomeScenario(email, state, userId);
    seedHistoryScenario(email, state, userId);
    seedProgressScenario(email, state, userId);
    seedCalendarScenario(email, state, userId);
  }

  accountStates.set(email, state);
  sessions.set(accessToken, { user, profile, state });
  return { accessToken, user };
}

const groups = {
  chest: { id: "group-chest", name: "Pecho", slug: "chest" },
  triceps: { id: "group-triceps", name: "Tríceps", slug: "triceps" },
  legs: { id: "group-legs", name: "Piernas", slug: "legs" },
  abdomen: { id: "group-abdomen", name: "Abdomen", slug: "abdomen" },
};

const exercises = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    name: "Press banca con barra",
    slug: "barbell-bench-press",
    description: "Empuje horizontal con barra para desarrollar el pecho.",
    difficulty: "intermediate",
    movement_pattern: "horizontal_push",
    instructions: [
      "Apoyá los pies y fijá las escápulas.",
      "Descendé la barra con control.",
      "Empujá manteniendo estabilidad.",
    ],
    common_mistakes: ["Levantar los glúteos.", "Rebotar la barra."],
    exercise_muscles: [
      {
        involvement_type: "primary",
        muscle: {
          id: "muscle-chest",
          name: "Pectoral medio",
          slug: "mid-chest",
          group: groups.chest,
        },
      },
      {
        involvement_type: "secondary",
        muscle: {
          id: "muscle-triceps",
          name: "Cabeza lateral",
          slug: "triceps-lateral-head",
          group: groups.triceps,
        },
      },
    ],
    exercise_equipment: [
      {
        position: 1,
        item: { id: "equipment-barbell", name: "Barra", slug: "barbell" },
      },
      {
        position: 2,
        item: { id: "equipment-bench", name: "Banco", slug: "bench" },
      },
    ],
  },
  {
    id: "22222222-2222-4222-8222-222222222222",
    name: "Hip thrust con barra",
    slug: "barbell-hip-thrust",
    description: "Extensión de cadera para priorizar glúteos.",
    difficulty: "intermediate",
    movement_pattern: "hip_hinge",
    instructions: ["Apoyá la espalda.", "Extendé la cadera con control."],
    common_mistakes: ["Hiperextender la espalda."],
    exercise_muscles: [
      {
        involvement_type: "primary",
        muscle: {
          id: "muscle-glutes",
          name: "Glúteos",
          slug: "glutes",
          group: groups.legs,
        },
      },
    ],
    exercise_equipment: [
      {
        position: 1,
        item: { id: "equipment-barbell", name: "Barra", slug: "barbell" },
      },
      {
        position: 2,
        item: { id: "equipment-bench", name: "Banco", slug: "bench" },
      },
    ],
  },
  {
    id: "55555555-5555-4555-8555-555555555555",
    name: "Plancha frontal",
    slug: "front-plank",
    description: "Estabilidad del tronco con peso corporal.",
    difficulty: "beginner",
    movement_pattern: "core_stability",
    instructions: ["Alineá el cuerpo.", "Respirá con el abdomen activo."],
    common_mistakes: ["Dejar caer la cadera."],
    exercise_muscles: [
      {
        involvement_type: "primary",
        muscle: {
          id: "muscle-transverse",
          name: "Transverso abdominal",
          slug: "transverse-abdominis",
          group: groups.abdomen,
        },
      },
    ],
    exercise_equipment: [
      {
        position: 1,
        item: {
          id: "equipment-bodyweight",
          name: "Peso corporal",
          slug: "bodyweight",
        },
      },
    ],
  },
];

function localWeekday(date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Argentina/Buenos_Aires",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const value = (type) =>
    Number(parts.find((part) => part.type === type)?.value);
  return new Date(
    Date.UTC(value("year"), value("month") - 1, value("day")),
  ).getUTCDay();
}

function isoOffset(milliseconds) {
  return new Date(Date.now() + milliseconds).toISOString();
}

function seedRoutine(state, userId, weekdays) {
  const routineId = nextUuid();
  const pushDayId = nextUuid();
  const pullDayId = nextUuid();
  state.routines.push({
    id: routineId,
    user_id: userId,
    name: "Push Pull",
    description: null,
    goal: "muscle_gain",
    is_active: true,
    archived_at: null,
    created_at: timestamp,
    updated_at: timestamp,
  });
  state.days.push(
    {
      id: pushDayId,
      routine_id: routineId,
      name: "Push",
      position: 0,
      weekday: weekdays[0],
      created_at: timestamp,
      updated_at: timestamp,
    },
    {
      id: pullDayId,
      routine_id: routineId,
      name: "Pull",
      position: 1,
      weekday: weekdays[1],
      created_at: timestamp,
      updated_at: timestamp,
    },
  );
  state.routineExercises.push(
    {
      id: nextUuid(),
      routine_day_id: pushDayId,
      exercise_id: exercises[0].id,
      position: 0,
      target_sets: 3,
      target_reps_min: 8,
      target_reps_max: 10,
      rest_seconds: 90,
      target_rir: 2,
      notes: null,
      created_at: timestamp,
      updated_at: timestamp,
    },
    {
      id: nextUuid(),
      routine_day_id: pullDayId,
      exercise_id: exercises[1].id,
      position: 0,
      target_sets: 3,
      target_reps_min: 10,
      target_reps_max: 12,
      rest_seconds: 120,
      target_rir: null,
      notes: null,
      created_at: timestamp,
      updated_at: timestamp,
    },
  );
  return { routineId, pushDayId, pullDayId };
}

function seedWorkout(state, userId, routine, { completed, previous = false }) {
  const sessionId = nextUuid();
  const workoutExerciseId = nextUuid();
  const startedAt = previous
    ? isoOffset(-8 * 24 * 60 * 60 * 1000)
    : isoOffset(-50 * 60 * 1000);
  const completedAt = completed
    ? previous
      ? isoOffset(-8 * 24 * 60 * 60 * 1000 + 40 * 60 * 1000)
      : isoOffset(-10 * 60 * 1000)
    : null;
  state.workoutSessions.push({
    id: sessionId,
    user_id: userId,
    routine_day_id: routine.pushDayId,
    routine_name_snapshot: "Push Pull",
    routine_day_name_snapshot: "Push",
    started_at: startedAt,
    completed_at: completedAt,
    status: completed ? "completed" : "in_progress",
    notes: null,
    snapshot_locked_at: startedAt,
    active_workout_exercise_id: completed ? null : workoutExerciseId,
    rest_ends_at: null,
    rest_source_set_id: null,
    created_at: startedAt,
    updated_at: completedAt ?? startedAt,
  });
  state.workoutExercises.push({
    id: workoutExerciseId,
    workout_session_id: sessionId,
    exercise_id: exercises[0].id,
    source_routine_exercise_id: state.routineExercises.find(
      ({ routine_day_id }) => routine_day_id === routine.pushDayId,
    )?.id,
    position: 0,
    target_sets: 3,
    target_reps_min: 8,
    target_reps_max: 10,
    rest_seconds: 90,
    target_rir: 2,
    exercise_name_snapshot: exercises[0].name,
    notes: null,
    created_at: startedAt,
  });
  state.workoutSets.push({
    id: nextUuid(),
    workout_exercise_id: workoutExerciseId,
    set_number: 1,
    weight_kg: 80,
    repetitions: 8,
    rir: null,
    set_type: "working",
    completed_at: isoOffset(
      previous ? -8 * 24 * 60 * 60 * 1000 + 5 * 60 * 1000 : -40 * 60 * 1000,
    ),
    created_at: startedAt,
    updated_at: startedAt,
  });
  if (completed) {
    state.workoutSets.push({
      id: nextUuid(),
      workout_exercise_id: workoutExerciseId,
      set_number: 2,
      weight_kg: 80,
      repetitions: previous ? 8 : 9,
      rir: null,
      set_type: "working",
      completed_at: isoOffset(
        previous ? -8 * 24 * 60 * 60 * 1000 + 8 * 60 * 1000 : -35 * 60 * 1000,
      ),
      created_at: startedAt,
      updated_at: startedAt,
    });
  }
  return sessionId;
}

function seedHomeScenario(email, state, userId) {
  const scenario = email.split("@")[0];
  if (!scenario.startsWith("home-")) return;
  if (scenario.startsWith("home-no-routine")) return;

  const today = localWeekday(new Date());
  const weekdays = scenario.startsWith("home-rest")
    ? [(today + 1) % 7, (today + 4) % 7]
    : [today, (today + 3) % 7];
  const routine = seedRoutine(state, userId, weekdays);

  if (scenario.startsWith("home-ready")) {
    seedWorkout(state, userId, routine, { completed: true, previous: true });
  } else if (scenario.startsWith("home-training")) {
    seedWorkout(state, userId, routine, { completed: false });
  } else if (scenario.startsWith("home-completed")) {
    seedWorkout(state, userId, routine, { completed: true, previous: true });
    seedWorkout(state, userId, routine, { completed: true });
  }
}

function setHistoryWorkoutTime(state, sessionId, daysAgo) {
  const session = state.workoutSessions.find(({ id }) => id === sessionId);
  if (!session) return;

  const completedAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
  const startedAt = new Date(completedAt.getTime() - 64 * 60 * 1000);
  session.started_at = startedAt.toISOString();
  session.completed_at = completedAt.toISOString();
  session.created_at = session.started_at;
  session.updated_at = session.completed_at;

  const workoutExercise = state.workoutExercises.find(
    ({ workout_session_id }) => workout_session_id === sessionId,
  );
  if (!workoutExercise) return;
  const sets = state.workoutSets.filter(
    ({ workout_exercise_id }) => workout_exercise_id === workoutExercise.id,
  );
  for (const [index, set] of sets.entries()) {
    set.completed_at = new Date(
      startedAt.getTime() + (index + 1) * 5 * 60 * 1000,
    ).toISOString();
  }
}

function seedDetailedHistoryWorkout(state, userId, routine, daysAgo) {
  const sessionId = seedWorkout(state, userId, routine, { completed: true });
  setHistoryWorkoutTime(state, sessionId, daysAgo);

  const workoutExercise = state.workoutExercises.find(
    ({ workout_session_id }) => workout_session_id === sessionId,
  );
  if (!workoutExercise) return sessionId;
  workoutExercise.target_sets = 4;
  const sets = state.workoutSets.filter(
    ({ workout_exercise_id }) => workout_exercise_id === workoutExercise.id,
  );
  sets[0].weight_kg = 40;
  sets[0].repetitions = 10;
  sets[0].rir = 4;
  sets[0].set_type = "warmup";
  sets[1].weight_kg = 80;
  sets[1].repetitions = 9;
  sets[1].rir = 2;
  state.workoutSets.push({
    ...sets[1],
    id: nextUuid(),
    set_number: 3,
    repetitions: 8,
    rir: null,
    set_type: "backoff",
    completed_at: new Date(
      Date.parse(sets[1].completed_at) + 5 * 60 * 1000,
    ).toISOString(),
  });
  return sessionId;
}

function seedHistoryScenario(email, state, userId) {
  const scenario = email.split("@")[0];
  if (!scenario.startsWith("history-")) return;
  if (scenario.startsWith("history-empty")) return;

  const today = localWeekday(new Date());
  const routine = seedRoutine(state, userId, [today, (today + 3) % 7]);

  if (scenario.startsWith("history-one")) {
    const sessionId = seedWorkout(state, userId, routine, { completed: true });
    setHistoryWorkoutTime(state, sessionId, 1);
    return;
  }

  if (scenario.startsWith("history-many")) {
    for (let index = 1; index <= 23; index += 1) {
      const sessionId = seedWorkout(state, userId, routine, {
        completed: true,
      });
      setHistoryWorkoutTime(state, sessionId, index);
    }
    const activeId = seedWorkout(state, userId, routine, { completed: false });
    const active = state.workoutSessions.find(({ id }) => id === activeId);
    if (active) active.routine_day_name_snapshot = "NO DEBE APARECER";
    return;
  }

  if (scenario.startsWith("history-detail")) {
    const previousId = seedWorkout(state, userId, routine, {
      completed: true,
      previous: true,
    });
    setHistoryWorkoutTime(state, previousId, 8);
    seedDetailedHistoryWorkout(state, userId, routine, 1);
  }
}

function seedProgressWorkout(
  state,
  userId,
  routine,
  { daysAgo, exercise = exercises[0], weightKg, repetitions },
) {
  const sessionId = seedWorkout(state, userId, routine, { completed: true });
  setHistoryWorkoutTime(state, sessionId, daysAgo);
  const workoutExercise = state.workoutExercises.find(
    ({ workout_session_id }) => workout_session_id === sessionId,
  );
  if (!workoutExercise) return sessionId;

  workoutExercise.exercise_id = exercise.id;
  workoutExercise.exercise_name_snapshot = exercise.name;
  for (const set of state.workoutSets.filter(
    ({ workout_exercise_id }) => workout_exercise_id === workoutExercise.id,
  )) {
    set.weight_kg = weightKg;
    set.repetitions = repetitions;
  }
  return sessionId;
}

function seedProgressScenario(email, state, userId) {
  const scenario = email.split("@")[0];
  if (!scenario.startsWith("progress-")) return;
  if (scenario.startsWith("progress-empty")) return;

  const today = localWeekday(new Date());
  const routine = seedRoutine(state, userId, [today, (today + 3) % 7]);

  if (scenario.startsWith("progress-one")) {
    seedProgressWorkout(state, userId, routine, {
      daysAgo: 1,
      weightKg: 80,
      repetitions: 8,
    });
    return;
  }

  if (scenario.startsWith("progress-improving")) {
    seedProgressWorkout(state, userId, routine, {
      daysAgo: 35,
      weightKg: 80,
      repetitions: 8,
    });
    seedProgressWorkout(state, userId, routine, {
      daysAgo: 20,
      weightKg: 80,
      repetitions: 8,
    });
    seedProgressWorkout(state, userId, routine, {
      daysAgo: 9,
      weightKg: 80,
      repetitions: 9,
    });
    seedProgressWorkout(state, userId, routine, {
      daysAgo: 3,
      exercise: exercises[1],
      weightKg: 100,
      repetitions: 10,
    });
    return;
  }

  if (scenario.startsWith("progress-mixed")) {
    seedProgressWorkout(state, userId, routine, {
      daysAgo: 14,
      weightKg: 80,
      repetitions: 10,
    });
    seedProgressWorkout(state, userId, routine, {
      daysAgo: 2,
      weightKg: 85,
      repetitions: 8,
    });
  }
}

function removeRoutinePlan(state) {
  state.routines = [];
  state.days = [];
  state.routineExercises = [];
}

function seedCalendarScenario(email, state, userId) {
  const scenario = email.split("@")[0];
  if (!scenario.startsWith("calendar-")) return;
  if (scenario.startsWith("calendar-empty")) return;

  const today = localWeekday(new Date());

  if (scenario.startsWith("calendar-history")) {
    const routine = seedRoutine(state, userId, [today, (today + 3) % 7]);
    const sessionId = seedWorkout(state, userId, routine, { completed: true });
    setHistoryWorkoutTime(state, sessionId, 1);
    removeRoutinePlan(state);
    return;
  }

  if (scenario.startsWith("calendar-partial")) {
    seedRoutine(state, userId, [today, null]);
    return;
  }

  if (scenario.startsWith("calendar-completed-only")) {
    const routine = seedRoutine(state, userId, [
      (today + 1) % 7,
      (today + 3) % 7,
    ]);
    seedWorkout(state, userId, routine, { completed: true });
    return;
  }

  const routine = seedRoutine(state, userId, [today, (today + 3) % 7]);

  if (scenario.startsWith("calendar-live")) {
    seedWorkout(state, userId, routine, { completed: false });
  } else if (scenario.startsWith("calendar-completed-scheduled")) {
    seedWorkout(state, userId, routine, { completed: true });
  }
}

function sendJson(response, status, body, headers = {}) {
  response.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "*",
    ...headers,
  });
  response.end(body === undefined ? undefined : JSON.stringify(body));
}

function postgrestResponse(request, response, rows) {
  const single = request.headers.accept?.includes(
    "application/vnd.pgrst.object+json",
  );

  if (single) {
    if (rows.length === 1) return sendJson(response, 200, rows[0]);
    if (rows.length === 0) {
      return sendJson(response, 406, {
        code: "PGRST116",
        details: "The result contains 0 rows",
        hint: null,
        message: "Cannot coerce the result to a single JSON object",
      });
    }
  }

  return sendJson(response, 200, rows, {
    "content-range": `0-${Math.max(rows.length - 1, 0)}/${rows.length}`,
  });
}

async function readBody(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw) return {};

  if (request.headers["content-type"]?.includes("application/json")) {
    return JSON.parse(raw);
  }

  return Object.fromEntries(new URLSearchParams(raw));
}

function sessionFor(request) {
  const authorization = request.headers.authorization;
  if (!authorization?.startsWith("Bearer ")) return null;
  return sessions.get(authorization.slice(7)) ?? null;
}

function equalFilter(url, name) {
  const value = url.searchParams.get(name);
  return value?.startsWith("eq.") ? value.slice(3) : null;
}

function notEqualFilter(url, name) {
  const value = url.searchParams.get(name);
  return value?.startsWith("neq.") ? value.slice(4) : null;
}

function inFilter(url, name) {
  const value = url.searchParams.get(name);
  if (!value?.startsWith("in.(") || !value.endsWith(")")) return null;
  return value
    .slice(4, -1)
    .split(",")
    .map((item) => item.replace(/^"|"$/g, ""));
}

function timestampFilter(url, name, operator) {
  const prefix = `${operator}.`;
  const value = url.searchParams
    .getAll(name)
    .find((candidate) => candidate.startsWith(prefix));
  return value?.startsWith(prefix) ? value.slice(prefix.length) : null;
}

function historyCursorFilter(url) {
  const value = url.searchParams.get("or");
  if (!value) return null;
  const match = value.match(
    /^\(completed_at\.lt\.([^,]+),and\(completed_at\.eq\.([^,]+),id\.lt\.([^)]+)\)\)$/,
  );
  if (!match || match[1] !== match[2]) return null;
  return { completedAt: match[1], id: match[3] };
}

function exerciseRelation(exerciseId) {
  const exercise = exercises.find(({ id }) => id === exerciseId);
  if (!exercise) return null;
  return {
    id: exercise.id,
    name: exercise.name,
    slug: exercise.slug,
    exercise_muscles: exercise.exercise_muscles,
  };
}

function serializeRoutine(state, routine) {
  const days = state.days
    .filter(({ routine_id }) => routine_id === routine.id)
    .sort((left, right) => left.position - right.position)
    .map((day) => ({
      ...day,
      routine_exercises: state.routineExercises
        .filter(({ routine_day_id }) => routine_day_id === day.id)
        .sort((left, right) => left.position - right.position)
        .map((prescription) => ({
          ...prescription,
          exercise: exerciseRelation(prescription.exercise_id),
        })),
    }));
  return { ...routine, routine_days: days };
}

function routineRows(state, url) {
  const id = equalFilter(url, "id");
  const isActive = equalFilter(url, "is_active");
  return state.routines
    .filter(
      (routine) =>
        (!id || routine.id === id) &&
        (isActive === null || routine.is_active === (isActive === "true")) &&
        (url.searchParams.get("archived_at") !== "is.null" ||
          routine.archived_at === null),
    )
    .map((routine) => serializeRoutine(state, routine));
}

function serializeWorkoutExercise(state, workoutExercise) {
  return {
    ...workoutExercise,
    workout_sets: state.workoutSets
      .filter(
        ({ workout_exercise_id }) => workout_exercise_id === workoutExercise.id,
      )
      .sort((left, right) => left.set_number - right.set_number),
    exercise: exerciseRelation(workoutExercise.exercise_id),
  };
}

function serializeWorkoutSession(state, session) {
  return {
    ...session,
    workout_exercises: state.workoutExercises
      .filter(({ workout_session_id }) => workout_session_id === session.id)
      .sort((left, right) => left.position - right.position)
      .map((exercise) => serializeWorkoutExercise(state, exercise)),
  };
}

function workoutSessionRows(state, url) {
  const id = equalFilter(url, "id");
  const excludedId = notEqualFilter(url, "id");
  const status = equalFilter(url, "status");
  const routineDayIds = inFilter(url, "routine_day_id");
  const exerciseId = equalFilter(url, "workout_exercises.exercise_id");
  const exerciseIds =
    inFilter(url, "workout_exercises.exercise_id") ??
    (exerciseId ? [exerciseId] : null);
  const completedAfter = timestampFilter(url, "completed_at", "gte");
  const completedBefore = timestampFilter(url, "completed_at", "lt");
  const historyCursor = historyCursorFilter(url);
  const requestedLimit = Number(url.searchParams.get("limit"));

  return state.workoutSessions
    .filter(
      (session) =>
        (!id || session.id === id) &&
        (!excludedId || session.id !== excludedId) &&
        (!status || session.status === status) &&
        (!completedAfter ||
          (session.completed_at !== null &&
            Date.parse(session.completed_at) >= Date.parse(completedAfter))) &&
        (!completedBefore ||
          (session.completed_at !== null &&
            Date.parse(session.completed_at) < Date.parse(completedBefore))) &&
        (!historyCursor ||
          (session.completed_at !== null &&
            (Date.parse(session.completed_at) <
              Date.parse(historyCursor.completedAt) ||
              (session.completed_at === historyCursor.completedAt &&
                session.id < historyCursor.id)))) &&
        (!routineDayIds || routineDayIds.includes(session.routine_day_id)) &&
        (!exerciseIds ||
          state.workoutExercises.some(
            (exercise) =>
              exercise.workout_session_id === session.id &&
              exerciseIds.includes(exercise.exercise_id),
          )),
    )
    .sort(
      (left, right) =>
        new Date(right.completed_at ?? right.started_at).getTime() -
          new Date(left.completed_at ?? left.started_at).getTime() ||
        right.id.localeCompare(left.id),
    )
    .slice(
      0,
      Number.isSafeInteger(requestedLimit) && requestedLimit > 0
        ? requestedLimit
        : undefined,
    )
    .map((session) => serializeWorkoutSession(state, session));
}

function workoutExerciseRows(state, url) {
  const requestedLimit = Number(url.searchParams.get("limit"));
  return state.workoutExercises
    .flatMap((workoutExercise) => {
      const session = state.workoutSessions.find(
        ({ id }) => id === workoutExercise.workout_session_id,
      );
      const sets = state.workoutSets.filter(
        ({ workout_exercise_id }) => workout_exercise_id === workoutExercise.id,
      );
      if (
        session?.status !== "completed" ||
        !session.completed_at ||
        sets.length === 0
      ) {
        return [];
      }
      return [
        {
          ...workoutExercise,
          workout_sets: sets.slice(0, 1).map(({ id }) => ({ id })),
          session: {
            user_id: session.user_id,
            status: session.status,
            completed_at: session.completed_at,
          },
        },
      ];
    })
    .sort(
      (left, right) =>
        Date.parse(right.session.completed_at) -
        Date.parse(left.session.completed_at),
    )
    .slice(
      0,
      Number.isSafeInteger(requestedLimit) && requestedLimit > 0
        ? requestedLimit
        : undefined,
    );
}

function workoutSetRows(state, url) {
  const exerciseId = equalFilter(url, "workout_exercise.exercise_id");
  const requestedLimit = Number(url.searchParams.get("limit"));
  return state.workoutSets
    .flatMap((set) => {
      const workoutExercise = state.workoutExercises.find(
        ({ id }) => id === set.workout_exercise_id,
      );
      const session = state.workoutSessions.find(
        ({ id }) => id === workoutExercise?.workout_session_id,
      );
      if (
        !workoutExercise ||
        !session ||
        session.status !== "completed" ||
        !session.completed_at ||
        set.repetitions <= 0 ||
        (exerciseId && workoutExercise.exercise_id !== exerciseId)
      ) {
        return [];
      }
      return [
        {
          ...set,
          workout_exercise: {
            exercise_id: workoutExercise.exercise_id,
            workout_session: {
              id: session.id,
              user_id: session.user_id,
              status: session.status,
              completed_at: session.completed_at,
            },
          },
        },
      ];
    })
    .sort(
      (left, right) =>
        right.weight_kg - left.weight_kg ||
        right.repetitions - left.repetitions ||
        Date.parse(right.completed_at) - Date.parse(left.completed_at) ||
        left.set_number - right.set_number,
    )
    .slice(
      0,
      Number.isSafeInteger(requestedLimit) && requestedLimit > 0
        ? requestedLimit
        : undefined,
    );
}

function sendDatabaseError(response, code, message) {
  return sendJson(response, code === "23505" ? 409 : 400, {
    code,
    details: null,
    hint: null,
    message,
  });
}

async function handleRest(request, response, url, session) {
  const { state } = session;

  if (request.method === "GET" && url.pathname === "/rest/v1/profiles") {
    return postgrestResponse(request, response, [session.profile]);
  }

  if (request.method === "GET" && url.pathname === "/rest/v1/exercises") {
    const slug = equalFilter(url, "slug");
    const rows = slug
      ? exercises.filter((exercise) => exercise.slug === slug)
      : exercises;
    return postgrestResponse(request, response, rows);
  }

  if (url.pathname === "/rest/v1/routines") {
    if (request.method === "GET") {
      return postgrestResponse(request, response, routineRows(state, url));
    }

    if (request.method === "POST") {
      const body = await readBody(request);
      const input = Array.isArray(body) ? body[0] : body;
      const routine = {
        id: nextUuid(),
        user_id: session.user.id,
        name: input.name,
        description: input.description ?? null,
        goal: input.goal,
        is_active: input.is_active ?? false,
        archived_at: input.archived_at ?? null,
        created_at: timestamp,
        updated_at: timestamp,
      };
      state.routines.push(routine);
      return postgrestResponse(request, response, [routine]);
    }

    if (request.method === "PATCH") {
      const id = equalFilter(url, "id");
      const body = await readBody(request);
      const routine = state.routines.find((item) => item.id === id);
      if (!routine) return postgrestResponse(request, response, []);
      Object.assign(routine, body, { updated_at: new Date().toISOString() });
      return postgrestResponse(request, response, [routine]);
    }

    if (request.method === "DELETE") {
      const id = equalFilter(url, "id");
      state.routines = state.routines.filter((routine) => routine.id !== id);
      const deletedDayIds = state.days
        .filter(({ routine_id }) => routine_id === id)
        .map(({ id: dayId }) => dayId);
      state.days = state.days.filter(({ routine_id }) => routine_id !== id);
      state.routineExercises = state.routineExercises.filter(
        ({ routine_day_id }) => !deletedDayIds.includes(routine_day_id),
      );
      return sendJson(response, 200, []);
    }
  }

  if (url.pathname === "/rest/v1/routine_days") {
    if (request.method === "GET") {
      const routineId = equalFilter(url, "routine_id");
      const rows = state.days
        .filter((day) => !routineId || day.routine_id === routineId)
        .sort((left, right) => left.position - right.position);
      return postgrestResponse(request, response, rows);
    }

    if (request.method === "PATCH") {
      const id = equalFilter(url, "id");
      const body = await readBody(request);
      const day = state.days.find((item) => item.id === id);
      if (!day) return postgrestResponse(request, response, []);
      Object.assign(day, body, { updated_at: new Date().toISOString() });
      return postgrestResponse(request, response, [day]);
    }

    if (request.method === "DELETE") {
      const id = equalFilter(url, "id");
      state.days = state.days.filter((day) => day.id !== id);
      state.routineExercises = state.routineExercises.filter(
        ({ routine_day_id }) => routine_day_id !== id,
      );
      return sendJson(response, 200, []);
    }
  }

  if (url.pathname === "/rest/v1/routine_exercises") {
    if (request.method === "GET") {
      const dayId = equalFilter(url, "routine_day_id");
      const rows = state.routineExercises
        .filter((item) => !dayId || item.routine_day_id === dayId)
        .sort((left, right) => left.position - right.position);
      return postgrestResponse(request, response, rows);
    }

    if (request.method === "PATCH") {
      const id = equalFilter(url, "id");
      const body = await readBody(request);
      const prescription = state.routineExercises.find(
        (item) => item.id === id,
      );
      if (!prescription) return postgrestResponse(request, response, []);
      Object.assign(prescription, body, {
        updated_at: new Date().toISOString(),
      });
      return postgrestResponse(request, response, [prescription]);
    }

    if (request.method === "DELETE") {
      const id = equalFilter(url, "id");
      state.routineExercises = state.routineExercises.filter(
        (item) => item.id !== id,
      );
      return sendJson(response, 200, []);
    }
  }

  if (
    request.method === "GET" &&
    url.pathname === "/rest/v1/workout_sessions"
  ) {
    return postgrestResponse(request, response, workoutSessionRows(state, url));
  }

  if (
    request.method === "GET" &&
    url.pathname === "/rest/v1/workout_exercises"
  ) {
    return postgrestResponse(
      request,
      response,
      workoutExerciseRows(state, url),
    );
  }

  if (request.method === "GET" && url.pathname === "/rest/v1/workout_sets") {
    return postgrestResponse(request, response, workoutSetRows(state, url));
  }

  if (request.method === "POST" && url.pathname.startsWith("/rest/v1/rpc/")) {
    const body = await readBody(request);
    const operation = url.pathname.slice("/rest/v1/rpc/".length);

    if (operation === "activate_routine") {
      for (const routine of state.routines) routine.is_active = false;
      const routine = state.routines.find(
        ({ id }) => id === body.target_routine_id,
      );
      if (!routine) return sendDatabaseError(response, "42501", "Not owned");
      routine.is_active = true;
      return sendJson(response, 200, null);
    }

    if (operation === "append_routine_day") {
      const positions = state.days
        .filter(({ routine_id }) => routine_id === body.target_routine_id)
        .map(({ position }) => position);
      const day = {
        id: nextUuid(),
        routine_id: body.target_routine_id,
        name: body.day_name,
        position: positions.length ? Math.max(...positions) + 1 : 0,
        weekday: null,
        created_at: timestamp,
        updated_at: timestamp,
      };
      state.days.push(day);
      return sendJson(response, 200, day.id);
    }

    if (operation === "append_routine_exercise") {
      if (
        state.routineExercises.some(
          (item) =>
            item.routine_day_id === body.target_day_id &&
            item.exercise_id === body.target_exercise_id,
        )
      ) {
        return sendDatabaseError(response, "23505", "Duplicate exercise");
      }
      const dayItems = state.routineExercises.filter(
        ({ routine_day_id }) => routine_day_id === body.target_day_id,
      );
      const prescription = {
        id: nextUuid(),
        routine_day_id: body.target_day_id,
        exercise_id: body.target_exercise_id,
        position: dayItems.length
          ? Math.max(...dayItems.map(({ position }) => position)) + 1
          : 0,
        target_sets: body.target_sets,
        target_reps_min: body.target_reps_min,
        target_reps_max: body.target_reps_max,
        rest_seconds: body.target_rest_seconds,
        target_rir: body.target_rir ?? null,
        notes: null,
        created_at: timestamp,
        updated_at: timestamp,
      };
      state.routineExercises.push(prescription);
      return sendJson(response, 200, prescription.id);
    }

    if (operation === "duplicate_routine_day") {
      const source = state.days.find(({ id }) => id === body.source_day_id);
      if (!source) return sendDatabaseError(response, "42501", "Not owned");
      const routineDays = state.days.filter(
        ({ routine_id }) => routine_id === source.routine_id,
      );
      const duplicate = {
        ...source,
        id: nextUuid(),
        name: `${source.name.slice(0, 94)} copia`,
        position: Math.max(...routineDays.map(({ position }) => position)) + 1,
        weekday: null,
      };
      state.days.push(duplicate);
      for (const item of state.routineExercises.filter(
        ({ routine_day_id }) => routine_day_id === source.id,
      )) {
        state.routineExercises.push({
          ...item,
          id: nextUuid(),
          routine_day_id: duplicate.id,
        });
      }
      return sendJson(response, 200, duplicate.id);
    }

    if (operation === "reorder_routine_days") {
      body.ordered_day_ids.forEach((id, position) => {
        const day = state.days.find((item) => item.id === id);
        if (day) day.position = position;
      });
      return sendJson(response, 200, null);
    }

    if (operation === "reorder_routine_exercises") {
      body.ordered_routine_exercise_ids.forEach((id, position) => {
        const item = state.routineExercises.find(
          (prescription) => prescription.id === id,
        );
        if (item) item.position = position;
      });
      return sendJson(response, 200, null);
    }

    if (operation === "start_workout") {
      const existing = state.workoutSessions.find(
        ({ status }) => status === "in_progress",
      );
      if (existing) return sendJson(response, 200, existing.id);

      const day = state.days.find(
        ({ id }) => id === body.target_routine_day_id,
      );
      const routine = day
        ? state.routines.find(
            ({ id, is_active, archived_at }) =>
              id === day.routine_id && is_active && archived_at === null,
          )
        : null;
      const prescriptions = day
        ? state.routineExercises
            .filter(({ routine_day_id }) => routine_day_id === day.id)
            .sort((left, right) => left.position - right.position)
        : [];

      if (!day || !routine || prescriptions.length === 0) {
        return sendDatabaseError(response, "22023", "Day is not available");
      }

      const now = new Date().toISOString();
      const snapshotSession = {
        id: nextUuid(),
        user_id: session.user.id,
        routine_day_id: day.id,
        routine_name_snapshot: routine.name,
        routine_day_name_snapshot: day.name,
        started_at: now,
        completed_at: null,
        status: "in_progress",
        notes: null,
        snapshot_locked_at: now,
        active_workout_exercise_id: null,
        rest_ends_at: null,
        rest_source_set_id: null,
        created_at: now,
        updated_at: now,
      };

      for (const prescription of prescriptions) {
        const exercise = exercises.find(
          ({ id }) => id === prescription.exercise_id,
        );
        const snapshot = {
          id: nextUuid(),
          workout_session_id: snapshotSession.id,
          exercise_id: prescription.exercise_id,
          source_routine_exercise_id: prescription.id,
          position: prescription.position,
          target_sets: prescription.target_sets,
          target_reps_min: prescription.target_reps_min,
          target_reps_max: prescription.target_reps_max,
          rest_seconds: prescription.rest_seconds,
          target_rir: prescription.target_rir,
          exercise_name_snapshot: exercise?.name ?? "Ejercicio",
          notes: prescription.notes,
          created_at: now,
        };
        state.workoutExercises.push(snapshot);
        snapshotSession.active_workout_exercise_id ??= snapshot.id;
      }

      state.workoutSessions.push(snapshotSession);
      return sendJson(response, 200, snapshotSession.id);
    }

    if (operation === "complete_workout_set") {
      const workoutExercise = state.workoutExercises.find(
        ({ id }) => id === body.target_workout_exercise_id,
      );
      const workoutSession = workoutExercise
        ? state.workoutSessions.find(
            ({ id, status }) =>
              id === workoutExercise.workout_session_id &&
              status === "in_progress",
          )
        : null;
      if (!workoutExercise || !workoutSession) {
        return sendDatabaseError(response, "42501", "Workout not active");
      }

      let workoutSet = state.workoutSets.find(
        ({ workout_exercise_id, set_number }) =>
          workout_exercise_id === workoutExercise.id &&
          set_number === body.target_set_number,
      );
      const inserted = !workoutSet;

      if (!workoutSet) {
        const now = new Date().toISOString();
        workoutSet = {
          id: nextUuid(),
          workout_exercise_id: workoutExercise.id,
          set_number: body.target_set_number,
          weight_kg: body.target_weight_kg,
          repetitions: body.target_repetitions,
          rir: body.target_rir ?? null,
          set_type: body.target_set_type ?? "working",
          completed_at: now,
          created_at: now,
          updated_at: now,
        };
        state.workoutSets.push(workoutSet);

        const snapshots = state.workoutExercises
          .filter(
            ({ workout_session_id }) =>
              workout_session_id === workoutSession.id,
          )
          .sort((left, right) => left.position - right.position);
        const currentIndex = snapshots.findIndex(
          ({ id }) => id === workoutExercise.id,
        );
        const currentCount = state.workoutSets.filter(
          ({ workout_exercise_id }) =>
            workout_exercise_id === workoutExercise.id,
        ).length;
        let nextExercise =
          currentCount < workoutExercise.target_sets ? workoutExercise : null;

        if (!nextExercise) {
          const candidates = [
            ...snapshots.slice(currentIndex + 1),
            ...snapshots.slice(0, currentIndex + 1),
          ];
          nextExercise = candidates.find((candidate) => {
            const completed = state.workoutSets.filter(
              ({ workout_exercise_id }) => workout_exercise_id === candidate.id,
            ).length;
            return completed < candidate.target_sets;
          });
        }

        workoutSession.active_workout_exercise_id =
          nextExercise?.id ?? workoutExercise.id;
        workoutSession.rest_ends_at = nextExercise
          ? new Date(
              Date.now() + workoutExercise.rest_seconds * 1000,
            ).toISOString()
          : null;
        workoutSession.rest_source_set_id = workoutSession.rest_ends_at
          ? workoutSet.id
          : null;
      }

      return postgrestResponse(request, response, [
        {
          workout_set_id: workoutSet.id,
          inserted,
          set_number: workoutSet.set_number,
          weight_kg: workoutSet.weight_kg,
          repetitions: workoutSet.repetitions,
          rir: workoutSet.rir,
          set_type: workoutSet.set_type,
          completed_at: workoutSet.completed_at,
          rest_ends_at: workoutSession.rest_ends_at,
          active_workout_exercise_id: workoutSession.active_workout_exercise_id,
        },
      ]);
    }

    if (operation === "undo_last_workout_set") {
      const workoutSession = state.workoutSessions.find(
        ({ id, status }) =>
          id === body.target_workout_session_id && status === "in_progress",
      );
      const workoutSet = state.workoutSets.find(
        ({ id }) => id === body.target_workout_set_id,
      );
      const workoutExercise = workoutSet
        ? state.workoutExercises.find(
            ({ id, workout_session_id }) =>
              id === workoutSet.workout_exercise_id &&
              workout_session_id === workoutSession?.id,
          )
        : null;
      const latestSet = workoutSession
        ? state.workoutSets
            .filter(({ workout_exercise_id }) =>
              state.workoutExercises.some(
                ({ id, workout_session_id }) =>
                  id === workout_exercise_id &&
                  workout_session_id === workoutSession.id,
              ),
            )
            .sort(
              (left, right) =>
                new Date(right.completed_at).getTime() -
                new Date(left.completed_at).getTime(),
            )[0]
        : null;

      if (
        !workoutSession ||
        !workoutSet ||
        !workoutExercise ||
        latestSet?.id !== workoutSet.id
      ) {
        return sendDatabaseError(response, "22023", "Set cannot be undone");
      }

      state.workoutSets = state.workoutSets.filter(
        ({ id }) => id !== workoutSet.id,
      );
      workoutSession.active_workout_exercise_id = workoutExercise.id;
      if (workoutSession.rest_source_set_id === workoutSet.id) {
        workoutSession.rest_ends_at = null;
        workoutSession.rest_source_set_id = null;
      }

      return postgrestResponse(request, response, [
        {
          workout_exercise_id: workoutExercise.id,
          set_number: workoutSet.set_number,
          active_workout_exercise_id: workoutExercise.id,
          rest_ends_at: workoutSession.rest_ends_at,
        },
      ]);
    }

    if (operation === "extend_workout_rest") {
      const workoutSession = state.workoutSessions.find(
        ({ id, status }) =>
          id === body.target_workout_session_id && status === "in_progress",
      );
      if (!workoutSession?.rest_ends_at) {
        return sendDatabaseError(response, "22023", "No active rest");
      }
      workoutSession.rest_ends_at = new Date(
        new Date(workoutSession.rest_ends_at).getTime() +
          body.extension_seconds * 1000,
      ).toISOString();
      return sendJson(response, 200, workoutSession.rest_ends_at);
    }

    if (operation === "skip_workout_rest") {
      const workoutSession = state.workoutSessions.find(
        ({ id, status }) =>
          id === body.target_workout_session_id && status === "in_progress",
      );
      if (!workoutSession) {
        return sendDatabaseError(response, "42501", "Workout not active");
      }
      workoutSession.rest_ends_at = null;
      workoutSession.rest_source_set_id = null;
      return sendJson(response, 200, null);
    }

    if (operation === "select_workout_exercise") {
      const workoutSession = state.workoutSessions.find(
        ({ id, status }) =>
          id === body.target_workout_session_id && status === "in_progress",
      );
      const belongs = state.workoutExercises.some(
        ({ id, workout_session_id }) =>
          id === body.target_workout_exercise_id &&
          workout_session_id === workoutSession?.id,
      );
      if (!workoutSession || !belongs) {
        return sendDatabaseError(response, "42501", "Exercise not available");
      }
      workoutSession.active_workout_exercise_id =
        body.target_workout_exercise_id;
      return sendJson(response, 200, null);
    }

    if (operation === "finish_workout") {
      const workoutSession = state.workoutSessions.find(
        ({ id }) => id === body.target_workout_session_id,
      );
      if (!workoutSession) {
        return sendDatabaseError(response, "42501", "Workout not available");
      }
      if (workoutSession.status !== "completed") {
        workoutSession.status = "completed";
        workoutSession.completed_at = new Date().toISOString();
        workoutSession.active_workout_exercise_id = null;
        workoutSession.rest_ends_at = null;
        workoutSession.rest_source_set_id = null;
      }
      return sendJson(response, 200, workoutSession.completed_at);
    }
  }

  return sendJson(response, 404, { message: "Mock endpoint not found" });
}

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url ?? "/", `http://${host}:${port}`);

    if (request.method === "OPTIONS") {
      response.writeHead(204, {
        "access-control-allow-origin": "*",
        "access-control-allow-headers":
          "authorization, apikey, content-type, prefer, range, x-client-info",
        "access-control-allow-methods": "GET, POST, PATCH, DELETE, OPTIONS",
      });
      return response.end();
    }

    if (request.method === "GET" && url.pathname === "/") {
      return sendJson(response, 200, { status: "ok" });
    }

    if (request.method === "POST" && url.pathname === "/auth/v1/token") {
      const body = await readBody(request);
      const email =
        typeof body.email === "string" ? body.email : "e2e@gymbro.test";
      const { accessToken, user } = createAccount(email);
      return sendJson(response, 200, {
        access_token: accessToken,
        token_type: "bearer",
        expires_in: 3600,
        expires_at: issuedAt + 3600,
        refresh_token: `gymbro-e2e-refresh-${user.id}`,
        user,
      });
    }

    if (request.method === "GET" && url.pathname === "/auth/v1/user") {
      const session = sessionFor(request);
      return session
        ? sendJson(response, 200, session.user)
        : sendJson(response, 401, { message: "Invalid token" });
    }

    if (
      request.method === "GET" &&
      url.pathname === "/auth/v1/.well-known/jwks.json"
    ) {
      return sendJson(response, 200, { keys: [] });
    }

    if (url.pathname.startsWith("/rest/v1/")) {
      const session = sessionFor(request);
      return session
        ? await handleRest(request, response, url, session)
        : sendJson(response, 401, { message: "Invalid token" });
    }

    return sendJson(response, 404, { message: "Mock endpoint not found" });
  } catch (error) {
    return sendJson(response, 500, {
      message: error instanceof Error ? error.message : "Mock failure",
    });
  }
});

server.listen(port, host, () => {
  process.stdout.write(
    `GymBro E2E Supabase mock listening on ${host}:${port}\n`,
  );
});

function close() {
  server.close(() => process.exit(0));
}

process.on("SIGINT", close);
process.on("SIGTERM", close);
