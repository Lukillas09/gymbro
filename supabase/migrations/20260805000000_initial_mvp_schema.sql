create extension if not exists citext with schema extensions;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create type public.biological_sex as enum (
  'female',
  'male',
  'intersex',
  'prefer_not_to_say'
);
create type public.training_level as enum ('beginner', 'intermediate', 'advanced');
create type public.training_goal as enum ('muscle_gain', 'strength', 'general_fitness');
create type public.weight_unit as enum ('kg', 'lb');
create type public.body_region as enum ('upper_body', 'lower_body', 'core');
create type public.exercise_difficulty as enum ('beginner', 'intermediate', 'advanced');
create type public.muscle_involvement as enum ('primary', 'secondary', 'stabilizer');
create type public.workout_status as enum ('in_progress', 'completed', 'cancelled');
create type public.workout_set_type as enum ('warmup', 'working', 'backoff', 'dropset');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username extensions.citext unique,
  display_name text,
  avatar_url text,
  birth_date date,
  biological_sex public.biological_sex,
  height_cm numeric(5, 2),
  current_weight_kg numeric(6, 2),
  training_level public.training_level,
  primary_goal public.training_goal,
  preferred_weight_unit public.weight_unit not null default 'kg',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_username_format check (
    username is null
    or (
      char_length(username::text) between 3 and 30
      and username::text ~ '^[A-Za-z0-9_]+$'
    )
  ),
  constraint profiles_display_name_length check (
    display_name is null or char_length(btrim(display_name)) between 1 and 80
  ),
  constraint profiles_avatar_url_length check (
    avatar_url is null or char_length(avatar_url) <= 2048
  ),
  constraint profiles_birth_date_range check (
    birth_date is null or birth_date between date '1900-01-01' and current_date
  ),
  constraint profiles_height_range check (
    height_cm is null or height_cm between 50 and 300
  ),
  constraint profiles_weight_range check (
    current_weight_kg is null or current_weight_kg between 20 and 500
  )
);

create table public.muscle_groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  body_region public.body_region not null,
  created_at timestamptz not null default now(),
  constraint muscle_groups_name_length check (
    char_length(btrim(name)) between 2 and 80
  ),
  constraint muscle_groups_slug_format check (
    char_length(slug) between 2 and 80
    and slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
  )
);

create table public.exercises (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null,
  description text,
  instructions text,
  common_mistakes text,
  equipment text not null,
  difficulty public.exercise_difficulty not null,
  image_url text,
  created_by uuid references auth.users (id),
  is_custom boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint exercises_name_length check (
    char_length(btrim(name)) between 2 and 120
  ),
  constraint exercises_slug_format check (
    char_length(slug) between 2 and 120
    and slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
  ),
  constraint exercises_equipment_length check (
    char_length(btrim(equipment)) between 2 and 80
  ),
  constraint exercises_image_url_length check (
    image_url is null or char_length(image_url) <= 2048
  ),
  constraint exercises_origin_consistency check (
    (not is_custom and created_by is null)
    or (is_custom and created_by is not null)
  )
);

create unique index exercises_official_slug_unique
  on public.exercises (slug)
  where not is_custom;
create unique index exercises_custom_owner_slug_unique
  on public.exercises (created_by, slug)
  where is_custom;
create index exercises_created_by_idx on public.exercises (created_by)
  where created_by is not null;

create table public.exercise_muscles (
  exercise_id uuid not null references public.exercises (id) on delete cascade,
  muscle_group_id uuid not null references public.muscle_groups (id) on delete restrict,
  involvement_type public.muscle_involvement not null,
  primary key (exercise_id, muscle_group_id)
);

create index exercise_muscles_group_idx
  on public.exercise_muscles (muscle_group_id);

create table public.routines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  description text,
  goal public.training_goal not null,
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  constraint routines_name_length check (
    char_length(btrim(name)) between 1 and 100
  ),
  constraint routines_description_length check (
    description is null or char_length(description) <= 2000
  ),
  constraint routines_active_archive_consistency check (
    not (is_active and archived_at is not null)
  )
);

create unique index routines_one_active_per_user_idx
  on public.routines (user_id)
  where is_active and archived_at is null;
create index routines_user_created_idx
  on public.routines (user_id, created_at desc);

create table public.routine_days (
  id uuid primary key default gen_random_uuid(),
  routine_id uuid not null references public.routines (id) on delete cascade,
  name text not null,
  position smallint not null,
  weekday smallint,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint routine_days_name_length check (
    char_length(btrim(name)) between 1 and 100
  ),
  constraint routine_days_position_nonnegative check (position >= 0),
  constraint routine_days_weekday_range check (
    weekday is null or weekday between 0 and 6
  ),
  unique (routine_id, position)
);

create table public.routine_exercises (
  id uuid primary key default gen_random_uuid(),
  routine_day_id uuid not null references public.routine_days (id) on delete cascade,
  exercise_id uuid not null references public.exercises (id) on delete restrict,
  position smallint not null,
  target_sets smallint not null,
  target_reps_min smallint not null,
  target_reps_max smallint not null,
  rest_seconds smallint not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint routine_exercises_position_nonnegative check (position >= 0),
  constraint routine_exercises_target_sets_range check (
    target_sets between 1 and 20
  ),
  constraint routine_exercises_target_reps_min_range check (
    target_reps_min between 1 and 1000
  ),
  constraint routine_exercises_target_reps_order check (
    target_reps_max between target_reps_min and 1000
  ),
  constraint routine_exercises_rest_range check (
    rest_seconds between 0 and 3600
  ),
  constraint routine_exercises_notes_length check (
    notes is null or char_length(notes) <= 2000
  ),
  unique (routine_day_id, position)
);

create index routine_exercises_exercise_idx
  on public.routine_exercises (exercise_id);

create table public.workout_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  routine_day_id uuid references public.routine_days (id) on delete set null,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  status public.workout_status not null default 'in_progress',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint workout_sessions_notes_length check (
    notes is null or char_length(notes) <= 2000
  ),
  constraint workout_sessions_status_time_consistency check (
    (status = 'in_progress' and completed_at is null)
    or (
      status = 'completed'
      and completed_at is not null
      and completed_at >= started_at
    )
    or (
      status = 'cancelled'
      and (completed_at is null or completed_at >= started_at)
    )
  )
);

create unique index workout_sessions_one_in_progress_per_user_idx
  on public.workout_sessions (user_id)
  where status = 'in_progress';
create index workout_sessions_user_started_idx
  on public.workout_sessions (user_id, started_at desc);
create index workout_sessions_routine_day_idx
  on public.workout_sessions (routine_day_id)
  where routine_day_id is not null;

create table public.workout_exercises (
  id uuid primary key default gen_random_uuid(),
  workout_session_id uuid not null references public.workout_sessions (id) on delete cascade,
  exercise_id uuid not null references public.exercises (id) on delete restrict,
  source_routine_exercise_id uuid references public.routine_exercises (id) on delete set null,
  position smallint not null,
  target_sets smallint not null,
  target_reps_min smallint not null,
  target_reps_max smallint not null,
  rest_seconds smallint not null,
  notes text,
  created_at timestamptz not null default now(),
  constraint workout_exercises_position_nonnegative check (position >= 0),
  constraint workout_exercises_target_sets_range check (
    target_sets between 1 and 20
  ),
  constraint workout_exercises_target_reps_min_range check (
    target_reps_min between 1 and 1000
  ),
  constraint workout_exercises_target_reps_order check (
    target_reps_max between target_reps_min and 1000
  ),
  constraint workout_exercises_rest_range check (
    rest_seconds between 0 and 3600
  ),
  constraint workout_exercises_notes_length check (
    notes is null or char_length(notes) <= 2000
  ),
  unique (workout_session_id, position)
);

create index workout_exercises_exercise_idx
  on public.workout_exercises (exercise_id);
create index workout_exercises_source_idx
  on public.workout_exercises (source_routine_exercise_id)
  where source_routine_exercise_id is not null;

create table public.workout_sets (
  id uuid primary key default gen_random_uuid(),
  workout_exercise_id uuid not null references public.workout_exercises (id) on delete cascade,
  set_number smallint not null,
  weight_kg numeric(7, 3) not null,
  repetitions smallint not null,
  rir smallint,
  set_type public.workout_set_type not null default 'working',
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint workout_sets_number_positive check (set_number > 0),
  constraint workout_sets_weight_range check (
    weight_kg between 0 and 2000
  ),
  constraint workout_sets_repetitions_range check (
    repetitions between 0 and 1000
  ),
  constraint workout_sets_rir_range check (rir is null or rir between 0 and 10),
  unique (workout_exercise_id, set_number)
);

create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke all on function private.set_updated_at() from public, anon, authenticated;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function private.set_updated_at();
create trigger exercises_set_updated_at
before update on public.exercises
for each row execute function private.set_updated_at();
create trigger routines_set_updated_at
before update on public.routines
for each row execute function private.set_updated_at();
create trigger routine_days_set_updated_at
before update on public.routine_days
for each row execute function private.set_updated_at();
create trigger routine_exercises_set_updated_at
before update on public.routine_exercises
for each row execute function private.set_updated_at();
create trigger workout_sessions_set_updated_at
before update on public.workout_sessions
for each row execute function private.set_updated_at();
create trigger workout_sets_set_updated_at
before update on public.workout_sets
for each row execute function private.set_updated_at();

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;

  return new;
end;
$$;

revoke all on function private.handle_new_user() from public, anon, authenticated;
grant usage on schema private to supabase_auth_admin;
grant execute on function private.handle_new_user() to supabase_auth_admin;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function private.handle_new_user();

insert into public.profiles (id)
select id from auth.users
on conflict (id) do nothing;

alter table public.profiles enable row level security;
alter table public.muscle_groups enable row level security;
alter table public.exercises enable row level security;
alter table public.exercise_muscles enable row level security;
alter table public.routines enable row level security;
alter table public.routine_days enable row level security;
alter table public.routine_exercises enable row level security;
alter table public.workout_sessions enable row level security;
alter table public.workout_exercises enable row level security;
alter table public.workout_sets enable row level security;

create policy profiles_select_own
on public.profiles for select
to authenticated
using ((select auth.uid()) = id);

create policy profiles_update_own
on public.profiles for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create policy muscle_groups_select_authenticated
on public.muscle_groups for select
to authenticated
using ((select auth.uid()) is not null);

create policy exercises_select_available
on public.exercises for select
to authenticated
using (
  not is_custom
  or created_by = (select auth.uid())
);

create policy exercises_insert_custom_own
on public.exercises for insert
to authenticated
with check (
  is_custom
  and created_by = (select auth.uid())
);

create policy exercises_update_custom_own
on public.exercises for update
to authenticated
using (
  is_custom
  and created_by = (select auth.uid())
)
with check (
  is_custom
  and created_by = (select auth.uid())
);

create policy exercises_delete_custom_own
on public.exercises for delete
to authenticated
using (
  is_custom
  and created_by = (select auth.uid())
);

create policy exercise_muscles_select_available
on public.exercise_muscles for select
to authenticated
using (
  exists (
    select 1
    from public.exercises
    where exercises.id = exercise_muscles.exercise_id
      and (
        not exercises.is_custom
        or exercises.created_by = (select auth.uid())
      )
  )
);

create policy exercise_muscles_insert_custom_own
on public.exercise_muscles for insert
to authenticated
with check (
  exists (
    select 1
    from public.exercises
    where exercises.id = exercise_muscles.exercise_id
      and exercises.is_custom
      and exercises.created_by = (select auth.uid())
  )
);

create policy exercise_muscles_update_custom_own
on public.exercise_muscles for update
to authenticated
using (
  exists (
    select 1
    from public.exercises
    where exercises.id = exercise_muscles.exercise_id
      and exercises.is_custom
      and exercises.created_by = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.exercises
    where exercises.id = exercise_muscles.exercise_id
      and exercises.is_custom
      and exercises.created_by = (select auth.uid())
  )
);

create policy exercise_muscles_delete_custom_own
on public.exercise_muscles for delete
to authenticated
using (
  exists (
    select 1
    from public.exercises
    where exercises.id = exercise_muscles.exercise_id
      and exercises.is_custom
      and exercises.created_by = (select auth.uid())
  )
);

create policy routines_select_own
on public.routines for select
to authenticated
using (user_id = (select auth.uid()));

create policy routines_insert_own
on public.routines for insert
to authenticated
with check (user_id = (select auth.uid()));

create policy routines_update_own
on public.routines for update
to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

create policy routines_delete_own
on public.routines for delete
to authenticated
using (user_id = (select auth.uid()));

create policy routine_days_select_own
on public.routine_days for select
to authenticated
using (
  exists (
    select 1 from public.routines
    where routines.id = routine_days.routine_id
      and routines.user_id = (select auth.uid())
  )
);

create policy routine_days_insert_own
on public.routine_days for insert
to authenticated
with check (
  exists (
    select 1 from public.routines
    where routines.id = routine_days.routine_id
      and routines.user_id = (select auth.uid())
  )
);

create policy routine_days_update_own
on public.routine_days for update
to authenticated
using (
  exists (
    select 1 from public.routines
    where routines.id = routine_days.routine_id
      and routines.user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1 from public.routines
    where routines.id = routine_days.routine_id
      and routines.user_id = (select auth.uid())
  )
);

create policy routine_days_delete_own
on public.routine_days for delete
to authenticated
using (
  exists (
    select 1 from public.routines
    where routines.id = routine_days.routine_id
      and routines.user_id = (select auth.uid())
  )
);

create policy routine_exercises_select_own
on public.routine_exercises for select
to authenticated
using (
  exists (
    select 1
    from public.routine_days
    join public.routines on routines.id = routine_days.routine_id
    where routine_days.id = routine_exercises.routine_day_id
      and routines.user_id = (select auth.uid())
  )
);

create policy routine_exercises_insert_own
on public.routine_exercises for insert
to authenticated
with check (
  exists (
    select 1
    from public.routine_days
    join public.routines on routines.id = routine_days.routine_id
    where routine_days.id = routine_exercises.routine_day_id
      and routines.user_id = (select auth.uid())
  )
  and exists (
    select 1 from public.exercises
    where exercises.id = routine_exercises.exercise_id
      and (
        not exercises.is_custom
        or exercises.created_by = (select auth.uid())
      )
  )
);

create policy routine_exercises_update_own
on public.routine_exercises for update
to authenticated
using (
  exists (
    select 1
    from public.routine_days
    join public.routines on routines.id = routine_days.routine_id
    where routine_days.id = routine_exercises.routine_day_id
      and routines.user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.routine_days
    join public.routines on routines.id = routine_days.routine_id
    where routine_days.id = routine_exercises.routine_day_id
      and routines.user_id = (select auth.uid())
  )
  and exists (
    select 1 from public.exercises
    where exercises.id = routine_exercises.exercise_id
      and (
        not exercises.is_custom
        or exercises.created_by = (select auth.uid())
      )
  )
);

create policy routine_exercises_delete_own
on public.routine_exercises for delete
to authenticated
using (
  exists (
    select 1
    from public.routine_days
    join public.routines on routines.id = routine_days.routine_id
    where routine_days.id = routine_exercises.routine_day_id
      and routines.user_id = (select auth.uid())
  )
);

create policy workout_sessions_select_own
on public.workout_sessions for select
to authenticated
using (user_id = (select auth.uid()));

create policy workout_sessions_insert_own
on public.workout_sessions for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and status = 'in_progress'
  and completed_at is null
);

create policy workout_sessions_update_active_own
on public.workout_sessions for update
to authenticated
using (
  user_id = (select auth.uid())
  and status = 'in_progress'
)
with check (user_id = (select auth.uid()));

create policy workout_sessions_delete_own
on public.workout_sessions for delete
to authenticated
using (user_id = (select auth.uid()));

create policy workout_exercises_select_own
on public.workout_exercises for select
to authenticated
using (
  exists (
    select 1 from public.workout_sessions
    where workout_sessions.id = workout_exercises.workout_session_id
      and workout_sessions.user_id = (select auth.uid())
  )
);

create policy workout_exercises_insert_active_own
on public.workout_exercises for insert
to authenticated
with check (
  exists (
    select 1 from public.workout_sessions
    where workout_sessions.id = workout_exercises.workout_session_id
      and workout_sessions.user_id = (select auth.uid())
      and workout_sessions.status = 'in_progress'
  )
  and exists (
    select 1 from public.exercises
    where exercises.id = workout_exercises.exercise_id
      and (
        not exercises.is_custom
        or exercises.created_by = (select auth.uid())
      )
  )
);

create policy workout_exercises_update_active_own
on public.workout_exercises for update
to authenticated
using (
  exists (
    select 1 from public.workout_sessions
    where workout_sessions.id = workout_exercises.workout_session_id
      and workout_sessions.user_id = (select auth.uid())
      and workout_sessions.status = 'in_progress'
  )
)
with check (
  exists (
    select 1 from public.workout_sessions
    where workout_sessions.id = workout_exercises.workout_session_id
      and workout_sessions.user_id = (select auth.uid())
      and workout_sessions.status = 'in_progress'
  )
  and exists (
    select 1 from public.exercises
    where exercises.id = workout_exercises.exercise_id
      and (
        not exercises.is_custom
        or exercises.created_by = (select auth.uid())
      )
  )
);

create policy workout_exercises_delete_active_own
on public.workout_exercises for delete
to authenticated
using (
  exists (
    select 1 from public.workout_sessions
    where workout_sessions.id = workout_exercises.workout_session_id
      and workout_sessions.user_id = (select auth.uid())
      and workout_sessions.status = 'in_progress'
  )
);

create policy workout_sets_select_own
on public.workout_sets for select
to authenticated
using (
  exists (
    select 1
    from public.workout_exercises
    join public.workout_sessions
      on workout_sessions.id = workout_exercises.workout_session_id
    where workout_exercises.id = workout_sets.workout_exercise_id
      and workout_sessions.user_id = (select auth.uid())
  )
);

create policy workout_sets_insert_active_own
on public.workout_sets for insert
to authenticated
with check (
  exists (
    select 1
    from public.workout_exercises
    join public.workout_sessions
      on workout_sessions.id = workout_exercises.workout_session_id
    where workout_exercises.id = workout_sets.workout_exercise_id
      and workout_sessions.user_id = (select auth.uid())
      and workout_sessions.status = 'in_progress'
  )
);

create policy workout_sets_update_active_own
on public.workout_sets for update
to authenticated
using (
  exists (
    select 1
    from public.workout_exercises
    join public.workout_sessions
      on workout_sessions.id = workout_exercises.workout_session_id
    where workout_exercises.id = workout_sets.workout_exercise_id
      and workout_sessions.user_id = (select auth.uid())
      and workout_sessions.status = 'in_progress'
  )
)
with check (
  exists (
    select 1
    from public.workout_exercises
    join public.workout_sessions
      on workout_sessions.id = workout_exercises.workout_session_id
    where workout_exercises.id = workout_sets.workout_exercise_id
      and workout_sessions.user_id = (select auth.uid())
      and workout_sessions.status = 'in_progress'
  )
);

create policy workout_sets_delete_active_own
on public.workout_sets for delete
to authenticated
using (
  exists (
    select 1
    from public.workout_exercises
    join public.workout_sessions
      on workout_sessions.id = workout_exercises.workout_session_id
    where workout_exercises.id = workout_sets.workout_exercise_id
      and workout_sessions.user_id = (select auth.uid())
      and workout_sessions.status = 'in_progress'
  )
);

revoke all on table public.profiles from anon, authenticated;
revoke all on table public.muscle_groups from anon, authenticated;
revoke all on table public.exercises from anon, authenticated;
revoke all on table public.exercise_muscles from anon, authenticated;
revoke all on table public.routines from anon, authenticated;
revoke all on table public.routine_days from anon, authenticated;
revoke all on table public.routine_exercises from anon, authenticated;
revoke all on table public.workout_sessions from anon, authenticated;
revoke all on table public.workout_exercises from anon, authenticated;
revoke all on table public.workout_sets from anon, authenticated;

grant select on table public.profiles to authenticated;
grant update (
  username,
  display_name,
  avatar_url,
  birth_date,
  biological_sex,
  height_cm,
  current_weight_kg,
  training_level,
  primary_goal,
  preferred_weight_unit
) on public.profiles to authenticated;
grant select on table public.muscle_groups to authenticated;
grant select, delete on table public.exercises to authenticated;
grant insert (
  name,
  slug,
  description,
  instructions,
  common_mistakes,
  equipment,
  difficulty,
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
  equipment,
  difficulty,
  image_url
) on public.exercises to authenticated;
grant select, insert, update, delete on table public.exercise_muscles to authenticated;
grant select, delete on table public.routines to authenticated;
grant insert (user_id, name, description, goal, is_active, archived_at)
  on public.routines to authenticated;
grant update (name, description, goal, is_active, archived_at)
  on public.routines to authenticated;
grant select, delete on table public.routine_days to authenticated;
grant insert (routine_id, name, position, weekday)
  on public.routine_days to authenticated;
grant update (name, position, weekday)
  on public.routine_days to authenticated;
grant select, delete on table public.routine_exercises to authenticated;
grant insert (
  routine_day_id,
  exercise_id,
  position,
  target_sets,
  target_reps_min,
  target_reps_max,
  rest_seconds,
  notes
) on public.routine_exercises to authenticated;
grant update (
  exercise_id,
  position,
  target_sets,
  target_reps_min,
  target_reps_max,
  rest_seconds,
  notes
) on public.routine_exercises to authenticated;
grant select, delete on table public.workout_sessions to authenticated;
grant insert (user_id, routine_day_id, started_at, status, notes)
  on public.workout_sessions to authenticated;
grant update (routine_day_id, completed_at, status, notes)
  on public.workout_sessions to authenticated;
grant select, delete on table public.workout_exercises to authenticated;
grant insert (
  workout_session_id,
  exercise_id,
  source_routine_exercise_id,
  position,
  target_sets,
  target_reps_min,
  target_reps_max,
  rest_seconds,
  notes
) on public.workout_exercises to authenticated;
grant update (exercise_id, source_routine_exercise_id, position, notes)
  on public.workout_exercises to authenticated;
grant select, delete on table public.workout_sets to authenticated;
grant insert (
  workout_exercise_id,
  set_number,
  weight_kg,
  repetitions,
  rir,
  set_type,
  completed_at
) on public.workout_sets to authenticated;
grant update (
  set_number,
  weight_kg,
  repetitions,
  rir,
  set_type,
  completed_at
) on public.workout_sets to authenticated;

grant all on table public.profiles to service_role;
grant all on table public.muscle_groups to service_role;
grant all on table public.exercises to service_role;
grant all on table public.exercise_muscles to service_role;
grant all on table public.routines to service_role;
grant all on table public.routine_days to service_role;
grant all on table public.routine_exercises to service_role;
grant all on table public.workout_sessions to service_role;
grant all on table public.workout_exercises to service_role;
grant all on table public.workout_sets to service_role;
