begin;

insert into auth.users (id, email)
values
  ('33333333-3333-4333-8333-333333333333', 'gymbro-rls-a@example.test'),
  ('44444444-4444-4444-8444-444444444444', 'gymbro-rls-b@example.test');

set local role authenticated;
set local request.jwt.claim.sub = '33333333-3333-4333-8333-333333333333';

do $$
declare
  visible_profiles integer;
  affected_profiles integer;
begin
  select count(*) into visible_profiles from public.profiles;

  if visible_profiles <> 1 then
    raise exception 'User A must see exactly one profile, found %', visible_profiles;
  end if;

  update public.profiles
  set display_name = 'Remote RLS User A'
  where id = '33333333-3333-4333-8333-333333333333';

  get diagnostics affected_profiles = row_count;

  if affected_profiles <> 1 then
    raise exception 'User A must update their own profile';
  end if;
end;
$$;

reset role;
set local role authenticated;
set local request.jwt.claim.sub = '44444444-4444-4444-8444-444444444444';

do $$
declare
  visible_profiles integer;
  affected_profiles integer;
begin
  select count(*) into visible_profiles from public.profiles;

  if visible_profiles <> 1 then
    raise exception 'User B must see exactly one profile, found %', visible_profiles;
  end if;

  if exists (
    select 1 from public.profiles
    where id = '33333333-3333-4333-8333-333333333333'
  ) then
    raise exception 'User B must not read user A profile';
  end if;

  update public.profiles
  set display_name = 'Unauthorized update'
  where id = '33333333-3333-4333-8333-333333333333';

  get diagnostics affected_profiles = row_count;

  if affected_profiles <> 0 then
    raise exception 'User B must not update user A profile';
  end if;

  update public.profiles
  set display_name = 'Remote RLS User B'
  where id = '44444444-4444-4444-8444-444444444444';

  get diagnostics affected_profiles = row_count;

  if affected_profiles <> 1 then
    raise exception 'User B must update their own profile';
  end if;
end;
$$;

reset role;
rollback;
