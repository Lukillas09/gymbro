begin;

create extension if not exists pgtap with schema extensions;

select plan(8);

insert into auth.users (id, email)
values
  ('11111111-1111-4111-8111-111111111111', 'gymbro-user-one@example.test'),
  ('22222222-2222-4222-8222-222222222222', 'gymbro-user-two@example.test');

set local role authenticated;
set local request.jwt.claim.sub = '11111111-1111-4111-8111-111111111111';

select is((select count(*) from public.profiles), 1::bigint, 'user one sees one profile');

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

reset role;
set local role authenticated;
set local request.jwt.claim.sub = '22222222-2222-4222-8222-222222222222';

select is((select count(*) from public.profiles), 1::bigint, 'user two sees one profile');
select is((select count(*) from public.routines), 0::bigint, 'user two cannot see user one routine');

insert into public.routines (user_id, name, goal)
values ('22222222-2222-4222-8222-222222222222', 'Routine Two', 'muscle_gain');

select is((select count(*) from public.routines), 1::bigint, 'user two creates a routine');
select is(
  (select name from public.routines),
  'Routine Two',
  'user two only reads their routine'
);

reset role;
select * from finish();
rollback;
