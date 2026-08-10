create or replace function public.complete_workout_set(
  target_workout_exercise_id uuid,
  target_set_number smallint,
  target_weight_kg numeric,
  target_repetitions smallint,
  target_rir smallint default null,
  target_set_type public.workout_set_type default 'working'
)
returns table (
  workout_set_id uuid,
  inserted boolean,
  set_number smallint,
  weight_kg numeric,
  repetitions smallint,
  rir smallint,
  set_type public.workout_set_type,
  completed_at timestamptz,
  rest_ends_at timestamptz,
  active_workout_exercise_id uuid
)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
  target_session_id uuid;
  target_position smallint;
  planned_sets smallint;
  planned_rest_seconds smallint;
  created_set_id uuid;
  stored_weight numeric;
  stored_repetitions smallint;
  stored_rir smallint;
  stored_set_type public.workout_set_type;
  stored_completed_at timestamptz;
  was_inserted boolean;
  completed_set_count integer;
  next_workout_exercise_id uuid;
  next_rest_ends_at timestamptz;
  current_active_exercise_id uuid;
  current_rest_ends_at timestamptz;
begin
  if current_user_id is null then
    raise exception using errcode = '42501', message = 'Authentication required';
  end if;

  if target_set_number < 1
    or target_weight_kg < 0
    or target_weight_kg > 2000
    or target_repetitions < 0
    or target_repetitions > 1000
    or (target_rir is not null and target_rir not between 0 and 10)
  then
    raise exception using errcode = '22023', message = 'Workout set values are invalid';
  end if;

  select
    workout_sessions.id,
    workout_exercises.position,
    workout_exercises.target_sets,
    workout_exercises.rest_seconds
  into
    target_session_id,
    target_position,
    planned_sets,
    planned_rest_seconds
  from public.workout_exercises
  join public.workout_sessions
    on workout_sessions.id = workout_exercises.workout_session_id
  where workout_exercises.id = target_workout_exercise_id
    and workout_sessions.user_id = current_user_id
    and workout_sessions.status = 'in_progress'
    and workout_sessions.snapshot_locked_at is not null
  for update of workout_sessions;

  if not found then
    raise exception using errcode = '42501', message = 'Active workout exercise is not available';
  end if;

  if target_set_number > planned_sets then
    raise exception using errcode = '22023', message = 'Set number exceeds the workout prescription';
  end if;

  insert into public.workout_sets (
    workout_exercise_id,
    set_number,
    weight_kg,
    repetitions,
    rir,
    set_type,
    completed_at
  )
  values (
    target_workout_exercise_id,
    target_set_number,
    target_weight_kg,
    target_repetitions,
    target_rir,
    target_set_type,
    now()
  )
  on conflict on constraint workout_sets_workout_exercise_id_set_number_key
    do nothing
  returning
    workout_sets.id,
    workout_sets.weight_kg,
    workout_sets.repetitions,
    workout_sets.rir,
    workout_sets.set_type,
    workout_sets.completed_at
  into
    created_set_id,
    stored_weight,
    stored_repetitions,
    stored_rir,
    stored_set_type,
    stored_completed_at;

  was_inserted := found;

  if not was_inserted then
    select
      workout_sets.id,
      workout_sets.weight_kg,
      workout_sets.repetitions,
      workout_sets.rir,
      workout_sets.set_type,
      workout_sets.completed_at
    into
      created_set_id,
      stored_weight,
      stored_repetitions,
      stored_rir,
      stored_set_type,
      stored_completed_at
    from public.workout_sets
    where workout_sets.workout_exercise_id = target_workout_exercise_id
      and workout_sets.set_number = target_set_number;

    select
      workout_sessions.active_workout_exercise_id,
      workout_sessions.rest_ends_at
    into current_active_exercise_id, current_rest_ends_at
    from public.workout_sessions
    where workout_sessions.id = target_session_id;

    return query select
      created_set_id,
      false,
      target_set_number,
      stored_weight,
      stored_repetitions,
      stored_rir,
      stored_set_type,
      stored_completed_at,
      current_rest_ends_at,
      current_active_exercise_id;
    return;
  end if;

  select count(*)
  into completed_set_count
  from public.workout_sets
  where workout_sets.workout_exercise_id = target_workout_exercise_id;

  if completed_set_count < planned_sets then
    next_workout_exercise_id := target_workout_exercise_id;
  else
    select candidate.id
    into next_workout_exercise_id
    from public.workout_exercises as candidate
    where candidate.workout_session_id = target_session_id
      and candidate.position > target_position
      and (
        select count(*)
        from public.workout_sets
        where workout_sets.workout_exercise_id = candidate.id
      ) < candidate.target_sets
    order by candidate.position
    limit 1;

    if next_workout_exercise_id is null then
      select candidate.id
      into next_workout_exercise_id
      from public.workout_exercises as candidate
      where candidate.workout_session_id = target_session_id
        and (
          select count(*)
          from public.workout_sets
          where workout_sets.workout_exercise_id = candidate.id
        ) < candidate.target_sets
      order by candidate.position
      limit 1;
    end if;
  end if;

  next_rest_ends_at := case
    when next_workout_exercise_id is not null and planned_rest_seconds > 0
      then now() + make_interval(secs => planned_rest_seconds)
    else null
  end;

  update public.workout_sessions
  set
    active_workout_exercise_id = coalesce(
      next_workout_exercise_id,
      target_workout_exercise_id
    ),
    rest_ends_at = next_rest_ends_at,
    rest_source_set_id = case
      when next_rest_ends_at is null then null
      else created_set_id
    end
  where workout_sessions.id = target_session_id
  returning workout_sessions.active_workout_exercise_id
  into current_active_exercise_id;

  return query select
    created_set_id,
    true,
    target_set_number,
    stored_weight,
    stored_repetitions,
    stored_rir,
    stored_set_type,
    stored_completed_at,
    next_rest_ends_at,
    current_active_exercise_id;
end;
$$;

comment on function public.complete_workout_set(uuid, smallint, numeric, smallint, smallint, public.workout_set_type) is
  'Idempotently records one planned set using the explicit unique constraint, advances the active exercise, and persists the rest deadline.';
