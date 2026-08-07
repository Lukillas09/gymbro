create or replace function private.check_workout_session_integrity()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.assert_workout_session_integrity(
    case when tg_op = 'DELETE' then old.id else new.id end
  );
  return null;
end;
$$;

create or replace function private.check_workout_exercise_session_integrity()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'DELETE' then
    perform private.assert_workout_session_integrity(old.workout_session_id);
  elsif tg_op = 'INSERT' then
    perform private.assert_workout_session_integrity(new.workout_session_id);
  else
    perform private.assert_workout_session_integrity(old.workout_session_id);

    if new.workout_session_id <> old.workout_session_id then
      perform private.assert_workout_session_integrity(new.workout_session_id);
    end if;
  end if;

  return null;
end;
$$;

revoke all on function private.check_workout_session_integrity()
  from public, anon, authenticated;
revoke all on function private.check_workout_exercise_session_integrity()
  from public, anon, authenticated;

comment on function private.check_workout_session_integrity() is
  'Deferred constraint trigger wrapper. SECURITY DEFINER is limited to private integrity checks because authenticated cannot access the private schema.';
comment on function private.check_workout_exercise_session_integrity() is
  'Deferred constraint trigger wrapper. SECURITY DEFINER is limited to private integrity checks because authenticated cannot access the private schema.';
