alter table public.routine_exercises
add column target_rir smallint,
add constraint routine_exercises_target_rir_range check (
  target_rir is null or target_rir between 0 and 5
),
add constraint routine_exercises_day_exercise_unique unique (
  routine_day_id,
  exercise_id
);

alter table public.routine_days
drop constraint routine_days_routine_id_position_key,
add constraint routine_days_routine_id_position_key
  unique (routine_id, position)
  deferrable initially immediate;

alter table public.routine_exercises
drop constraint routine_exercises_routine_day_id_position_key,
add constraint routine_exercises_routine_day_id_position_key
  unique (routine_day_id, position)
  deferrable initially immediate;

create or replace function public.activate_routine(target_routine_id uuid)
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

  perform 1
  from public.routines
  where user_id = current_user_id
  order by id
  for update;

  if not exists (
    select 1
    from public.routines
    where id = target_routine_id
      and user_id = current_user_id
      and archived_at is null
  ) then
    raise exception using errcode = '42501', message = 'Routine is not available';
  end if;

  update public.routines
  set is_active = false
  where user_id = current_user_id
    and is_active;

  update public.routines
  set is_active = true
  where id = target_routine_id
    and user_id = current_user_id;
end;
$$;

create or replace function public.append_routine_day(
  target_routine_id uuid,
  day_name text
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
  next_position smallint;
  created_day_id uuid;
begin
  if current_user_id is null then
    raise exception using errcode = '42501', message = 'Authentication required';
  end if;

  perform 1
  from public.routines
  where id = target_routine_id
    and user_id = current_user_id
    and archived_at is null
  for update;

  if not found then
    raise exception using errcode = '42501', message = 'Routine is not available';
  end if;

  select coalesce(max(position) + 1, 0)::smallint
  into next_position
  from public.routine_days
  where routine_id = target_routine_id;

  insert into public.routine_days (routine_id, name, position)
  values (target_routine_id, day_name, next_position)
  returning id into created_day_id;

  return created_day_id;
end;
$$;

create or replace function public.duplicate_routine_day(source_day_id uuid)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
  source_day public.routine_days%rowtype;
  next_position smallint;
  created_day_id uuid;
  duplicated_name text;
begin
  if current_user_id is null then
    raise exception using errcode = '42501', message = 'Authentication required';
  end if;

  select routine_days.*
  into source_day
  from public.routine_days
  join public.routines on routines.id = routine_days.routine_id
  where routine_days.id = source_day_id
    and routines.user_id = current_user_id
    and routines.archived_at is null;

  if not found then
    raise exception using errcode = '42501', message = 'Routine day is not available';
  end if;

  perform 1
  from public.routines
  where id = source_day.routine_id
  for update;

  select coalesce(max(position) + 1, 0)::smallint
  into next_position
  from public.routine_days
  where routine_id = source_day.routine_id;

  duplicated_name := case
    when char_length(source_day.name) <= 94 then source_day.name || ' copia'
    else left(source_day.name, 94) || ' copia'
  end;

  insert into public.routine_days (routine_id, name, position, weekday)
  values (source_day.routine_id, duplicated_name, next_position, null)
  returning id into created_day_id;

  insert into public.routine_exercises (
    routine_day_id,
    exercise_id,
    position,
    target_sets,
    target_reps_min,
    target_reps_max,
    rest_seconds,
    target_rir,
    notes
  )
  select
    created_day_id,
    exercise_id,
    position,
    target_sets,
    target_reps_min,
    target_reps_max,
    rest_seconds,
    target_rir,
    notes
  from public.routine_exercises
  where routine_day_id = source_day_id
  order by position;

  return created_day_id;
end;
$$;

create or replace function public.reorder_routine_days(
  target_routine_id uuid,
  ordered_day_ids uuid[]
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
  expected_count integer;
begin
  if current_user_id is null then
    raise exception using errcode = '42501', message = 'Authentication required';
  end if;

  perform 1
  from public.routines
  where id = target_routine_id
    and user_id = current_user_id
    and archived_at is null
  for update;

  if not found then
    raise exception using errcode = '42501', message = 'Routine is not available';
  end if;

  select count(*)
  into expected_count
  from public.routine_days
  where routine_id = target_routine_id;

  if ordered_day_ids is null
    or cardinality(ordered_day_ids) <> expected_count
    or (
      select count(distinct ordered.id)
      from unnest(ordered_day_ids) as ordered(id)
    ) <> expected_count
    or exists (
      select 1
      from unnest(ordered_day_ids) as ordered(id)
      left join public.routine_days
        on routine_days.id = ordered.id
        and routine_days.routine_id = target_routine_id
      where routine_days.id is null
    )
  then
    raise exception using errcode = '22023', message = 'Day order must contain every routine day exactly once';
  end if;

  set constraints routine_days_routine_id_position_key deferred;

  update public.routine_days
  set position = (ordered.ordinality - 1)::smallint
  from unnest(ordered_day_ids) with ordinality as ordered(id, ordinality)
  where routine_days.id = ordered.id
    and routine_days.routine_id = target_routine_id;
end;
$$;

create or replace function public.append_routine_exercise(
  target_day_id uuid,
  target_exercise_id uuid,
  target_sets smallint,
  target_reps_min smallint,
  target_reps_max smallint,
  target_rest_seconds smallint,
  target_rir smallint default null
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
  next_position smallint;
  created_routine_exercise_id uuid;
begin
  if current_user_id is null then
    raise exception using errcode = '42501', message = 'Authentication required';
  end if;

  perform 1
  from public.routine_days
  join public.routines on routines.id = routine_days.routine_id
  where routine_days.id = target_day_id
    and routines.user_id = current_user_id
    and routines.archived_at is null
  for update of routine_days;

  if not found then
    raise exception using errcode = '42501', message = 'Routine day is not available';
  end if;

  if not exists (
    select 1
    from public.exercises
    where id = target_exercise_id
      and (
        not is_custom
        or created_by = current_user_id
      )
  ) then
    raise exception using errcode = '42501', message = 'Exercise is not available';
  end if;

  select coalesce(max(position) + 1, 0)::smallint
  into next_position
  from public.routine_exercises
  where routine_day_id = target_day_id;

  insert into public.routine_exercises (
    routine_day_id,
    exercise_id,
    position,
    target_sets,
    target_reps_min,
    target_reps_max,
    rest_seconds,
    target_rir
  )
  values (
    target_day_id,
    target_exercise_id,
    next_position,
    target_sets,
    target_reps_min,
    target_reps_max,
    target_rest_seconds,
    target_rir
  )
  returning id into created_routine_exercise_id;

  return created_routine_exercise_id;
end;
$$;

create or replace function public.reorder_routine_exercises(
  target_day_id uuid,
  ordered_routine_exercise_ids uuid[]
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
  expected_count integer;
begin
  if current_user_id is null then
    raise exception using errcode = '42501', message = 'Authentication required';
  end if;

  perform 1
  from public.routine_days
  join public.routines on routines.id = routine_days.routine_id
  where routine_days.id = target_day_id
    and routines.user_id = current_user_id
    and routines.archived_at is null
  for update of routine_days;

  if not found then
    raise exception using errcode = '42501', message = 'Routine day is not available';
  end if;

  select count(*)
  into expected_count
  from public.routine_exercises
  where routine_day_id = target_day_id;

  if ordered_routine_exercise_ids is null
    or cardinality(ordered_routine_exercise_ids) <> expected_count
    or (
      select count(distinct ordered.id)
      from unnest(ordered_routine_exercise_ids) as ordered(id)
    ) <> expected_count
    or exists (
      select 1
      from unnest(ordered_routine_exercise_ids) as ordered(id)
      left join public.routine_exercises
        on routine_exercises.id = ordered.id
        and routine_exercises.routine_day_id = target_day_id
      where routine_exercises.id is null
    )
  then
    raise exception using errcode = '22023', message = 'Exercise order must contain every day exercise exactly once';
  end if;

  set constraints routine_exercises_routine_day_id_position_key deferred;

  update public.routine_exercises
  set position = (ordered.ordinality - 1)::smallint
  from unnest(ordered_routine_exercise_ids) with ordinality as ordered(id, ordinality)
  where routine_exercises.id = ordered.id
    and routine_exercises.routine_day_id = target_day_id;
end;
$$;

revoke all on function public.activate_routine(uuid) from public, anon;
revoke all on function public.append_routine_day(uuid, text) from public, anon;
revoke all on function public.duplicate_routine_day(uuid) from public, anon;
revoke all on function public.reorder_routine_days(uuid, uuid[]) from public, anon;
revoke all on function public.append_routine_exercise(
  uuid,
  uuid,
  smallint,
  smallint,
  smallint,
  smallint,
  smallint
) from public, anon;
revoke all on function public.reorder_routine_exercises(uuid, uuid[]) from public, anon;

grant execute on function public.activate_routine(uuid) to authenticated;
grant execute on function public.append_routine_day(uuid, text) to authenticated;
grant execute on function public.duplicate_routine_day(uuid) to authenticated;
grant execute on function public.reorder_routine_days(uuid, uuid[]) to authenticated;
grant execute on function public.append_routine_exercise(
  uuid,
  uuid,
  smallint,
  smallint,
  smallint,
  smallint,
  smallint
) to authenticated;
grant execute on function public.reorder_routine_exercises(uuid, uuid[]) to authenticated;

grant insert (target_rir) on public.routine_exercises to authenticated;
grant update (target_rir) on public.routine_exercises to authenticated;

comment on column public.routine_exercises.target_rir is
  'Optional planned repetitions in reserve from 0 to 5; completed RIR belongs to workout_sets.';
comment on function public.activate_routine(uuid) is
  'Atomically activates one owned, non-archived routine and deactivates the previous one.';
comment on function public.duplicate_routine_day(uuid) is
  'Atomically copies an owned routine day and all of its exercise prescriptions.';
