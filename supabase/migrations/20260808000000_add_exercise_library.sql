create type public.movement_pattern as enum (
  'horizontal_push',
  'vertical_push',
  'horizontal_pull',
  'vertical_pull',
  'squat',
  'hip_hinge',
  'lunge',
  'knee_extension',
  'knee_flexion',
  'elbow_flexion',
  'elbow_extension',
  'shoulder_abduction',
  'shoulder_flexion',
  'shoulder_extension',
  'chest_fly',
  'reverse_fly',
  'hip_abduction',
  'hip_adduction',
  'calf_raise',
  'core_flexion',
  'core_rotation',
  'core_stability'
);

create table public.equipment (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint equipment_name_length check (
    char_length(btrim(name)) between 2 and 80
  ),
  constraint equipment_slug_format check (
    char_length(slug) between 2 and 80
    and slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
  )
);

create trigger equipment_set_updated_at
before update on public.equipment
for each row execute function private.set_updated_at();

do $$
begin
  if exists (select 1 from public.exercises) then
    raise exception 'Exercise library migration requires the verified empty exercise catalog';
  end if;
end;
$$;

alter table public.exercises
add column movement_pattern public.movement_pattern;

alter table public.exercises
alter column instructions type text[]
using case
  when instructions is null or btrim(instructions) = '' then '{}'::text[]
  else array[instructions]
end,
alter column instructions set default '{}'::text[],
alter column instructions set not null,
alter column common_mistakes type text[]
using case
  when common_mistakes is null or btrim(common_mistakes) = '' then '{}'::text[]
  else array[common_mistakes]
end,
alter column common_mistakes set default '{}'::text[],
alter column common_mistakes set not null;

alter table public.exercises
drop constraint exercises_equipment_length,
drop column equipment,
add constraint exercises_description_quality check (
  description is null
  or char_length(btrim(description)) between 10 and 500
),
add constraint exercises_instruction_count check (
  cardinality(instructions) between 0 and 12
),
add constraint exercises_instruction_length check (
  char_length(array_to_string(instructions, '')) <= 3000
),
add constraint exercises_mistake_count check (
  cardinality(common_mistakes) between 0 and 12
),
add constraint exercises_mistake_length check (
  char_length(array_to_string(common_mistakes, '')) <= 3000
),
add constraint exercises_official_content_complete check (
  is_custom
  or (
    description is not null
    and movement_pattern is not null
    and cardinality(instructions) > 0
    and cardinality(common_mistakes) > 0
  )
);

create index exercises_movement_pattern_idx
  on public.exercises (movement_pattern)
  where not is_custom;

create table public.exercise_equipment (
  exercise_id uuid not null references public.exercises (id) on delete cascade,
  equipment_id uuid not null references public.equipment (id) on delete restrict,
  position smallint not null,
  primary key (exercise_id, equipment_id),
  constraint exercise_equipment_position_positive check (position > 0),
  constraint exercise_equipment_position_unique unique (exercise_id, position)
);

create index exercise_equipment_equipment_idx
  on public.exercise_equipment (equipment_id);

create or replace function private.ensure_official_exercise_has_primary()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_exercise_id uuid;
begin
  if tg_table_name = 'exercises' then
    target_exercise_id := new.id;
  elsif tg_op = 'DELETE' then
    target_exercise_id := old.exercise_id;
  else
    target_exercise_id := new.exercise_id;
  end if;

  if exists (
    select 1
    from public.exercises
    where id = target_exercise_id
      and not is_custom
  ) and not exists (
    select 1
    from public.exercise_muscles
    where exercise_id = target_exercise_id
      and involvement_type = 'primary'
  ) then
    raise exception 'Official exercise % requires at least one primary muscle', target_exercise_id;
  end if;

  return null;
end;
$$;

revoke all on function private.ensure_official_exercise_has_primary()
from public, anon, authenticated;

create constraint trigger exercises_require_primary_muscle
after insert or update on public.exercises
deferrable initially deferred
for each row execute function private.ensure_official_exercise_has_primary();

create constraint trigger exercise_muscles_require_primary_muscle
after insert or update or delete on public.exercise_muscles
deferrable initially deferred
for each row execute function private.ensure_official_exercise_has_primary();

create or replace function private.ensure_official_exercise_has_equipment()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_exercise_id uuid;
begin
  if tg_table_name = 'exercises' then
    target_exercise_id := new.id;
  elsif tg_op = 'DELETE' then
    target_exercise_id := old.exercise_id;
  else
    target_exercise_id := new.exercise_id;
  end if;

  if exists (
    select 1
    from public.exercises
    where id = target_exercise_id
      and not is_custom
  ) and not exists (
    select 1
    from public.exercise_equipment
    where exercise_id = target_exercise_id
  ) then
    raise exception 'Official exercise % requires at least one equipment item', target_exercise_id;
  end if;

  return null;
end;
$$;

revoke all on function private.ensure_official_exercise_has_equipment()
from public, anon, authenticated;

create constraint trigger exercises_require_equipment
after insert or update on public.exercises
deferrable initially deferred
for each row execute function private.ensure_official_exercise_has_equipment();

create constraint trigger exercise_equipment_require_equipment
after insert or update or delete on public.exercise_equipment
deferrable initially deferred
for each row execute function private.ensure_official_exercise_has_equipment();

alter table public.equipment enable row level security;
alter table public.exercise_equipment enable row level security;

create policy equipment_select_authenticated
on public.equipment for select
to authenticated
using ((select auth.uid()) is not null);

create policy exercise_equipment_select_available
on public.exercise_equipment for select
to authenticated
using (
  exists (
    select 1
    from public.exercises
    where exercises.id = exercise_equipment.exercise_id
      and (
        not exercises.is_custom
        or exercises.created_by = (select auth.uid())
      )
  )
);

create policy exercise_equipment_insert_custom_own
on public.exercise_equipment for insert
to authenticated
with check (
  exists (
    select 1
    from public.exercises
    where exercises.id = exercise_equipment.exercise_id
      and exercises.is_custom
      and exercises.created_by = (select auth.uid())
  )
);

create policy exercise_equipment_update_custom_own
on public.exercise_equipment for update
to authenticated
using (
  exists (
    select 1
    from public.exercises
    where exercises.id = exercise_equipment.exercise_id
      and exercises.is_custom
      and exercises.created_by = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.exercises
    where exercises.id = exercise_equipment.exercise_id
      and exercises.is_custom
      and exercises.created_by = (select auth.uid())
  )
);

create policy exercise_equipment_delete_custom_own
on public.exercise_equipment for delete
to authenticated
using (
  exists (
    select 1
    from public.exercises
    where exercises.id = exercise_equipment.exercise_id
      and exercises.is_custom
      and exercises.created_by = (select auth.uid())
  )
);

revoke all on table public.exercises from authenticated;
revoke all on table public.exercise_muscles from authenticated;
revoke all on table public.equipment from anon, authenticated;
revoke all on table public.exercise_equipment from anon, authenticated;

grant select, delete on table public.exercises to authenticated;
grant insert (
  name,
  slug,
  description,
  instructions,
  common_mistakes,
  difficulty,
  movement_pattern,
  image_url,
  created_by,
  is_custom
) on public.exercises to authenticated;
grant update (
  name,
  slug,
  description,
  instructions,
  common_mistakes,
  difficulty,
  movement_pattern,
  image_url
) on public.exercises to authenticated;
grant select, insert, delete on table public.exercise_muscles to authenticated;
grant update (involvement_type)
  on public.exercise_muscles to authenticated;
grant select on table public.equipment to authenticated;
grant select, insert, delete on table public.exercise_equipment to authenticated;
grant update (position) on public.exercise_equipment to authenticated;

grant all on table public.equipment to service_role;
grant all on table public.exercise_equipment to service_role;

comment on type public.movement_pattern is
  'Stable movement classification used for exercise matching and substitution.';
comment on table public.equipment is
  'Read-only catalog of equipment required by official exercises.';
comment on table public.exercise_equipment is
  'Ordered equipment requirements for an exercise; position 1 is primary.';
comment on column public.exercises.instructions is
  'Ordered technique steps displayed to the user.';
comment on column public.exercises.common_mistakes is
  'Ordered common execution mistakes displayed to the user.';
