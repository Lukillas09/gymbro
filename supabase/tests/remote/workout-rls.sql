begin;

create temporary table workout_rls_context (
  routine_id uuid,
  routine_day_id uuid,
  workout_session_id uuid,
  first_workout_exercise_id uuid,
  second_workout_exercise_id uuid,
  first_workout_set_id uuid,
  initial_rest_ends_at timestamptz
);
grant select, insert, update on workout_rls_context to authenticated;

insert into auth.users (id, email)
values
  ('33333333-3333-4333-8333-333333333333', 'gymbro-workout-a@example.test'),
  ('44444444-4444-4444-8444-444444444444', 'gymbro-workout-b@example.test');

set local role authenticated;
set local request.jwt.claim.sub = '33333333-3333-4333-8333-333333333333';

with created_routine as (
  insert into public.routines (user_id, name, goal, is_active)
  values (
    '33333333-3333-4333-8333-333333333333',
    'Workout RLS Routine',
    'muscle_gain',
    true
  )
  returning id
)
insert into workout_rls_context (routine_id)
select id from created_routine;

with created_day as (
  insert into public.routine_days (routine_id, name, position)
  select routine_id, 'Push snapshot', 0 from workout_rls_context
  returning id
)
update workout_rls_context
set routine_day_id = created_day.id
from created_day;

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
values
  (
    (select routine_day_id from workout_rls_context),
    (select id from public.exercises where slug = 'barbell-bench-press'),
    0,
    3,
    8,
    10,
    90,
    2
  ),
  (
    (select routine_day_id from workout_rls_context),
    (select id from public.exercises where slug = 'front-plank'),
    1,
    2,
    10,
    12,
    60,
    null
  );

update workout_rls_context
set workout_session_id = public.start_workout(routine_day_id);

do $$
declare
  resumed_session_id uuid;
begin
  select public.start_workout(routine_day_id)
  into resumed_session_id
  from workout_rls_context;

  if resumed_session_id <> (select workout_session_id from workout_rls_context) then
    raise exception 'start_workout was not idempotent';
  end if;
end;
$$;

set constraints all immediate;
set constraints all deferred;

update workout_rls_context
set
  first_workout_exercise_id = (
    select id
    from public.workout_exercises
    where workout_session_id = workout_rls_context.workout_session_id
    order by position
    limit 1
  ),
  second_workout_exercise_id = (
    select id
    from public.workout_exercises
    where workout_session_id = workout_rls_context.workout_session_id
    order by position
    offset 1
    limit 1
  );

do $$
begin
  if (
    select count(*)
    from public.workout_exercises
    where workout_session_id = (select workout_session_id from workout_rls_context)
  ) <> 2 then
    raise exception 'workout snapshot exercise count is incorrect';
  end if;

  if exists (
    select 1
    from public.workout_exercises
    where workout_session_id = (select workout_session_id from workout_rls_context)
      and (
        exercise_name_snapshot is null
        or target_sets is null
        or target_reps_min is null
        or target_reps_max is null
        or rest_seconds is null
      )
  ) then
    raise exception 'workout snapshot is incomplete';
  end if;

  if (
    select target_rir
    from public.workout_exercises
    where id = (select first_workout_exercise_id from workout_rls_context)
  ) <> 2 then
    raise exception 'target RIR was not copied to the workout snapshot';
  end if;
end;
$$;

update workout_rls_context
set first_workout_set_id = result.workout_set_id,
    initial_rest_ends_at = result.rest_ends_at
from public.complete_workout_set(
  (select first_workout_exercise_id from workout_rls_context),
  1::smallint,
  80.5,
  9::smallint,
  null::smallint,
  'working'::public.workout_set_type
) as result;

select *
from public.complete_workout_set(
  (select first_workout_exercise_id from workout_rls_context),
  1::smallint,
  90,
  10::smallint,
  null::smallint,
  'working'::public.workout_set_type
);

do $$
begin
  if (
    select count(*)
    from public.workout_sets
    where workout_exercise_id = (
      select first_workout_exercise_id from workout_rls_context
    )
      and set_number = 1
  ) <> 1 then
    raise exception 'duplicate set was created';
  end if;

  if (
    select weight_kg
    from public.workout_sets
    where id = (select first_workout_set_id from workout_rls_context)
  ) <> 80.5 then
    raise exception 'idempotent retry overwrote the original set';
  end if;
end;
$$;

select public.extend_workout_rest(
  (select workout_session_id from workout_rls_context),
  15::smallint
);

do $$
begin
  if (
    select rest_ends_at
    from public.workout_sessions
    where id = (select workout_session_id from workout_rls_context)
  ) <= (select initial_rest_ends_at from workout_rls_context) then
    raise exception 'rest extension was not persisted';
  end if;
end;
$$;

select public.skip_workout_rest(
  (select workout_session_id from workout_rls_context)
);
select public.select_workout_exercise(
  (select workout_session_id from workout_rls_context),
  (select second_workout_exercise_id from workout_rls_context)
);

reset role;
set local role authenticated;
set local request.jwt.claim.sub = '44444444-4444-4444-8444-444444444444';

do $$
begin
  if (select count(*) from public.workout_sessions) <> 0 then
    raise exception 'user B can read user A workout session';
  end if;

  if (select count(*) from public.workout_sets) <> 0 then
    raise exception 'user B can read user A workout sets';
  end if;

  begin
    perform public.finish_workout(
      (select workout_session_id from workout_rls_context)
    );
    raise exception 'user B finished user A workout';
  exception
    when sqlstate '42501' then null;
  end;

  begin
    perform public.complete_workout_set(
      (select first_workout_exercise_id from workout_rls_context),
      2::smallint,
      80,
      8::smallint,
      null::smallint,
      'working'::public.workout_set_type
    );
    raise exception 'user B inserted a set into user A workout';
  exception
    when sqlstate '42501' then null;
  end;
end;
$$;

reset role;
set local role authenticated;
set local request.jwt.claim.sub = '33333333-3333-4333-8333-333333333333';

select public.finish_workout(
  (select workout_session_id from workout_rls_context)
);
set constraints all immediate;

do $$
begin
  if not exists (
    select 1
    from public.workout_sessions
    where id = (select workout_session_id from workout_rls_context)
      and status = 'completed'
      and completed_at is not null
      and active_workout_exercise_id is null
      and rest_ends_at is null
      and rest_source_set_id is null
  ) then
    raise exception 'workout was not finalized coherently';
  end if;

  begin
    perform public.complete_workout_set(
      (select first_workout_exercise_id from workout_rls_context),
      2::smallint,
      80,
      8::smallint,
      null::smallint,
      'working'::public.workout_set_type
    );
    raise exception 'completed workout accepted an ordinary set';
  exception
    when sqlstate '42501' then null;
  end;
end;
$$;

reset role;
rollback;
