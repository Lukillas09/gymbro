alter table public.profiles
drop constraint profiles_username_format;

alter table public.profiles
add constraint profiles_username_format check (
  username is null
  or (
    char_length(username::text) between 3 and 20
    and username::text ~ '^[a-z0-9_.]+$'
  )
);
