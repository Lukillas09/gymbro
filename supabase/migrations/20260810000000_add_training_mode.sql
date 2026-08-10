alter table public.workout_sessions
add column routine_name_snapshot text,
add column routine_day_name_snapshot text,
add column snapshot_locked_at timestamptz,
add column active_workout_exercise_id uuid,
add column rest_ends_at timestamptz,
add column rest_source_set_id uuid;

update public.workout_sessions
set
  routine_name_snapshot = coalesce(
    (
      select routines.name
      from public.routine_days
      join public.routines on routines.id = routine_days.routine_id
      where routine_days.id = workout_sessions.routine_day_id
    ),
    'Entrenamiento'
  ),
  routine_day_name_snapshot = coalesce(
    (
      select routine_days.name
      from public.routine_days
      where routine_days.id = workout_sessions.routine_day_id
    ),
    'Entrenamiento'
  ),
  snapshot_locked_at = coalesce(updated_at, created_at);

alter table public.workout_sessions
alter column routine_name_snapshot set not null,
alter column routine_day_name_snapshot set not null,
add constraint workout_sessions_routine_name_snapshot_length check (
  char_length(btrim(routine_name_snapshot)) between 1 and 100
),
add constraint workout_sessions_day_name_snapshot_length check (
  char_length(btrim(routine_day_name_snapshot)) between 1 and 100
),
add constraint workout_sessions_rest_state_consistency check (
  (
    rest_ends_at is null
    and rest_source_set_id is null
  )
  or (
    status = 'in_progress'
    and rest_ends_at is not null
    and rest_source_set_id is not null
  )
),
add constraint workout_sessions_terminal_live_state check (
  status = 'in_progress'
  or (
    active_workout_exercise_id is null
    and rest_ends_at is null
    and rest_source_set_id is null
  )
);

alter table public.workout_exercises
add column target_rir smallint,
add column exercise_name_snapshot text;

update public.workout_exercises
set exercise_name_snapshot = exercises.name
from public.exercises
where exercises.id = workout_exercises.exercise_id;

alter table public.workout_exercises
alter column exercise_name_snapshot set not null,
add constraint workout_exercises_target_rir_range check (
  target_rir is null or target_rir between 0 and 5
),
add constraint workout_exercises_name_snapshot_length check (
  char_length(btrim(exercise_name_snapshot)) between 2 and 120
);

update public.workout_sets
set completed_at = coalesce(completed_at, created_at)
where completed_at is null;

alter table public.workout_sets
alter column completed_at set default now(),
alter column completed_at set not null;

alter table public.workout_sessions
add constraint workout_sessions_active_exercise_fk
  foreign key (active_workout_exercise_id)
  references public.workout_exercises (id)
  on delete set null,
add constraint workout_sessions_rest_source_set_fk
  foreign key (rest_source_set_id)
  references public.workout_sets (id)
  on delete set null;

create index workout_exercises_session_exercise_idx
  on public.workout_exercises (workout_session_id, exercise_id);
create index workout_sets_exercise_completed_idx
  on public.workout_sets (workout_exercise_id, completed_at desc);

create or replace function private.assert_workout_session_integrity(
  target_session_id uuid
)
returns void
language plpgsql
set search_path = ''
as $$
declare
  session_row public.workout_sessions%rowtype;
begin
  select *
  into session_row
  from public.workout_sessions
  where id = target_session_id;

  if not found then
    return;
  end if;

  if session_row.snapshot_locked_at is null then
    raise exception using
      errcode = '23514',
      message = 'Workout snapshot must be locked before commit';
  end if;

  if not exists (
    select 1
    from public.workout_exercises
    where workout_session_id = target_session_id
  ) then
    raise exception using
      errcode = '23514',
      message = 'Workout session requires at least one exercise snapshot';
  end if;

  if session_row.status = 'in_progress' and (
    session_row.active_workout_exercise_id is null
    or not exists (
      select 1
      from public.workout_exercises
      where id = session_row.active_workout_exercise_id
        and workout_session_id = target_session_id
    )
  ) then
    raise exception using
      errcode = '23514',
      message = 'Active workout exercise must belong to the in-progress session';
  end if;

  if session_row.rest_source_set_id is not null and not exists (
    select 1
    from public.workout_sets
    join public.workout_exercises
      on workout_exercises.id = workout_sets.workout_exercise_id
    where workout_sets.id = session_row.rest_source_set_id
      and workout_exercises.workout_session_id = target_session_id
  ) then
    raise exception using
      errcode = '23514',
      message = 'Rest source set must belong to the workout session';
  end if;
end;
$$;

create or replace function private.check_workout_session_integrity()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  perform private.assert_workout_session_integrity(
    case when tg_op = 'DELETE' then old.id else new.id end
  );
  return null;
end;
$$;

create or replace function private.check_workout_exercise_session_integrity()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'DELETE' then
    perform private.assert_workout_session_integrity(old.workout_session_id);
  elsif tg_op = 'INSERT' then
    perform private.assert_workout_session_integrity(new.workout_session_id);
  else
    perform private.assert_workout_session_integrity(old.workout_session_id);

    if new.workout_session_id <> old.workout_session_id then
      perform private.assert_workout_session_integrity(new.workout_session_id);
    end if;
  end if;

  return null;
end;
$$;

create constraint trigger workout_sessions_validate_snapshot
after insert or update on public.workout_sessions
deferrable initially deferred
for each row execute function private.check_workout_session_integrity();

create constraint trigger workout_exercises_validate_session
after insert or update or delete on public.workout_exercises
deferrable initially deferred
for each row execute function private.check_workout_exercise_session_integrity();

drop policy workout_sessions_insert_own on public.workout_sessions;
create policy workout_sessions_insert_own
on public.workout_sessions for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and status = 'in_progress'
  and completed_at is null
  and snapshot_locked_at is null
  and char_length(btrim(routine_name_snapshot)) between 1 and 100
  and char_length(btrim(routine_day_name_snapshot)) between 1 and 100
);

drop policy workout_exercises_insert_active_own on public.workout_exercises;
create policy workout_exercises_insert_open_snapshot_own
on public.workout_exercises for insert
to authenticated
with check (
  exists (
    select 1 from public.workout_sessions
    where workout_sessions.id = workout_exercises.workout_session_id
      and workout_sessions.user_id = (select auth.uid())
      and workout_sessions.status = 'in_progress'
      and workout_sessions.snapshot_locked_at is null
  )
  and exists (
    select 1 from public.exercises
    where exercises.id = workout_exercises.exercise_id
      and (
        not exercises.is_custom
        or exercises.created_by = (select auth.uid())
      )
  )
);

drop policy workout_exercises_update_active_own on public.workout_exercises;
drop policy workout_exercises_delete_active_own on public.workout_exercises;

drop policy workout_sets_insert_active_own on public.workout_sets;
create policy workout_sets_insert_active_own
on public.workout_sets for insert
to authenticated
with check (
  exists (
    select 1
    from public.workout_exercises
    join public.workout_sessions
      on workout_sessions.id = workout_exercises.workout_session_id
    where workout_exercises.id = workout_sets.workout_exercise_id
      and workout_sessions.user_id = (select auth.uid())
      and workout_sessions.status = 'in_progress'
      and workout_sessions.snapshot_locked_at is not null
      and workout_sets.set_number between 1 and workout_exercises.target_sets
  )
);

create or replace function public.start_workout(target_routine_day_id uuid)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
  existing_session_id uuid;
  created_session_id uuid;
  first_workout_exercise_id uuid;
  source_routine_name text;
  source_day_name text;
begin
  if current_user_id is null then
    raise exception using errcode = '42501', message = 'Authentication required';
  end if;

  perform 1
  from public.profiles
  where id = current_user_id
  for update;

  if not found then
    raise exception using errcode = '42501', message = 'Profile is not available';
  end if;

  select id
  into existing_session_id
  from public.workout_sessions
  where user_id = current_user_id
    and status = 'in_progress'
  for update;

  if existing_session_id is not null then
    return existing_session_id;
  end if;

  select routines.name, routine_days.name
  into source_routine_name, source_day_name
  from public.routine_days
  join public.routines on routines.id = routine_days.routine_id
  where routine_days.id = target_routine_day_id
    and routines.user_id = current_user_id
    and routines.is_active
    and routines.archived_at is null
  for share of routine_days, routines;

  if not found then
    raise exception using errcode = '42501', message = 'Routine day is not available';
  end if;

  if not exists (
    select 1
    from public.routine_exercises
    where routine_day_id = target_routine_day_id
  ) then
    raise exception using errcode = '22023', message = 'Routine day has no exercises';
  end if;

  insert into public.workout_sessions (
    user_id,
    routine_day_id,
    routine_name_snapshot,
    routine_day_name_snapshot
  )
  values (
    current_user_id,
    target_routine_day_id,
    source_routine_name,
    source_day_name
  )
  returning id into created_session_id;

  insert into public.workout_exercises (
    workout_session_id,
    exercise_id,
    source_routine_exercise_id,
    position,
    target_sets,
    target_reps_min,
    target_reps_max,
    rest_seconds,
    target_rir,
    exercise_name_snapshot,
    notes
  )
  select
    created_session_id,
    routine_exercises.exercise_id,
    routine_exercises.id,
    routine_exercises.position,
    routine_exercises.target_sets,
    routine_exercises.target_reps_min,
    routine_exercises.target_reps_max,
    routine_exercises.rest_seconds,
    routine_exercises.target_rir,
    exercises.name,
    routine_exercises.notes
  from public.routine_exercises
  join public.exercises on exercises.id = routine_exercises.exercise_id
  where routine_exercises.routine_day_id = target_routine_day_id
  order by routine_exercises.position;

  select id
  into first_workout_exercise_id
  from public.workout_exercises
  where workout_session_id = created_session_id
  order by position
  limit 1;

  update public.workout_sessions
  set
    active_workout_exercise_id = first_workout_exercise_id,
    snapshot_locked_at = now()
  where id = created_session_id;

  return created_session_id;
end;
$$;

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
  on conflict (workout_exercise_id, set_number) do nothing
  returning
    id,
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
      id,
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
    where workout_exercise_id = target_workout_exercise_id
      and set_number = target_set_number;

    select
      workout_sessions.active_workout_exercise_id,
      workout_sessions.rest_ends_at
    into current_active_exercise_id, current_rest_ends_at
    from public.workout_sessions
    where id = target_session_id;

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
  where workout_exercise_id = target_workout_exercise_id;

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
        where workout_exercise_id = candidate.id
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
          where workout_exercise_id = candidate.id
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
  where id = target_session_id
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

create or replace function public.undo_last_workout_set(
  target_workout_session_id uuid,
  target_workout_set_id uuid
)
returns table (
  workout_exercise_id uuid,
  set_number smallint,
  active_workout_exercise_id uuid,
  rest_ends_at timestamptz
)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
  target_exercise_id uuid;
  target_number smallint;
  latest_set_id uuid;
  remaining_rest_ends_at timestamptz;
begin
  if current_user_id is null then
    raise exception using errcode = '42501', message = 'Authentication required';
  end if;

  perform 1
  from public.workout_sessions
  where id = target_workout_session_id
    and user_id = current_user_id
    and status = 'in_progress'
  for update;

  if not found then
    raise exception using errcode = '42501', message = 'Active workout session is not available';
  end if;

  select workout_sets.workout_exercise_id, workout_sets.set_number
  into target_exercise_id, target_number
  from public.workout_sets
  join public.workout_exercises
    on workout_exercises.id = workout_sets.workout_exercise_id
  where workout_sets.id = target_workout_set_id
    and workout_exercises.workout_session_id = target_workout_session_id;

  if not found then
    raise exception using errcode = '22023', message = 'Workout set is not available';
  end if;

  select workout_sets.id
  into latest_set_id
  from public.workout_sets
  join public.workout_exercises
    on workout_exercises.id = workout_sets.workout_exercise_id
  where workout_exercises.workout_session_id = target_workout_session_id
  order by workout_sets.completed_at desc, workout_sets.created_at desc, workout_sets.id desc
  limit 1;

  if latest_set_id <> target_workout_set_id then
    raise exception using errcode = '22023', message = 'Only the latest workout set can be undone';
  end if;

  update public.workout_sessions
  set
    active_workout_exercise_id = target_exercise_id,
    rest_ends_at = case
      when rest_source_set_id = target_workout_set_id then null
      else workout_sessions.rest_ends_at
    end,
    rest_source_set_id = case
      when rest_source_set_id = target_workout_set_id then null
      else rest_source_set_id
    end
  where id = target_workout_session_id
  returning workout_sessions.rest_ends_at into remaining_rest_ends_at;

  delete from public.workout_sets
  where id = target_workout_set_id;

  return query select
    target_exercise_id,
    target_number,
    target_exercise_id,
    remaining_rest_ends_at;
end;
$$;

create or replace function public.extend_workout_rest(
  target_workout_session_id uuid,
  extension_seconds smallint default 15
)
returns timestamptz
language plpgsql
security invoker
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
  extended_rest_ends_at timestamptz;
begin
  if current_user_id is null then
    raise exception using errcode = '42501', message = 'Authentication required';
  end if;

  if extension_seconds not between 1 and 300 then
    raise exception using errcode = '22023', message = 'Rest extension is invalid';
  end if;

  update public.workout_sessions
  set rest_ends_at = workout_sessions.rest_ends_at
    + make_interval(secs => extension_seconds)
  where id = target_workout_session_id
    and user_id = current_user_id
    and status = 'in_progress'
    and rest_ends_at > now()
  returning workout_sessions.rest_ends_at into extended_rest_ends_at;

  if extended_rest_ends_at is null then
    raise exception using errcode = '22023', message = 'Active rest is not available';
  end if;

  return extended_rest_ends_at;
end;
$$;

create or replace function public.skip_workout_rest(
  target_workout_session_id uuid
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
begin
  if current_user_id is null then
    raise exception using errcode = '42501', message = 'Authentication required';
  end if;

  update public.workout_sessions
  set rest_ends_at = null, rest_source_set_id = null
  where id = target_workout_session_id
    and user_id = current_user_id
    and status = 'in_progress';

  if not found then
    raise exception using errcode = '42501', message = 'Active workout session is not available';
  end if;
end;
$$;

create or replace function public.select_workout_exercise(
  target_workout_session_id uuid,
  target_workout_exercise_id uuid
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
begin
  if current_user_id is null then
    raise exception using errcode = '42501', message = 'Authentication required';
  end if;

  update public.workout_sessions
  set active_workout_exercise_id = target_workout_exercise_id
  where id = target_workout_session_id
    and user_id = current_user_id
    and status = 'in_progress'
    and exists (
      select 1
      from public.workout_exercises
      where workout_exercises.id = target_workout_exercise_id
        and workout_exercises.workout_session_id = target_workout_session_id
    );

  if not found then
    raise exception using errcode = '42501', message = 'Workout exercise is not available';
  end if;
end;
$$;

create or replace function public.finish_workout(
  target_workout_session_id uuid
)
returns timestamptz
language plpgsql
security invoker
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
  current_status public.workout_status;
  finished_at timestamptz;
begin
  if current_user_id is null then
    raise exception using errcode = '42501', message = 'Authentication required';
  end if;

  select status, completed_at
  into current_status, finished_at
  from public.workout_sessions
  where id = target_workout_session_id
    and user_id = current_user_id
  for update;

  if not found then
    raise exception using errcode = '42501', message = 'Workout session is not available';
  end if;

  if current_status = 'completed' then
    return finished_at;
  end if;

  if current_status <> 'in_progress' then
    raise exception using errcode = '22023', message = 'Workout session cannot be completed';
  end if;

  finished_at := now();

  update public.workout_sessions
  set
    status = 'completed',
    completed_at = finished_at,
    active_workout_exercise_id = null,
    rest_ends_at = null,
    rest_source_set_id = null
  where id = target_workout_session_id;

  return finished_at;
end;
$$;

revoke update, delete on table public.workout_exercises from authenticated;
revoke delete on table public.workout_sessions from authenticated;
revoke update on table public.workout_sets from authenticated;

grant insert (
  routine_name_snapshot,
  routine_day_name_snapshot
) on public.workout_sessions to authenticated;
grant update (
  snapshot_locked_at,
  active_workout_exercise_id,
  rest_ends_at,
  rest_source_set_id
) on public.workout_sessions to authenticated;
grant insert (
  target_rir,
  exercise_name_snapshot
) on public.workout_exercises to authenticated;

revoke all on function public.start_workout(uuid) from public, anon;
revoke all on function public.complete_workout_set(
  uuid,
  smallint,
  numeric,
  smallint,
  smallint,
  public.workout_set_type
) from public, anon;
revoke all on function public.undo_last_workout_set(uuid, uuid) from public, anon;
revoke all on function public.extend_workout_rest(uuid, smallint) from public, anon;
revoke all on function public.skip_workout_rest(uuid) from public, anon;
revoke all on function public.select_workout_exercise(uuid, uuid) from public, anon;
revoke all on function public.finish_workout(uuid) from public, anon;

grant execute on function public.start_workout(uuid) to authenticated;
grant execute on function public.complete_workout_set(
  uuid,
  smallint,
  numeric,
  smallint,
  smallint,
  public.workout_set_type
) to authenticated;
grant execute on function public.undo_last_workout_set(uuid, uuid) to authenticated;
grant execute on function public.extend_workout_rest(uuid, smallint) to authenticated;
grant execute on function public.skip_workout_rest(uuid) to authenticated;
grant execute on function public.select_workout_exercise(uuid, uuid) to authenticated;
grant execute on function public.finish_workout(uuid) to authenticated;

comment on column public.workout_sessions.routine_name_snapshot is
  'Routine name captured when the workout starts so historical sessions remain readable.';
comment on column public.workout_sessions.routine_day_name_snapshot is
  'Routine day name captured when the workout starts so historical sessions remain readable.';
comment on column public.workout_sessions.rest_ends_at is
  'Absolute rest deadline used to recover the countdown after reload or backgrounding.';
comment on column public.workout_exercises.exercise_name_snapshot is
  'Exercise name captured when the workout starts; the catalog reference remains authoritative for taxonomy.';
comment on function public.start_workout(uuid) is
  'Idempotently creates one active workout and locks a stable prescription snapshot for an owned active routine day.';
comment on function public.complete_workout_set(uuid, smallint, numeric, smallint, smallint, public.workout_set_type) is
  'Idempotently records one planned set, advances the active exercise when needed, and persists the rest deadline.';
comment on function public.undo_last_workout_set(uuid, uuid) is
  'Deletes only the latest completed set from an owned active workout and restores its exercise and rest state.';
comment on function public.finish_workout(uuid) is
  'Atomically completes an owned workout session and clears all live-only state.';
