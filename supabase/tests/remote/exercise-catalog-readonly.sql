select json_build_object(
  'official_exercises', (select count(*) from public.exercises where not is_custom),
  'custom_exercises', (select count(*) from public.exercises where is_custom),
  'equipment', (select count(*) from public.equipment),
  'exercise_muscles', (select count(*) from public.exercise_muscles),
  'exercise_equipment', (select count(*) from public.exercise_equipment),
  'without_primary', (
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
  'without_equipment', (
    select count(*)
    from public.exercises
    where not is_custom
      and not exists (
        select 1
        from public.exercise_equipment
        where exercise_equipment.exercise_id = exercises.id
      )
  ),
  'incomplete_content', (
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
  'duplicate_official_slugs', (
    select count(*)
    from (
      select slug
      from public.exercises
      where not is_custom
      group by slug
      having count(*) > 1
    ) as duplicates
  ),
  'duplicate_equipment_slugs', (
    select count(*)
    from (
      select slug
      from public.equipment
      group by slug
      having count(*) > 1
    ) as duplicates
  ),
  'duplicate_muscle_relations', (
    select count(*)
    from (
      select exercise_id, muscle_id
      from public.exercise_muscles
      group by exercise_id, muscle_id
      having count(*) > 1
    ) as duplicates
  ),
  'duplicate_equipment_relations', (
    select count(*)
    from (
      select exercise_id, equipment_id
      from public.exercise_equipment
      group by exercise_id, equipment_id
      having count(*) > 1
    ) as duplicates
  ),
  'orphan_muscle_relations', (
    select count(*)
    from public.exercise_muscles
    left join public.exercises
      on exercises.id = exercise_muscles.exercise_id
    left join public.muscles
      on muscles.id = exercise_muscles.muscle_id
    where exercises.id is null or muscles.id is null
  ),
  'orphan_equipment_relations', (
    select count(*)
    from public.exercise_equipment
    left join public.exercises
      on exercises.id = exercise_equipment.exercise_id
    left join public.equipment
      on equipment.id = exercise_equipment.equipment_id
    where exercises.id is null or equipment.id is null
  ),
  'coverage', (
    select json_object_agg(slug, exercise_count order by slug)
    from (
      select muscle_groups.slug, count(distinct exercises.id) as exercise_count
      from public.muscle_groups
      left join public.muscles
        on muscles.muscle_group_id = muscle_groups.id
      left join public.exercise_muscles
        on exercise_muscles.muscle_id = muscles.id
        and exercise_muscles.involvement_type = 'primary'
      left join public.exercises
        on exercises.id = exercise_muscles.exercise_id
        and not exercises.is_custom
      group by muscle_groups.slug
    ) as coverage
  ),
  'rls', (
    select json_object_agg(relname, relrowsecurity order by relname)
    from pg_class
    where oid in (
      'public.exercises'::regclass,
      'public.exercise_muscles'::regclass,
      'public.equipment'::regclass,
      'public.exercise_equipment'::regclass
    )
  ),
  'catalog_policy_count', (
    select count(*)
    from pg_policies
    where schemaname = 'public'
      and tablename in (
        'exercises',
        'exercise_muscles',
        'equipment',
        'exercise_equipment'
      )
  )
) as verification;
