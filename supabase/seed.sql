insert into public.muscle_groups (name, slug)
values
  ('Pecho', 'chest'),
  ('Espalda', 'back'),
  ('Abdomen', 'abdomen'),
  ('Tríceps', 'triceps'),
  ('Bíceps', 'biceps'),
  ('Hombros', 'shoulders'),
  ('Piernas', 'legs')
on conflict (slug) do update
set name = excluded.name;

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
