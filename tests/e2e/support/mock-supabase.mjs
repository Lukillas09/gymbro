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
  const state = accountStates.get(email) ?? {
    routines: [],
    days: [],
    routineExercises: [],
    workoutSessions: [],
    workoutExercises: [],
    workoutSets: [],
  };

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
  const exerciseIds = inFilter(url, "workout_exercises.exercise_id");

  return state.workoutSessions
    .filter(
      (session) =>
        (!id || session.id === id) &&
        (!excludedId || session.id !== excludedId) &&
        (!status || session.status === status) &&
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
        new Date(left.completed_at ?? left.started_at).getTime(),
    )
    .map((session) => serializeWorkoutSession(state, session));
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
