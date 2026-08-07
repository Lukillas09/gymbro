begin;

create temporary table routine_rls_context (
  routine_id uuid not null,
  day_id uuid not null
);
grant select on routine_rls_context to authenticated;

insert into auth.users (id, email)
values
  ('77777777-7777-4777-8777-777777777777', 'gymbro-routine-a@example.test'),
  ('88888888-8888-4888-8888-888888888888', 'gymbro-routine-b@example.test');

set local role authenticated;
set local request.jwt.claim.sub = '77777777-7777-4777-8777-777777777777';

insert into public.routines (user_id, name, goal)
values
  ('77777777-7777-4777-8777-777777777777', 'Remote Routine A1', 'strength'),
  ('77777777-7777-4777-8777-777777777777', 'Remote Routine A2', 'muscle_gain');

select public.activate_routine(
  (select id from public.routines where name = 'Remote Routine A1')
);
select public.activate_routine(
  (select id from public.routines where name = 'Remote Routine A2')
);

select public.append_routine_day(
  (select id from public.routines where name = 'Remote Routine A2'),
  'Push A'
);

select public.append_routine_exercise(
  (select id from public.routine_days where name = 'Push A'),
  (select id from public.exercises where slug = 'barbell-bench-press'),
  4::smallint,
  8::smallint,
  10::smallint,
  120::smallint,
  2::smallint
);

select public.append_routine_exercise(
  (select id from public.routine_days where name = 'Push A'),
  (select id from public.exercises where slug = 'front-plank'),
  3::smallint,
  30::smallint,
  45::smallint,
  60::smallint,
  null
);

select public.reorder_routine_exercises(
  (select id from public.routine_days where name = 'Push A'),
  array(
    select id
    from public.routine_exercises
    order by position desc
  )
);

select public.duplicate_routine_day(
  (select id from public.routine_days where name = 'Push A')
);

select public.reorder_routine_days(
  (select id from public.routines where name = 'Remote Routine A2'),
  array(select id from public.routine_days order by position desc)
);

do $$
begin
  if (select count(*) from public.routines where is_active) <> 1 then
    raise exception 'User A must have exactly one active routine';
  end if;

  if not (
    select is_active from public.routines where name = 'Remote Routine A2'
  ) then
    raise exception 'The last activated routine must be active';
  end if;

  if (select count(*) from public.routine_days) <> 2 then
    raise exception 'Day duplication must create exactly two days';
  end if;

  if (select count(*) from public.routine_exercises) <> 4 then
    raise exception 'Day duplication must copy every prescription';
  end if;

  if exists (
    select 1
    from public.routine_exercises
    where exercise_id = (
      select id from public.exercises where slug = 'barbell-bench-press'
    )
      and target_rir is distinct from 2
  ) then
    raise exception 'Day duplication must preserve target RIR';
  end if;
end;
$$;

reset role;

insert into routine_rls_context (routine_id, day_id)
select
  routines.id,
  (
    select routine_days.id
    from public.routine_days
    where routine_days.routine_id = routines.id
    order by routine_days.position
    limit 1
  )
from public.routines
where name = 'Remote Routine A2';

set local role authenticated;
set local request.jwt.claim.sub = '88888888-8888-4888-8888-888888888888';

do $$
declare
  affected_rows integer;
begin
  if exists (select 1 from public.routines) then
    raise exception 'User B must not read user A routines';
  end if;

  begin
    perform public.append_routine_day(
      (select routine_id from routine_rls_context),
      'Unauthorized day'
    );
    raise exception 'User B unexpectedly appended a day';
  exception
    when insufficient_privilege then null;
  end;

  begin
    perform public.append_routine_exercise(
      (select day_id from routine_rls_context),
      (select id from public.exercises where slug = 'front-plank'),
      3::smallint,
      10::smallint,
      12::smallint,
      60::smallint,
      null
    );
    raise exception 'User B unexpectedly appended an exercise';
  exception
    when insufficient_privilege then null;
  end;

  update public.routines
  set name = 'Unauthorized update'
  where id = (select routine_id from routine_rls_context);
  get diagnostics affected_rows = row_count;

  if affected_rows <> 0 then
    raise exception 'User B unexpectedly updated user A routine';
  end if;

  delete from public.routine_days
  where id = (select day_id from routine_rls_context);
  get diagnostics affected_rows = row_count;

  if affected_rows <> 0 then
    raise exception 'User B unexpectedly deleted user A day';
  end if;
end;
$$;

insert into public.routines (user_id, name, goal)
values (
  '88888888-8888-4888-8888-888888888888',
  'Remote Routine B',
  'general_fitness'
);

do $$
begin
  if (select count(*) from public.routines) <> 1 then
    raise exception 'User B must read exactly their own routine';
  end if;
end;
$$;

reset role;
rollback;
