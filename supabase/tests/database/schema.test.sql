begin;

create extension if not exists pgtap with schema extensions;

select plan(25);

select has_table('public', 'profiles');
select has_table('public', 'muscle_groups');
select has_table('public', 'exercises');
select has_table('public', 'exercise_muscles');
select has_table('public', 'routines');
select has_table('public', 'routine_days');
select has_table('public', 'routine_exercises');
select has_table('public', 'workout_sessions');
select has_table('public', 'workout_exercises');
select has_table('public', 'workout_sets');

select ok((select relrowsecurity from pg_class where oid = 'public.profiles'::regclass));
select ok((select relrowsecurity from pg_class where oid = 'public.muscle_groups'::regclass));
select ok((select relrowsecurity from pg_class where oid = 'public.exercises'::regclass));
select ok((select relrowsecurity from pg_class where oid = 'public.exercise_muscles'::regclass));
select ok((select relrowsecurity from pg_class where oid = 'public.routines'::regclass));
select ok((select relrowsecurity from pg_class where oid = 'public.routine_days'::regclass));
select ok((select relrowsecurity from pg_class where oid = 'public.routine_exercises'::regclass));
select ok((select relrowsecurity from pg_class where oid = 'public.workout_sessions'::regclass));
select ok((select relrowsecurity from pg_class where oid = 'public.workout_exercises'::regclass));
select ok((select relrowsecurity from pg_class where oid = 'public.workout_sets'::regclass));

select is(
  (
    select count(*)
    from public.muscle_groups
    where slug in (
      'pecho',
      'espalda',
      'hombros',
      'biceps',
      'triceps',
      'antebrazos',
      'cuadriceps',
      'isquiotibiales',
      'gluteos',
      'pantorrillas',
      'abdominales',
      'zona-lumbar'
    )
  ),
  12::bigint,
  'seed includes the initial muscle groups'
);

select ok(
  exists (
    select 1 from pg_indexes
    where schemaname = 'public'
      and indexname = 'routines_one_active_per_user_idx'
  ),
  'one active routine index exists'
);

select ok(
  exists (
    select 1 from pg_indexes
    where schemaname = 'public'
      and indexname = 'workout_sessions_one_in_progress_per_user_idx'
  ),
  'one active workout index exists'
);

select ok(
  exists (
    select 1
    from pg_trigger
    where tgname = 'on_auth_user_created'
      and not tgisinternal
  ),
  'profile creation trigger exists'
);

select is(
  (select count(*) from pg_policies where schemaname = 'public'),
  35::bigint,
  'all MVP RLS policies exist'
);

select * from finish();
rollback;
