begin;

create extension if not exists pgtap with schema extensions;

select plan(54);

create temporary table routine_rls_context (
  routine_id uuid not null,
  day_id uuid not null,
  workout_session_id uuid,
  workout_exercise_id uuid,
  workout_set_id uuid
);
grant select, insert, update on routine_rls_context to authenticated;

insert into auth.users (id, email)
values
  ('11111111-1111-4111-8111-111111111111', 'gymbro-user-one@example.test'),
  ('22222222-2222-4222-8222-222222222222', 'gymbro-user-two@example.test');

set local role authenticated;
set local request.jwt.claim.sub = '11111111-1111-4111-8111-111111111111';

select is((select count(*) from public.profiles), 1::bigint, 'user one sees one profile');

select is(
  (select count(*) from public.muscle_groups),
  7::bigint,
  'authenticated users read the macro group catalog'
);

select is(
  (select count(*) from public.muscles),
  26::bigint,
  'authenticated users read the specific muscle catalog'
);

select is(
  (select count(*) from public.exercises where not is_custom),
  73::bigint,
  'authenticated users read the official exercise catalog'
);

select is(
  (select count(*) from public.equipment),
  14::bigint,
  'authenticated users read the equipment catalog'
);

select is(
  (select count(*) from public.exercise_equipment),
  95::bigint,
  'authenticated users read official equipment relationships'
);

select throws_ok(
  $$insert into public.muscle_groups (name, slug) values ('Unauthorized', 'unauthorized')$$,
  '42501',
  null,
  'authenticated users cannot insert muscle macro groups'
);

select throws_ok(
  $$update public.muscles set name = 'Unauthorized' where slug = 'upper-chest'$$,
  '42501',
  null,
  'authenticated users cannot update specific muscles'
);

select throws_ok(
  $$delete from public.muscles where slug = 'upper-chest'$$,
  '42501',
  null,
  'authenticated users cannot delete specific muscles'
);

select throws_ok(
  $$insert into public.equipment (name, slug) values ('Unauthorized', 'unauthorized')$$,
  '42501',
  null,
  'authenticated users cannot insert equipment'
);

select throws_ok(
  $$update public.equipment set name = 'Unauthorized' where slug = 'barbell'$$,
  '42501',
  null,
  'authenticated users cannot update equipment'
);

select throws_ok(
  $$delete from public.equipment where slug = 'barbell'$$,
  '42501',
  null,
  'authenticated users cannot delete equipment'
);

select throws_ok(
  $$update public.exercises set name = 'Unauthorized' where slug = 'barbell-bench-press'$$,
  '42501',
  null,
  'authenticated users cannot update official exercises'
);

update public.profiles
set display_name = 'User One'
where id = '11111111-1111-4111-8111-111111111111';

select is(
  (select display_name from public.profiles),
  'User One',
  'user one updates their profile'
);

insert into public.routines (user_id, name, goal)
values ('11111111-1111-4111-8111-111111111111', 'Routine One', 'strength');

select is((select count(*) from public.routines), 1::bigint, 'user one creates a routine');
select is(
  (select name from public.routines),
  'Routine One',
  'user one reads their routine'
);

select lives_ok(
  $$
    select public.append_routine_day(
      (select id from public.routines where name = 'Routine One'),
      'Push A'
    )
  $$,
  'user one appends a routine day'
);

select is(
  (select count(*) from public.routine_days),
  1::bigint,
  'user one reads the appended day'
);

select lives_ok(
  $$
    select public.append_routine_exercise(
      (select id from public.routine_days where name = 'Push A'),
      (select id from public.exercises where slug = 'barbell-bench-press'),
      4::smallint,
      8::smallint,
      10::smallint,
      120::smallint,
      2::smallint
    )
  $$,
  'user one appends an official exercise prescription'
);

select is(
  (select target_rir from public.routine_exercises),
  2::smallint,
  'routine exercise stores optional target RIR'
);

select throws_ok(
  $$
    select public.append_routine_exercise(
      (select id from public.routine_days where name = 'Push A'),
      (select id from public.exercises where slug = 'barbell-bench-press'),
      3::smallint,
      8::smallint,
      12::smallint,
      90::smallint,
      null
    )
  $$,
  '23505',
  null,
  'the same exercise cannot be added twice to one day'
);

select lives_ok(
  $$
    select public.duplicate_routine_day(
      (select id from public.routine_days where name = 'Push A')
    )
  $$,
  'user one duplicates a day transactionally'
);

select is(
  (select count(*) from public.routine_days),
  2::bigint,
  'day duplication creates exactly one additional day'
);

select is(
  (select count(*) from public.routine_exercises),
  2::bigint,
  'day duplication copies every exercise prescription'
);

select lives_ok(
  $$
    select public.reorder_routine_days(
      (select id from public.routines where name = 'Routine One'),
      array(select id from public.routine_days order by position desc)
    )
  $$,
  'user one reorders every routine day atomically'
);

select lives_ok(
  $$
    select public.activate_routine(
      (select id from public.routines where name = 'Routine One')
    )
  $$,
  'user one activates their routine atomically'
);

select ok(
  (select is_active from public.routines where name = 'Routine One'),
  'the selected routine is active'
);

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
where name = 'Routine One';

select lives_ok(
  $$
    update routine_rls_context
    set workout_session_id = public.start_workout(day_id)
  $$,
  'user one starts an owned workout atomically'
);

set constraints all immediate;
set constraints all deferred;

select is(
  (
    select public.start_workout(day_id)
    from routine_rls_context
  ),
  (select workout_session_id from routine_rls_context),
  'starting twice resumes the same workout session'
);

select is(
  (
    select count(*)
    from public.workout_exercises
    where workout_session_id = (
      select workout_session_id from routine_rls_context
    )
  ),
  1::bigint,
  'workout start captures every day exercise once'
);

update routine_rls_context
set workout_exercise_id = (
  select id
  from public.workout_exercises
  where workout_session_id = routine_rls_context.workout_session_id
  order by position
  limit 1
);

select is(
  (
    select target_rir
    from public.workout_exercises
    where id = (select workout_exercise_id from routine_rls_context)
  ),
  2::smallint,
  'workout snapshot preserves target RIR'
);

select lives_ok(
  $$
    update routine_rls_context
    set workout_set_id = result.workout_set_id
    from public.complete_workout_set(
      workout_exercise_id,
      1::smallint,
      80.5,
      9::smallint,
      null::smallint,
      'working'::public.workout_set_type
    ) as result
  $$,
  'user one completes a workout set'
);

select is(
  (select count(*) from public.workout_sets),
  1::bigint,
  'one completed action creates one set'
);

select lives_ok(
  $$
    select public.complete_workout_set(
      (select workout_exercise_id from routine_rls_context),
      1::smallint,
      90,
      10::smallint,
      null::smallint,
      'working'::public.workout_set_type
    )
  $$,
  'repeating a completed set request is safe'
);

select is(
  (select count(*) from public.workout_sets),
  1::bigint,
  'idempotent completion does not duplicate the set'
);

select ok(
  (
    select rest_ends_at > now()
    from public.workout_sessions
    where id = (select workout_session_id from routine_rls_context)
  ),
  'completing a set persists a future rest deadline'
);

select lives_ok(
  $$
    select public.extend_workout_rest(
      (select workout_session_id from routine_rls_context),
      15::smallint
    )
  $$,
  'user one extends active rest'
);

select lives_ok(
  $$
    select public.skip_workout_rest(
      (select workout_session_id from routine_rls_context)
    )
  $$,
  'user one skips active rest'
);

select is(
  (
    select rest_ends_at
    from public.workout_sessions
    where id = (select workout_session_id from routine_rls_context)
  ),
  null::timestamptz,
  'skipping rest clears the persisted deadline'
);

reset role;
set local role authenticated;
set local request.jwt.claim.sub = '22222222-2222-4222-8222-222222222222';

select is((select count(*) from public.profiles), 1::bigint, 'user two sees one profile');
select is((select count(*) from public.routines), 0::bigint, 'user two cannot see user one routine');
select is(
  (select count(*) from public.workout_sessions),
  0::bigint,
  'user two cannot read user one workout session'
);
select is(
  (select count(*) from public.workout_sets),
  0::bigint,
  'user two cannot read user one workout sets'
);

select throws_ok(
  $$
    select public.finish_workout(
      (select workout_session_id from routine_rls_context)
    )
  $$,
  '42501',
  null,
  'user two cannot finish user one workout'
);

select throws_ok(
  $$
    select public.complete_workout_set(
      (select workout_exercise_id from routine_rls_context),
      2::smallint,
      80,
      8::smallint,
      null::smallint,
      'working'::public.workout_set_type
    )
  $$,
  '42501',
  null,
  'user two cannot add sets to user one workout'
);

select throws_ok(
  $$
    select public.append_routine_day(
      (select routine_id from routine_rls_context),
      'Unauthorized day'
    )
  $$,
  '42501',
  null,
  'user two cannot append a day to user one routine'
);

select throws_ok(
  $$
    select public.append_routine_exercise(
      (select day_id from routine_rls_context),
      (select id from public.exercises where slug = 'front-plank'),
      3::smallint,
      10::smallint,
      12::smallint,
      60::smallint,
      null
    )
  $$,
  '42501',
  null,
  'user two cannot append an exercise to user one day'
);

select is(
  (
    with updated as (
      update public.routines
      set name = 'Unauthorized update'
      where id = (select routine_id from routine_rls_context)
      returning id
    )
    select count(*) from updated
  ),
  0::bigint,
  'user two cannot update user one routine'
);

select is(
  (
    with deleted as (
      delete from public.routine_days
      where id = (select day_id from routine_rls_context)
      returning id
    )
    select count(*) from deleted
  ),
  0::bigint,
  'user two cannot delete user one day'
);

insert into public.routines (user_id, name, goal)
values ('22222222-2222-4222-8222-222222222222', 'Routine Two', 'muscle_gain');

select is((select count(*) from public.routines), 1::bigint, 'user two creates a routine');
select is(
  (select name from public.routines),
  'Routine Two',
  'user two only reads their routine'
);

reset role;
set local role authenticated;
set local request.jwt.claim.sub = '11111111-1111-4111-8111-111111111111';

select lives_ok(
  $$
    select public.finish_workout(
      (select workout_session_id from routine_rls_context)
    )
  $$,
  'user one finishes their active workout'
);

select is(
  (
    select status
    from public.workout_sessions
    where id = (select workout_session_id from routine_rls_context)
  ),
  'completed'::public.workout_status,
  'finished workout becomes completed'
);

select throws_ok(
  $$
    select public.complete_workout_set(
      (select workout_exercise_id from routine_rls_context),
      2::smallint,
      80,
      8::smallint,
      null::smallint,
      'working'::public.workout_set_type
    )
  $$,
  '42501',
  null,
  'completed workout rejects ordinary sets'
);

reset role;
select * from finish();
rollback;
