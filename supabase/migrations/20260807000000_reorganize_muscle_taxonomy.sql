create table public.muscles (
  id uuid primary key default gen_random_uuid(),
  muscle_group_id uuid not null references public.muscle_groups (id) on delete restrict,
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint muscles_name_length check (
    char_length(btrim(name)) between 2 and 80
  ),
  constraint muscles_slug_format check (
    char_length(slug) between 2 and 80
    and slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
  ),
  constraint muscles_group_name_unique unique (muscle_group_id, name)
);

create index muscles_muscle_group_id_idx
  on public.muscles (muscle_group_id);

create trigger muscles_set_updated_at
before update on public.muscles
for each row execute function private.set_updated_at();

insert into public.muscle_groups (name, slug, body_region)
values
  ('Pecho', 'chest', 'upper_body'),
  ('Espalda', 'back', 'upper_body'),
  ('Abdomen', 'abdomen', 'core'),
  ('Tríceps', 'triceps', 'upper_body'),
  ('Bíceps', 'biceps', 'upper_body'),
  ('Hombros', 'shoulders', 'upper_body'),
  ('Piernas', 'legs', 'lower_body')
on conflict (slug) do update
set name = excluded.name,
    body_region = excluded.body_region;

insert into public.muscles (muscle_group_id, name, slug)
select muscle_groups.id, taxonomy.name, taxonomy.slug
from (
  values
    ('chest', 'Pectoral superior', 'upper-chest'),
    ('chest', 'Pectoral medio', 'mid-chest'),
    ('chest', 'Pectoral inferior', 'lower-chest'),
    ('back', 'Dorsal ancho', 'lats'),
    ('back', 'Trapecio', 'trapezius'),
    ('back', 'Romboides', 'rhomboids'),
    ('back', 'Erectores espinales', 'spinal-erectors'),
    ('abdomen', 'Recto abdominal', 'rectus-abdominis'),
    ('abdomen', 'Oblicuos', 'obliques'),
    ('abdomen', 'Transverso abdominal', 'transverse-abdominis'),
    ('triceps', 'Cabeza larga', 'triceps-long-head'),
    ('triceps', 'Cabeza lateral', 'triceps-lateral-head'),
    ('triceps', 'Cabeza medial', 'triceps-medial-head'),
    ('biceps', 'Cabeza larga', 'biceps-long-head'),
    ('biceps', 'Cabeza corta', 'biceps-short-head'),
    ('biceps', 'Braquial', 'brachialis'),
    ('biceps', 'Antebrazos', 'forearms'),
    ('shoulders', 'Deltoide anterior', 'anterior-deltoid'),
    ('shoulders', 'Deltoide lateral', 'lateral-deltoid'),
    ('shoulders', 'Deltoide posterior', 'posterior-deltoid'),
    ('legs', 'Cuádriceps', 'quadriceps'),
    ('legs', 'Isquiotibiales', 'hamstrings'),
    ('legs', 'Glúteos', 'glutes'),
    ('legs', 'Aductores', 'adductors'),
    ('legs', 'Abductores', 'abductors'),
    ('legs', 'Pantorrillas', 'calves')
) as taxonomy(group_slug, name, slug)
join public.muscle_groups on muscle_groups.slug = taxonomy.group_slug
on conflict (slug) do update
set muscle_group_id = excluded.muscle_group_id,
    name = excluded.name;

alter table public.exercise_muscles
add column muscle_id uuid;

update public.exercise_muscles as exercise_muscles
set muscle_id = muscles.id
from public.muscle_groups as legacy_group
join (
  values
    ('pecho', 'mid-chest'),
    ('chest', 'mid-chest'),
    ('espalda', 'lats'),
    ('back', 'lats'),
    ('abdominales', 'rectus-abdominis'),
    ('abdomen', 'rectus-abdominis'),
    ('triceps', 'triceps-long-head'),
    ('biceps', 'biceps-long-head'),
    ('antebrazos', 'forearms'),
    ('hombros', 'lateral-deltoid'),
    ('shoulders', 'lateral-deltoid'),
    ('cuadriceps', 'quadriceps'),
    ('isquiotibiales', 'hamstrings'),
    ('gluteos', 'glutes'),
    ('pantorrillas', 'calves'),
    ('zona-lumbar', 'spinal-erectors'),
    ('legs', 'quadriceps')
) as legacy_mapping(group_slug, muscle_slug)
  on legacy_mapping.group_slug = legacy_group.slug
join public.muscles on muscles.slug = legacy_mapping.muscle_slug
where legacy_group.id = exercise_muscles.muscle_group_id;

do $$
begin
  if exists (
    select 1
    from public.exercise_muscles
    where muscle_id is null
  ) then
    raise exception 'Cannot migrate exercise_muscles with an unknown legacy muscle group';
  end if;

  if exists (
    select 1
    from public.muscle_groups
    where slug not in (
      'pecho',
      'chest',
      'espalda',
      'back',
      'abdominales',
      'abdomen',
      'triceps',
      'biceps',
      'antebrazos',
      'hombros',
      'shoulders',
      'cuadriceps',
      'isquiotibiales',
      'gluteos',
      'pantorrillas',
      'zona-lumbar',
      'legs'
    )
  ) then
    raise exception 'Cannot remove an unknown muscle group during taxonomy migration';
  end if;
end;
$$;

alter table public.exercise_muscles
drop constraint exercise_muscles_pkey;

drop index public.exercise_muscles_group_idx;

alter table public.exercise_muscles
drop column muscle_group_id,
alter column muscle_id set not null,
add constraint exercise_muscles_pkey primary key (exercise_id, muscle_id),
add constraint exercise_muscles_muscle_id_fkey
  foreign key (muscle_id) references public.muscles (id) on delete restrict;

create index exercise_muscles_muscle_idx
  on public.exercise_muscles (muscle_id);

delete from public.muscle_groups
where slug not in (
  'chest',
  'back',
  'abdomen',
  'triceps',
  'biceps',
  'shoulders',
  'legs'
);

alter table public.muscle_groups
drop column body_region;

drop type public.body_region;

alter table public.muscles enable row level security;

create policy muscles_select_authenticated
on public.muscles for select
to authenticated
using ((select auth.uid()) is not null);

revoke all on table public.muscles from anon, authenticated;
grant select on table public.muscles to authenticated;
grant all on table public.muscles to service_role;

comment on table public.muscle_groups is
  'Seven user-facing training macro groups.';
comment on table public.muscles is
  'Specific training muscles or zones grouped under a macro group.';
comment on column public.exercise_muscles.muscle_id is
  'Specific muscle or training zone involved in the exercise.';
