insert into public.muscle_groups (name, slug, body_region)
values
  ('Pecho', 'pecho', 'upper_body'),
  ('Espalda', 'espalda', 'upper_body'),
  ('Hombros', 'hombros', 'upper_body'),
  ('Bíceps', 'biceps', 'upper_body'),
  ('Tríceps', 'triceps', 'upper_body'),
  ('Antebrazos', 'antebrazos', 'upper_body'),
  ('Cuádriceps', 'cuadriceps', 'lower_body'),
  ('Isquiotibiales', 'isquiotibiales', 'lower_body'),
  ('Glúteos', 'gluteos', 'lower_body'),
  ('Pantorrillas', 'pantorrillas', 'lower_body'),
  ('Abdominales', 'abdominales', 'core'),
  ('Zona lumbar', 'zona-lumbar', 'core')
on conflict (slug) do update
set
  name = excluded.name,
  body_region = excluded.body_region;
