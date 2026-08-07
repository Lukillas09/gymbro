begin;

create extension if not exists pgtap with schema extensions;

select plan(41);

select has_table('public', 'profiles');
select has_table('public', 'muscle_groups');
select has_table('public', 'muscles');
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
select ok((select relrowsecurity from pg_class where oid = 'public.muscles'::regclass));
select ok((select relrowsecurity from pg_class where oid = 'public.exercises'::regclass));
select ok((select relrowsecurity from pg_class where oid = 'public.exercise_muscles'::regclass));
select ok((select relrowsecurity from pg_class where oid = 'public.routines'::regclass));
select ok((select relrowsecurity from pg_class where oid = 'public.routine_days'::regclass));
select ok((select relrowsecurity from pg_class where oid = 'public.routine_exercises'::regclass));
select ok((select relrowsecurity from pg_class where oid = 'public.workout_sessions'::regclass));
select ok((select relrowsecurity from pg_class where oid = 'public.workout_exercises'::regclass));
select ok((select relrowsecurity from pg_class where oid = 'public.workout_sets'::regclass));

select is(
  (select count(*) from public.muscle_groups),
  7::bigint,
  'seed includes exactly seven muscle macro groups'
);

select is(
  (
    select count(*)
    from public.muscle_groups
    where slug in (
      'chest',
      'back',
      'abdomen',
      'triceps',
      'biceps',
      'shoulders',
      'legs'
    )
  ),
  7::bigint,
  'seed includes every expected muscle macro group'
);

select is(
  (select count(*) from public.muscles),
  26::bigint,
  'seed includes exactly 26 specific muscles'
);

select is(
  (
    select count(*)
    from public.muscles
    where slug in (
      'upper-chest',
      'mid-chest',
      'lower-chest',
      'lats',
      'trapezius',
      'rhomboids',
      'spinal-erectors',
      'rectus-abdominis',
      'obliques',
      'transverse-abdominis',
      'triceps-long-head',
      'triceps-lateral-head',
      'triceps-medial-head',
      'biceps-long-head',
      'biceps-short-head',
      'brachialis',
      'forearms',
      'anterior-deltoid',
      'lateral-deltoid',
      'posterior-deltoid',
      'quadriceps',
      'hamstrings',
      'glutes',
      'adductors',
      'abductors',
      'calves'
    )
  ),
  26::bigint,
  'seed includes every expected specific muscle'
);

select is(
  (
    select count(*)
    from public.muscles
    left join public.muscle_groups
      on muscle_groups.id = muscles.muscle_group_id
    where muscle_groups.id is null
  ),
  0::bigint,
  'specific muscles cannot be orphaned'
);

select is(
  (select count(*) from public.muscle_groups),
  (select count(distinct slug) from public.muscle_groups),
  'muscle macro group slugs are unique'
);

select is(
  (select count(*) from public.muscles),
  (select count(distinct slug) from public.muscles),
  'specific muscle slugs are unique'
);

select has_column('public', 'exercise_muscles', 'muscle_id');

select ok(
  not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'exercise_muscles'
      and column_name = 'muscle_group_id'
  ),
  'exercise_muscles does not duplicate the macro group reference'
);

select ok(
  exists (
    select 1
    from pg_constraint
    where conrelid = 'public.exercise_muscles'::regclass
      and confrelid = 'public.muscles'::regclass
      and contype = 'f'
      and pg_get_constraintdef(oid) like 'FOREIGN KEY (muscle_id)%'
  ),
  'exercise_muscles references specific muscles'
);

select is(
  (
    select count(*)
    from (
      select exercise_id, muscle_id
      from public.exercise_muscles
      group by exercise_id, muscle_id
      having count(*) > 1
    ) as duplicates
  ),
  0::bigint,
  'exercise muscle relationships are not duplicated'
);

select ok(
  exists (
    select 1
    from pg_constraint
    where conrelid = 'public.exercise_muscles'::regclass
      and contype = 'p'
      and pg_get_constraintdef(oid) = 'PRIMARY KEY (exercise_id, muscle_id)'
  ),
  'exercise_muscles primary key prevents duplicate relationships'
);

select ok(
  exists (
    select 1 from pg_indexes
    where schemaname = 'public'
      and indexname = 'muscles_muscle_group_id_idx'
  ),
  'specific muscles can be looked up by macro group'
);

select ok(
  exists (
    select 1 from pg_indexes
    where schemaname = 'public'
      and indexname = 'exercise_muscles_muscle_idx'
  ),
  'exercise relationships can be looked up by specific muscle'
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

select ok(
  exists (
    select 1
    from pg_trigger
    where tgname = 'muscles_set_updated_at'
      and not tgisinternal
  ),
  'specific muscle update trigger exists'
);

select is(
  (select count(*) from pg_policies where schemaname = 'public'),
  36::bigint,
  'all MVP RLS policies exist'
);

select * from finish();
rollback;
