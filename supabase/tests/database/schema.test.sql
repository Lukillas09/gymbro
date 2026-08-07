begin;

create extension if not exists pgtap with schema extensions;

select plan(111);

select has_table('public', 'profiles');
select has_table('public', 'muscle_groups');
select has_table('public', 'muscles');
select has_table('public', 'exercises');
select has_table('public', 'exercise_muscles');
select has_table('public', 'equipment');
select has_table('public', 'exercise_equipment');
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
select ok((select relrowsecurity from pg_class where oid = 'public.equipment'::regclass));
select ok((select relrowsecurity from pg_class where oid = 'public.exercise_equipment'::regclass));
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
    select 1
    from pg_type
    join pg_namespace on pg_namespace.oid = pg_type.typnamespace
    where pg_namespace.nspname = 'public'
      and pg_type.typname = 'movement_pattern'
  ),
  'movement pattern enum exists'
);

select has_column('public', 'exercises', 'movement_pattern');
select has_column('public', 'exercises', 'instructions');
select has_column('public', 'exercises', 'common_mistakes');

select is(
  (
    select count(*)
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'exercises'
      and column_name in ('instructions', 'common_mistakes')
      and data_type = 'ARRAY'
      and udt_name = '_text'
  ),
  2::bigint,
  'instructions and mistakes use text arrays'
);

select is(
  (select count(*) from public.equipment),
  14::bigint,
  'seed includes exactly 14 equipment items'
);

select is(
  (select count(*) from public.exercises where not is_custom),
  73::bigint,
  'seed includes exactly 73 official exercises'
);

select is(
  (select count(*) from public.exercise_muscles),
  211::bigint,
  'seed includes every curated muscle relationship'
);

select is(
  (select count(*) from public.exercise_equipment),
  95::bigint,
  'seed includes every curated equipment relationship'
);

select is(
  (
    select count(*)
    from public.exercises
    where not is_custom
      and not exists (
        select 1
        from public.exercise_muscles
        where exercise_muscles.exercise_id = exercises.id
          and involvement_type = 'primary'
      )
  ),
  0::bigint,
  'every official exercise has a primary muscle'
);

select is(
  (
    select count(*)
    from public.exercises
    where not is_custom
      and not exists (
        select 1
        from public.exercise_equipment
        where exercise_equipment.exercise_id = exercises.id
      )
  ),
  0::bigint,
  'every official exercise has equipment'
);

select is(
  (
    select count(*)
    from public.exercises
    where not is_custom
      and (
        description is null
        or movement_pattern is null
        or cardinality(instructions) = 0
        or cardinality(common_mistakes) = 0
      )
  ),
  0::bigint,
  'official exercise content is complete'
);

select is(
  (select count(*) from public.equipment),
  (select count(distinct slug) from public.equipment),
  'equipment slugs are unique'
);

select is(
  (
    select count(*)
    from public.exercise_muscles
    left join public.exercises
      on exercises.id = exercise_muscles.exercise_id
    left join public.muscles
      on muscles.id = exercise_muscles.muscle_id
    where exercises.id is null or muscles.id is null
  ),
  0::bigint,
  'exercise muscle relationships are valid'
);

select is(
  (
    select count(*)
    from public.exercise_equipment
    left join public.exercises
      on exercises.id = exercise_equipment.exercise_id
    left join public.equipment
      on equipment.id = exercise_equipment.equipment_id
    where exercises.id is null or equipment.id is null
  ),
  0::bigint,
  'exercise equipment relationships are valid'
);

select is(
  (
    select count(*)
    from (
      select exercise_id, equipment_id
      from public.exercise_equipment
      group by exercise_id, equipment_id
      having count(*) > 1
    ) as duplicates
  ),
  0::bigint,
  'exercise equipment relationships are not duplicated'
);

select ok(
  exists (
    select 1
    from pg_constraint
    where conrelid = 'public.exercise_equipment'::regclass
      and contype = 'p'
      and pg_get_constraintdef(oid) = 'PRIMARY KEY (exercise_id, equipment_id)'
  ),
  'exercise_equipment has the expected primary key'
);

select ok(
  exists (
    select 1
    from pg_constraint
    where conrelid = 'public.exercise_equipment'::regclass
      and confrelid = 'public.exercises'::regclass
      and contype = 'f'
  ),
  'exercise_equipment references exercises'
);

select ok(
  exists (
    select 1
    from pg_constraint
    where conrelid = 'public.exercise_equipment'::regclass
      and confrelid = 'public.equipment'::regclass
      and contype = 'f'
  ),
  'exercise_equipment references equipment'
);

select ok(
  exists (
    select 1 from pg_indexes
    where schemaname = 'public'
      and indexname = 'exercises_movement_pattern_idx'
  ),
  'official exercises can be looked up by movement pattern'
);

select ok(
  exists (
    select 1 from pg_indexes
    where schemaname = 'public'
      and indexname = 'exercise_equipment_equipment_idx'
  ),
  'exercise equipment can be looked up by equipment'
);

select ok(
  exists (
    select 1 from pg_indexes
    where schemaname = 'public'
      and indexname = 'routines_one_active_per_user_idx'
  ),
  'one active routine index exists'
);

select has_column('public', 'routine_exercises', 'target_rir');

select ok(
  exists (
    select 1
    from pg_constraint
    where conrelid = 'public.routine_exercises'::regclass
      and conname = 'routine_exercises_target_rir_range'
      and contype = 'c'
  ),
  'routine exercise target RIR has a database check'
);

select ok(
  exists (
    select 1
    from pg_constraint
    where conrelid = 'public.routine_exercises'::regclass
      and conname = 'routine_exercises_day_exercise_unique'
      and contype = 'u'
  ),
  'an exercise cannot be repeated within one routine day'
);

select ok(
  exists (
    select 1
    from pg_constraint
    where conrelid = 'public.routine_days'::regclass
      and conname = 'routine_days_routine_id_position_key'
      and condeferrable
  ),
  'routine day position uniqueness can be deferred for atomic reorder'
);

select ok(
  exists (
    select 1
    from pg_constraint
    where conrelid = 'public.routine_exercises'::regclass
      and conname = 'routine_exercises_routine_day_id_position_key'
      and condeferrable
  ),
  'routine exercise position uniqueness can be deferred for atomic reorder'
);

select has_function('public', 'activate_routine', array['uuid']);
select has_function('public', 'append_routine_day', array['uuid', 'text']);
select has_function('public', 'duplicate_routine_day', array['uuid']);
select has_function('public', 'reorder_routine_days', array['uuid', 'uuid[]']);
select has_function(
  'public',
  'append_routine_exercise',
  array['uuid', 'uuid', 'smallint', 'smallint', 'smallint', 'smallint', 'smallint']
);
select has_function(
  'public',
  'reorder_routine_exercises',
  array['uuid', 'uuid[]']
);

select is(
  (
    select count(*)
    from pg_proc
    join pg_namespace on pg_namespace.oid = pg_proc.pronamespace
    where pg_namespace.nspname = 'public'
      and pg_proc.proname in (
        'activate_routine',
        'append_routine_day',
        'duplicate_routine_day',
        'reorder_routine_days',
        'append_routine_exercise',
        'reorder_routine_exercises'
      )
      and not pg_proc.prosecdef
  ),
  6::bigint,
  'routine mutation functions use security invoker'
);

select ok(
  has_function_privilege(
    'authenticated',
    'public.activate_routine(uuid)',
    'EXECUTE'
  )
  and has_function_privilege(
    'authenticated',
    'public.duplicate_routine_day(uuid)',
    'EXECUTE'
  ),
  'authenticated users can execute protected routine operations'
);

select ok(
  exists (
    select 1 from pg_indexes
    where schemaname = 'public'
      and indexname = 'workout_sessions_one_in_progress_per_user_idx'
  ),
  'one active workout index exists'
);

select has_column('public', 'workout_sessions', 'routine_name_snapshot');
select has_column('public', 'workout_sessions', 'routine_day_name_snapshot');
select has_column('public', 'workout_sessions', 'snapshot_locked_at');
select has_column('public', 'workout_sessions', 'active_workout_exercise_id');
select has_column('public', 'workout_sessions', 'rest_ends_at');
select has_column('public', 'workout_sessions', 'rest_source_set_id');
select has_column('public', 'workout_exercises', 'target_rir');
select has_column('public', 'workout_exercises', 'exercise_name_snapshot');
select col_not_null('public', 'workout_sets', 'completed_at');

select ok(
  exists (
    select 1
    from pg_constraint
    where conrelid = 'public.workout_sessions'::regclass
      and conname = 'workout_sessions_active_exercise_fk'
      and contype = 'f'
  ),
  'active workout exercise uses a foreign key'
);

select ok(
  exists (
    select 1
    from pg_constraint
    where conrelid = 'public.workout_sessions'::regclass
      and conname = 'workout_sessions_rest_source_set_fk'
      and contype = 'f'
  ),
  'rest source uses a workout set foreign key'
);

select ok(
  exists (
    select 1
    from pg_constraint
    where conrelid = 'public.workout_exercises'::regclass
      and conname = 'workout_exercises_target_rir_range'
      and contype = 'c'
  ),
  'workout snapshot target RIR has a database check'
);

select ok(
  exists (
    select 1
    from pg_constraint
    where conrelid = 'public.workout_sessions'::regclass
      and conname = 'workout_sessions_rest_state_consistency'
      and contype = 'c'
  ),
  'rest deadline and source set remain consistent'
);

select ok(
  exists (
    select 1
    from pg_trigger
    where tgname = 'workout_sessions_validate_snapshot'
      and not tgisinternal
  ),
  'workout session snapshot integrity trigger exists'
);

select ok(
  exists (
    select 1
    from pg_trigger
    where tgname = 'workout_exercises_validate_session'
      and not tgisinternal
  ),
  'workout exercise snapshot integrity trigger exists'
);

select ok(
  exists (
    select 1 from pg_indexes
    where schemaname = 'public'
      and indexname = 'workout_exercises_session_exercise_idx'
  ),
  'workout snapshots can be looked up by session and exercise'
);

select ok(
  exists (
    select 1 from pg_indexes
    where schemaname = 'public'
      and indexname = 'workout_sets_exercise_completed_idx'
  ),
  'completed sets can be looked up chronologically by workout exercise'
);

select has_function('public', 'start_workout', array['uuid']);
select has_function(
  'public',
  'complete_workout_set',
  array['uuid', 'smallint', 'numeric', 'smallint', 'smallint', 'workout_set_type']
);
select has_function('public', 'undo_last_workout_set', array['uuid', 'uuid']);
select has_function('public', 'extend_workout_rest', array['uuid', 'smallint']);
select has_function('public', 'skip_workout_rest', array['uuid']);
select has_function('public', 'select_workout_exercise', array['uuid', 'uuid']);
select has_function('public', 'finish_workout', array['uuid']);

select is(
  (
    select count(*)
    from pg_proc
    join pg_namespace on pg_namespace.oid = pg_proc.pronamespace
    where pg_namespace.nspname = 'public'
      and pg_proc.proname in (
        'start_workout',
        'complete_workout_set',
        'undo_last_workout_set',
        'extend_workout_rest',
        'skip_workout_rest',
        'select_workout_exercise',
        'finish_workout'
      )
      and not pg_proc.prosecdef
  ),
  7::bigint,
  'workout mutation functions use security invoker'
);

select is(
  (
    select count(*)
    from pg_proc
    join pg_namespace on pg_namespace.oid = pg_proc.pronamespace
    where pg_namespace.nspname = 'private'
      and pg_proc.proname in (
        'check_workout_session_integrity',
        'check_workout_exercise_session_integrity'
      )
      and pg_proc.prosecdef
      and pg_proc.proconfig @> array['search_path=""']
  ),
  2::bigint,
  'private deferred trigger wrappers have a locked search path'
);

select ok(
  has_function_privilege('authenticated', 'public.start_workout(uuid)', 'EXECUTE')
  and has_function_privilege(
    'authenticated',
    'public.complete_workout_set(uuid,smallint,numeric,smallint,smallint,public.workout_set_type)',
    'EXECUTE'
  )
  and has_function_privilege('authenticated', 'public.finish_workout(uuid)', 'EXECUTE'),
  'authenticated users can execute protected workout operations'
);

select ok(
  not has_function_privilege('anon', 'public.start_workout(uuid)', 'EXECUTE')
  and not has_function_privilege(
    'anon',
    'public.complete_workout_set(uuid,smallint,numeric,smallint,smallint,public.workout_set_type)',
    'EXECUTE'
  ),
  'anonymous users cannot execute workout operations'
);

select ok(
  not has_table_privilege('authenticated', 'public.workout_exercises', 'UPDATE')
  and not has_table_privilege('authenticated', 'public.workout_sessions', 'DELETE')
  and not has_table_privilege('authenticated', 'public.workout_sets', 'UPDATE'),
  'authenticated users cannot mutate locked snapshots or historical results directly'
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

select ok(
  exists (
    select 1
    from pg_trigger
    where tgname = 'equipment_set_updated_at'
      and not tgisinternal
  ),
  'equipment update trigger exists'
);

select ok(
  exists (
    select 1
    from pg_trigger
    where tgname = 'exercises_require_primary_muscle'
      and not tgisinternal
  ),
  'official exercise primary muscle trigger exists'
);

select ok(
  exists (
    select 1
    from pg_trigger
    where tgname = 'exercises_require_equipment'
      and not tgisinternal
  ),
  'official exercise equipment trigger exists'
);

select is(
  (select count(*) from pg_policies where schemaname = 'public'),
  39::bigint,
  'all MVP RLS policies exist'
);

select * from finish();
rollback;
