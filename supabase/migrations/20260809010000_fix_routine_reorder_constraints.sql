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

  set constraints public.routine_days_routine_id_position_key deferred;

  update public.routine_days
  set position = (ordered.ordinality - 1)::smallint
  from unnest(ordered_day_ids) with ordinality as ordered(id, ordinality)
  where routine_days.id = ordered.id
    and routine_days.routine_id = target_routine_id;
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

  set constraints public.routine_exercises_routine_day_id_position_key deferred;

  update public.routine_exercises
  set position = (ordered.ordinality - 1)::smallint
  from unnest(ordered_routine_exercise_ids) with ordinality as ordered(id, ordinality)
  where routine_exercises.id = ordered.id
    and routine_exercises.routine_day_id = target_day_id;
end;
$$;

comment on function public.reorder_routine_days(uuid, uuid[]) is
  'Atomically assigns a complete owned routine day order using a deferred unique constraint.';
comment on function public.reorder_routine_exercises(uuid, uuid[]) is
  'Atomically assigns a complete owned day exercise order using a deferred unique constraint.';

