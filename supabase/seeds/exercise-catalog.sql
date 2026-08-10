begin;

insert into public.equipment (name, slug)
values
  ('Peso corporal', 'bodyweight'),
  ('Barra', 'barbell'),
  ('Mancuernas', 'dumbbells'),
  ('Barra EZ', 'ez-bar'),
  ('Polea', 'cable'),
  ('Máquina', 'machine'),
  ('Smith', 'smith-machine'),
  ('Banco', 'bench'),
  ('Barra de dominadas', 'pull-up-bar'),
  ('Kettlebell', 'kettlebell'),
  ('Banda elástica', 'resistance-band'),
  ('Paralelas', 'dip-bars'),
  ('Rueda abdominal', 'ab-wheel'),
  ('Banco Scott', 'preacher-bench')
on conflict (slug) do update
set name = excluded.name;

insert into public.exercises (
  name,
  slug,
  description,
  difficulty,
  movement_pattern,
  instructions,
  common_mistakes,
  is_custom,
  created_by
)
select
  catalog.name,
  catalog.slug,
  catalog.description,
  catalog.difficulty::public.exercise_difficulty,
  catalog.movement_pattern::public.movement_pattern,
  catalog.instructions,
  catalog.common_mistakes,
  false,
  null
from (
  values
    (
      'Press banca con barra',
      'barbell-bench-press',
      'Empuje horizontal con barra para desarrollar el pecho con una base estable.',
      'intermediate',
      'horizontal_push',
      array['Apoyá los pies y fijá las escápulas al banco.', 'Descendé la barra con control hacia la zona media del pecho.', 'Empujá manteniendo muñecas y antebrazos alineados.'],
      array['Levantar los glúteos del banco.', 'Abrir los codos sin control.', 'Rebotar la barra sobre el pecho.']
    ),
    (
      'Press banca con mancuernas',
      'dumbbell-bench-press',
      'Empuje horizontal con recorrido independiente para cada brazo.',
      'beginner',
      'horizontal_push',
      array['Apoyá pies, cabeza y espalda con estabilidad.', 'Bajá las mancuernas a ambos lados del pecho.', 'Empujá sin chocar las mancuernas arriba.'],
      array['Perder la posición escapular.', 'Bajar con las muñecas dobladas.', 'Acortar demasiado el recorrido.']
    ),
    (
      'Press inclinado con barra',
      'incline-barbell-bench-press',
      'Press en banco inclinado con énfasis en la porción superior del pecho.',
      'intermediate',
      'horizontal_push',
      array['Ajustá una inclinación moderada y fijá los pies.', 'Bajá la barra hacia la parte alta del pecho.', 'Empujá sin perder el apoyo de la espalda.'],
      array['Usar una inclinación excesiva.', 'Dejar que los codos se desplacen sin control.', 'Despegar la espalda del banco.']
    ),
    (
      'Press inclinado con mancuernas',
      'incline-dumbbell-bench-press',
      'Empuje inclinado con mancuernas para trabajar el pecho superior.',
      'beginner',
      'horizontal_push',
      array['Fijá las escápulas sobre el banco inclinado.', 'Descendé las mancuernas de forma simétrica.', 'Empujá siguiendo una trayectoria estable.'],
      array['Juntar las mancuernas con impacto.', 'Perder el apoyo de los pies.', 'Convertir el movimiento en un press vertical.']
    ),
    (
      'Press declinado con barra',
      'decline-barbell-bench-press',
      'Press declinado orientado a la porción inferior del pecho.',
      'intermediate',
      'horizontal_push',
      array['Asegurá las piernas en el banco declinado.', 'Descendé la barra hacia la parte baja del pecho.', 'Empujá manteniendo el torso estable.'],
      array['Usar una carga que impida controlar la bajada.', 'Rebotar la barra.', 'Perder la sujeción de las piernas.']
    ),
    (
      'Aperturas con mancuernas',
      'dumbbell-chest-fly',
      'Aducción de brazos con mancuernas para trabajar el pecho en un recorrido amplio.',
      'beginner',
      'chest_fly',
      array['Mantené una flexión suave y fija de codos.', 'Abrí los brazos hasta un rango cómodo y controlado.', 'Cerrá llevando los brazos hacia el centro del pecho.'],
      array['Transformar el gesto en un press.', 'Bajar más allá del rango controlable.', 'Usar impulso para cerrar.']
    ),
    (
      'Cruce de poleas',
      'cable-crossover',
      'Aducción de brazos en polea con tensión continua sobre el pecho.',
      'beginner',
      'chest_fly',
      array['Adoptá una postura firme entre las poleas.', 'Mantené los codos levemente flexionados.', 'Juntá las manos delante del torso y volvé con control.'],
      array['Balancear el cuerpo.', 'Flexionar y extender los codos durante la repetición.', 'Dejar que las placas choquen.']
    ),
    (
      'Chest press en máquina',
      'machine-chest-press',
      'Empuje horizontal guiado para entrenar el pecho con alta estabilidad.',
      'beginner',
      'horizontal_push',
      array['Ajustá el asiento para alinear manijas y pecho.', 'Apoyá toda la espalda en el respaldo.', 'Empujá y regresá sin perder tensión.'],
      array['Despegar los hombros del respaldo.', 'Bloquear los codos con impacto.', 'Acortar la fase de regreso.']
    ),
    (
      'Fondos orientados a pecho',
      'chest-focused-dips',
      'Fondos en paralelas con inclinación del torso para enfatizar el pecho.',
      'intermediate',
      'horizontal_push',
      array['Sujetá las paralelas y estabilizá los hombros.', 'Incliná levemente el torso al descender.', 'Empujá hasta recuperar una posición firme.'],
      array['Caer entre los hombros.', 'Usar rebotes en la parte baja.', 'Forzar un rango que no puede controlarse.']
    ),
    (
      'Flexiones de brazos',
      'push-up',
      'Empuje con peso corporal que integra pecho, tríceps y estabilidad del tronco.',
      'beginner',
      'horizontal_push',
      array['Formá una línea estable desde cabeza hasta talones.', 'Descendé el pecho entre las manos.', 'Empujá el suelo sin perder la posición del tronco.'],
      array['Dejar caer la cadera.', 'Abrir excesivamente los codos.', 'Mover sólo la cabeza hacia el suelo.']
    ),
    (
      'Dominadas',
      'pull-up',
      'Tracción vertical con peso corporal para espalda y flexores del codo.',
      'intermediate',
      'vertical_pull',
      array['Colgate con agarre firme y hombros activos.', 'Llevá el pecho hacia la barra guiando los codos abajo.', 'Descendé hasta extender los brazos con control.'],
      array['Balancear las piernas.', 'Encoger los hombros durante toda la subida.', 'Acortar la bajada.']
    ),
    (
      'Jalón al pecho',
      'lat-pulldown',
      'Tracción vertical en polea para entrenar el dorsal ancho.',
      'beginner',
      'vertical_pull',
      array['Fijá los muslos bajo el soporte.', 'Llevá la barra hacia la parte alta del pecho.', 'Extendé los brazos sin perder el control del torso.'],
      array['Tirar la barra detrás de la cabeza.', 'Inclinarse hacia atrás con impulso.', 'Soltar el peso al regresar.']
    ),
    (
      'Remo con barra',
      'barbell-row',
      'Tracción horizontal libre para espalda y estabilidad de la cadena posterior.',
      'intermediate',
      'horizontal_pull',
      array['Incliná el torso con columna estable.', 'Llevá la barra hacia el abdomen guiando los codos.', 'Bajá la barra sin cambiar la posición del tronco.'],
      array['Redondear la espalda.', 'Levantarse para completar cada repetición.', 'Tirar sólo con las manos.']
    ),
    (
      'Remo con mancuerna a un brazo',
      'one-arm-dumbbell-row',
      'Remo unilateral apoyado para trabajar la espalda con control.',
      'beginner',
      'horizontal_pull',
      array['Apoyá una mano y una rodilla en el banco.', 'Llevá la mancuerna hacia la cadera.', 'Descendé extendiendo el brazo sin rotar el torso.'],
      array['Girar el cuerpo para subir la carga.', 'Encoger el hombro.', 'Mover la mancuerna hacia el pecho.']
    ),
    (
      'Remo sentado en polea',
      'seated-cable-row',
      'Tracción horizontal en polea con tensión constante sobre la espalda.',
      'beginner',
      'horizontal_pull',
      array['Sentate con torso erguido y pies firmes.', 'Llevá el agarre hacia el abdomen.', 'Extendé los brazos manteniendo el pecho estable.'],
      array['Balancear el torso.', 'Elevar los hombros al tirar.', 'Dejar caer el peso al frente.']
    ),
    (
      'Remo en máquina',
      'machine-row',
      'Remo guiado que permite concentrarse en la retracción de la espalda.',
      'beginner',
      'horizontal_pull',
      array['Ajustá el asiento y apoyá el pecho si corresponde.', 'Tirá de las manijas guiando los codos atrás.', 'Regresá hasta una extensión controlada.'],
      array['Separar el torso del apoyo.', 'Acortar el recorrido.', 'Cerrar los hombros hacia las orejas.']
    ),
    (
      'Pullover en polea',
      'straight-arm-pulldown',
      'Extensión de hombro en polea con brazos casi rectos para aislar dorsales.',
      'beginner',
      'shoulder_extension',
      array['Incliná levemente el torso y fijá los codos.', 'Llevá la barra hacia los muslos.', 'Volvé hasta sentir tensión sin elevar los hombros.'],
      array['Convertirlo en un jalón de tríceps.', 'Balancear el torso.', 'Perder la tensión al subir.']
    ),
    (
      'Peso muerto convencional',
      'conventional-deadlift',
      'Bisagra de cadera con barra para trabajar la cadena posterior de forma integrada.',
      'advanced',
      'hip_hinge',
      array['Ubicá la barra sobre el mediopié y tomá un agarre firme.', 'Creá tensión antes de separar la barra del suelo.', 'Extendé caderas y rodillas manteniendo la barra cerca.'],
      array['Redondear la espalda al despegar.', 'Separar la barra del cuerpo.', 'Hiperextender el torso al finalizar.']
    ),
    (
      'Remo con mancuernas apoyado',
      'chest-supported-dumbbell-row',
      'Remo con el pecho apoyado para reducir el impulso y enfocar la espalda.',
      'beginner',
      'horizontal_pull',
      array['Ajustá el banco inclinado y apoyá el pecho.', 'Llevá las mancuernas hacia los costados del torso.', 'Bajá hasta extender los brazos sin despegarte.'],
      array['Levantar el pecho del banco.', 'Encoger los hombros.', 'Usar un recorrido demasiado corto.']
    ),
    (
      'Remo invertido',
      'inverted-row',
      'Tracción horizontal con peso corporal bajo una barra estable.',
      'beginner',
      'horizontal_pull',
      array['Ajustá una barra firme y alineá el cuerpo.', 'Llevá el pecho hacia la barra.', 'Descendé manteniendo caderas y tronco unidos.'],
      array['Dejar caer la cadera.', 'Adelantar la cabeza.', 'Perder el control en la bajada.']
    ),
    (
      'Press militar con barra',
      'barbell-overhead-press',
      'Empuje vertical de pie con barra para hombros y tríceps.',
      'intermediate',
      'vertical_push',
      array['Tomá la barra a la altura de los hombros.', 'Estabilizá abdomen y glúteos antes de empujar.', 'Llevá la barra sobre la cabeza y bajá con control.'],
      array['Arquear excesivamente la zona lumbar.', 'Empujar la barra lejos del cuerpo.', 'Flexionar las rodillas para generar impulso.']
    ),
    (
      'Press de hombros con mancuernas',
      'dumbbell-shoulder-press',
      'Empuje vertical sentado con trabajo independiente de cada brazo.',
      'beginner',
      'vertical_push',
      array['Ajustá el respaldo y apoyá los pies.', 'Partí con las mancuernas a los lados de los hombros.', 'Empujá arriba y regresá de forma simétrica.'],
      array['Despegar la espalda del respaldo.', 'Chocar las mancuernas arriba.', 'Bajar un brazo antes que el otro.']
    ),
    (
      'Elevaciones laterales con mancuernas',
      'dumbbell-lateral-raise',
      'Abducción de hombro con mancuernas para el deltoide lateral.',
      'beginner',
      'shoulder_abduction',
      array['Mantené los codos levemente flexionados.', 'Elevá los brazos hacia los lados con control.', 'Bajá sin perder tensión.'],
      array['Usar impulso del torso.', 'Encoger los hombros.', 'Subir las manos muy por encima de los codos.']
    ),
    (
      'Elevación lateral en polea',
      'cable-lateral-raise',
      'Abducción unilateral en polea con tensión continua.',
      'beginner',
      'shoulder_abduction',
      array['Ubicate de lado y sujetá la polea baja.', 'Elevá el brazo hasta una altura controlable.', 'Regresá lentamente sin apoyar las placas.'],
      array['Inclinar el torso para mover más peso.', 'Flexionar mucho el codo.', 'Girar el hombro durante la subida.']
    ),
    (
      'Pájaros con mancuernas',
      'bent-over-reverse-fly',
      'Apertura inversa inclinada para deltoides posteriores y espalda alta.',
      'beginner',
      'reverse_fly',
      array['Incliná el torso con espalda estable.', 'Abrí los brazos manteniendo una flexión suave de codos.', 'Juntá las escápulas sin elevar los hombros.'],
      array['Balancear el cuerpo.', 'Convertir el movimiento en un remo.', 'Usar un rango sin control.']
    ),
    (
      'Reverse pec deck',
      'reverse-pec-deck',
      'Apertura inversa guiada para deltoides posteriores y romboides.',
      'beginner',
      'reverse_fly',
      array['Ajustá el asiento y apoyá el pecho.', 'Abrí las manijas hacia atrás.', 'Regresá de forma lenta manteniendo el torso apoyado.'],
      array['Separarse del respaldo.', 'Encoger los hombros.', 'Dejar que el peso cierre de golpe.']
    ),
    (
      'Face pull',
      'face-pull',
      'Tracción alta en polea para deltoides posteriores y espalda superior.',
      'beginner',
      'horizontal_pull',
      array['Colocá la cuerda a la altura del rostro.', 'Tirá separando las manos y guiando los codos atrás.', 'Volvé sin perder la posición del torso.'],
      array['Tirar hacia el pecho.', 'Arquear la espalda para completar.', 'Cerrar los codos junto al cuerpo.']
    ),
    (
      'Elevaciones frontales con mancuernas',
      'dumbbell-front-raise',
      'Flexión de hombro con mancuernas para el deltoide anterior.',
      'beginner',
      'shoulder_flexion',
      array['Sostené las mancuernas delante de los muslos.', 'Elevá un brazo o ambos hasta la altura del hombro.', 'Bajá sin balancear el torso.'],
      array['Impulsar con la cadera.', 'Elevar los hombros.', 'Perder el control al bajar.']
    ),
    (
      'Press de hombros en máquina',
      'machine-shoulder-press',
      'Empuje vertical guiado para entrenar hombros con apoyo estable.',
      'beginner',
      'vertical_push',
      array['Ajustá el asiento para alinear las manijas.', 'Apoyá espalda y pies.', 'Empujá arriba y regresá hasta un rango cómodo.'],
      array['Despegar la espalda.', 'Cerrar los codos con impacto.', 'Acortar demasiado el descenso.']
    ),
    (
      'Aperturas con banda',
      'resistance-band-pull-apart',
      'Apertura horizontal con banda para deltoides posteriores y espalda alta.',
      'beginner',
      'reverse_fly',
      array['Sostené la banda frente al pecho con brazos extendidos.', 'Separá las manos hasta acercar la banda al torso.', 'Volvé lentamente sin perder tensión.'],
      array['Elevar los hombros.', 'Arquear la zona lumbar.', 'Aflojar la banda de golpe.']
    ),
    (
      'Curl con barra',
      'barbell-curl',
      'Flexión de codos con barra para bíceps y braquial.',
      'beginner',
      'elbow_flexion',
      array['Sostené la barra con brazos extendidos y torso firme.', 'Flexioná los codos sin adelantarlos.', 'Bajá la barra hasta recuperar el recorrido.'],
      array['Balancear la espalda.', 'Adelantar los codos.', 'Soltar la barra en la bajada.']
    ),
    (
      'Curl con barra EZ',
      'ez-bar-curl',
      'Curl bilateral con barra EZ y agarre semipronado.',
      'beginner',
      'elbow_flexion',
      array['Elegí el agarre cómodo de la barra EZ.', 'Flexioná los codos manteniendo el torso quieto.', 'Extendé los brazos con control.'],
      array['Impulsar con las piernas.', 'Acortar la extensión.', 'Doblar las muñecas.']
    ),
    (
      'Curl alternado con mancuernas',
      'alternating-dumbbell-curl',
      'Flexión alternada de codos con rotación controlada del antebrazo.',
      'beginner',
      'elbow_flexion',
      array['Partí con las mancuernas junto al cuerpo.', 'Flexioná un codo mientras girás la palma hacia arriba.', 'Bajá por completo antes de alternar.'],
      array['Inclinar el torso hacia cada lado.', 'Mover el hombro hacia adelante.', 'Alternar antes de completar la bajada.']
    ),
    (
      'Curl inclinado con mancuernas',
      'incline-dumbbell-curl',
      'Curl sentado en banco inclinado con el brazo detrás del torso.',
      'intermediate',
      'elbow_flexion',
      array['Apoyá la espalda en un banco inclinado.', 'Dejá los brazos extendidos a los lados.', 'Flexioná los codos sin mover los hombros.'],
      array['Adelantar los codos.', 'Despegar la espalda.', 'Usar impulso al iniciar.']
    ),
    (
      'Curl martillo',
      'hammer-curl',
      'Curl con agarre neutro para braquial, bíceps y antebrazos.',
      'beginner',
      'elbow_flexion',
      array['Sostené las mancuernas con palmas enfrentadas.', 'Flexioná los codos manteniendo el agarre neutro.', 'Bajá hasta extender sin balanceo.'],
      array['Mover los hombros.', 'Abrir los codos hacia los lados.', 'Dejar caer las mancuernas.']
    ),
    (
      'Curl predicador con barra EZ',
      'ez-bar-preacher-curl',
      'Curl con brazos apoyados para limitar el impulso del torso.',
      'beginner',
      'elbow_flexion',
      array['Ajustá el banco para apoyar brazos y axilas.', 'Flexioná los codos sin despegar los brazos.', 'Descendé hasta una extensión controlada.'],
      array['Despegar los brazos del apoyo.', 'Rebotar abajo.', 'Cerrar las muñecas hacia adelante.']
    ),
    (
      'Curl en polea',
      'cable-curl',
      'Flexión de codos en polea con tensión continua.',
      'beginner',
      'elbow_flexion',
      array['Ubicate frente a la polea baja.', 'Mantené los codos junto al torso.', 'Flexioná y extendé sin dejar que las placas choquen.'],
      array['Inclinarse hacia atrás.', 'Adelantar los codos.', 'Perder tensión al bajar.']
    ),
    (
      'Curl concentrado',
      'concentration-curl',
      'Curl unilateral sentado con el brazo apoyado contra el muslo.',
      'beginner',
      'elbow_flexion',
      array['Sentate y apoyá el brazo contra la cara interna del muslo.', 'Flexioná el codo sin mover el hombro.', 'Extendé lentamente hasta abajo.'],
      array['Levantar el codo del apoyo.', 'Girar el torso.', 'Acortar la extensión.']
    ),
    (
      'Extensión de tríceps en polea',
      'cable-triceps-pushdown',
      'Extensión de codos en polea alta para las cabezas lateral y medial.',
      'beginner',
      'elbow_extension',
      array['Fijá los codos junto al torso.', 'Extendé los brazos llevando el agarre hacia abajo.', 'Regresá hasta flexionar los codos sin mover hombros.'],
      array['Abrir los codos.', 'Inclinar el cuerpo sobre el agarre.', 'Usar impulso del torso.']
    ),
    (
      'Extensión de tríceps sobre cabeza en polea',
      'overhead-cable-triceps-extension',
      'Extensión de codos sobre la cabeza con énfasis en la cabeza larga.',
      'beginner',
      'elbow_extension',
      array['Colocate de espaldas a la polea con postura firme.', 'Mantené los codos orientados al frente.', 'Extendé los brazos y regresá con control.'],
      array['Abrir demasiado los codos.', 'Arquear la zona lumbar.', 'Mover los hombros en cada repetición.']
    ),
    (
      'Press francés con barra EZ',
      'ez-bar-skull-crusher',
      'Extensión de tríceps acostado con barra EZ.',
      'intermediate',
      'elbow_extension',
      array['Acostate y sostené la barra sobre los hombros.', 'Flexioná los codos llevando la barra detrás de la frente.', 'Extendé sin desplazar los brazos.'],
      array['Abrir los codos.', 'Mover los hombros para impulsar.', 'Bajar sin control.']
    ),
    (
      'Fondos en paralelas',
      'parallel-bar-dips',
      'Fondos con torso más vertical para enfatizar el tríceps.',
      'intermediate',
      'elbow_extension',
      array['Sujetá las paralelas y estabilizá los hombros.', 'Descendé manteniendo el torso relativamente vertical.', 'Extendé los codos hasta una posición firme.'],
      array['Balancear el cuerpo.', 'Caer entre los hombros.', 'Forzar un rango sin control.']
    ),
    (
      'Press banca con agarre cerrado',
      'close-grip-bench-press',
      'Press horizontal con agarre cerrado para priorizar el tríceps.',
      'intermediate',
      'elbow_extension',
      array['Tomá la barra con un agarre algo menor al ancho de hombros.', 'Bajá hacia la parte media del pecho con codos controlados.', 'Empujá manteniendo muñecas alineadas.'],
      array['Usar un agarre excesivamente estrecho.', 'Abrir los codos sin control.', 'Levantar los glúteos.']
    ),
    (
      'Extensión de tríceps con mancuerna',
      'dumbbell-overhead-triceps-extension',
      'Extensión sobre cabeza con una mancuerna para la cabeza larga del tríceps.',
      'beginner',
      'elbow_extension',
      array['Sostené la mancuerna sobre la cabeza con ambas manos.', 'Flexioná los codos sin abrirlos.', 'Extendé manteniendo el torso estable.'],
      array['Arquear la espalda.', 'Separar los codos.', 'Mover la cabeza hacia adelante.']
    ),
    (
      'Patada de tríceps',
      'dumbbell-triceps-kickback',
      'Extensión unilateral de codo con el brazo alineado al torso.',
      'beginner',
      'elbow_extension',
      array['Apoyate y colocá el brazo junto al torso.', 'Extendé el codo hasta alinear el antebrazo.', 'Volvé sin mover el hombro.'],
      array['Balancear la mancuerna.', 'Dejar caer el codo.', 'Girar el torso.']
    ),
    (
      'Fondos asistidos en máquina',
      'assisted-dip-machine',
      'Fondos con asistencia regulable para desarrollar fuerza de tríceps.',
      'beginner',
      'elbow_extension',
      array['Ajustá una asistencia que permita controlar el recorrido.', 'Descendé con el torso estable.', 'Empujá hasta extender los codos sin impacto.'],
      array['Usar impulso de la plataforma.', 'Encoger los hombros.', 'Recortar la bajada.']
    ),
    (
      'Sentadilla trasera',
      'barbell-back-squat',
      'Sentadilla con barra sobre la espalda para piernas y cadera.',
      'intermediate',
      'squat',
      array['Apoyá la barra de forma estable y separá los pies.', 'Descendé coordinando rodillas y cadera.', 'Empujá el suelo para volver manteniendo el torso firme.'],
      array['Perder el apoyo completo del pie.', 'Colapsar las rodillas hacia adentro.', 'Relajar el tronco en la parte baja.']
    ),
    (
      'Sentadilla frontal',
      'barbell-front-squat',
      'Sentadilla con barra frontal que demanda un torso erguido.',
      'advanced',
      'squat',
      array['Apoyá la barra sobre los hombros delanteros.', 'Mantené los codos altos durante el descenso.', 'Subí conservando el torso erguido.'],
      array['Dejar caer los codos.', 'Perder el apoyo del mediopié.', 'Inclinarse excesivamente hacia adelante.']
    ),
    (
      'Hack squat',
      'hack-squat',
      'Sentadilla guiada en máquina con énfasis en cuádriceps.',
      'beginner',
      'squat',
      array['Apoyá espalda y hombros en la máquina.', 'Descendé con pies firmes sobre la plataforma.', 'Extendé rodillas y caderas sin bloquear con impacto.'],
      array['Despegar la espalda del apoyo.', 'Juntar las rodillas hacia adentro.', 'Acortar el recorrido sin necesidad.']
    ),
    (
      'Prensa de piernas',
      'leg-press',
      'Empuje de piernas en máquina para cuádriceps y glúteos.',
      'beginner',
      'squat',
      array['Apoyá toda la espalda y ubicá los pies en la plataforma.', 'Descendé la plataforma sin despegar la pelvis.', 'Empujá manteniendo rodillas alineadas con los pies.'],
      array['Despegar la cadera del asiento.', 'Bloquear las rodillas con impacto.', 'Bajar más allá del rango estable.']
    ),
    (
      'Extensión de cuádriceps',
      'leg-extension',
      'Extensión de rodillas en máquina para aislar cuádriceps.',
      'beginner',
      'knee_extension',
      array['Alineá las rodillas con el eje de la máquina.', 'Extendé las piernas de forma controlada.', 'Regresá sin dejar caer el peso.'],
      array['Despegar la cadera del asiento.', 'Usar impulso.', 'Golpear el tope al extender.']
    ),
    (
      'Peso muerto rumano',
      'romanian-deadlift',
      'Bisagra de cadera con barra para isquiotibiales y glúteos.',
      'intermediate',
      'hip_hinge',
      array['Sostené la barra cerca de los muslos.', 'Llevá la cadera atrás con rodillas levemente flexionadas.', 'Extendé la cadera manteniendo la barra cerca.'],
      array['Convertirlo en una sentadilla.', 'Alejar la barra del cuerpo.', 'Redondear la espalda.']
    ),
    (
      'Curl femoral sentado',
      'seated-leg-curl',
      'Flexión de rodillas sentado para aislar isquiotibiales.',
      'beginner',
      'knee_flexion',
      array['Alineá las rodillas con el eje de la máquina.', 'Fijá el soporte sobre los muslos.', 'Flexioná y regresá con control.'],
      array['Levantar la cadera.', 'Acortar el regreso.', 'Usar rebotes.']
    ),
    (
      'Curl femoral acostado',
      'lying-leg-curl',
      'Flexión de rodillas acostado para trabajar isquiotibiales.',
      'beginner',
      'knee_flexion',
      array['Alineá las rodillas y apoyá la cadera.', 'Flexioná llevando los talones hacia atrás.', 'Bajá el rodillo lentamente.'],
      array['Levantar la pelvis.', 'Arquear la espalda.', 'Soltar el peso al extender.']
    ),
    (
      'Hip thrust con barra',
      'barbell-hip-thrust',
      'Extensión de cadera con espalda apoyada para priorizar glúteos.',
      'intermediate',
      'hip_hinge',
      array['Apoyá la parte alta de la espalda en el banco.', 'Ubicá la barra protegida sobre la cadera.', 'Extendé la cadera y descendé manteniendo control.'],
      array['Hiperextender la zona lumbar.', 'Empujar desde las puntas de los pies.', 'Perder la posición del banco.']
    ),
    (
      'Zancadas caminando',
      'walking-lunge',
      'Zancadas alternadas para piernas, glúteos y control unilateral.',
      'intermediate',
      'lunge',
      array['Da un paso suficientemente largo y apoyá todo el pie.', 'Descendé ambas rodillas manteniendo equilibrio.', 'Impulsate hacia el siguiente paso con control.'],
      array['Cruzar los pies al avanzar.', 'Golpear la rodilla contra el suelo.', 'Inclinar el torso sin control.']
    ),
    (
      'Sentadilla búlgara',
      'bulgarian-split-squat',
      'Sentadilla unilateral con el pie trasero elevado.',
      'intermediate',
      'lunge',
      array['Apoyá el empeine trasero en el banco.', 'Ubicá el pie delantero para descender estable.', 'Empujá con la pierna delantera para subir.'],
      array['Quedar demasiado cerca del banco.', 'Perder la alineación de la rodilla.', 'Impulsarse con la pierna trasera.']
    ),
    (
      'Aducción de cadera en máquina',
      'machine-hip-adduction',
      'Aducción guiada de cadera para trabajar la cara interna de las piernas.',
      'beginner',
      'hip_adduction',
      array['Ajustá el rango inicial de forma cómoda.', 'Cerrá las piernas sin despegar la espalda.', 'Abrí lentamente hasta el punto inicial.'],
      array['Cerrar con impulso.', 'Separar la espalda del asiento.', 'Dejar que el peso abra de golpe.']
    ),
    (
      'Abducción de cadera en máquina',
      'machine-hip-abduction',
      'Abducción guiada para glúteos y abductores de cadera.',
      'beginner',
      'hip_abduction',
      array['Sentate con espalda y pies apoyados.', 'Abrí las piernas manteniendo el torso estable.', 'Regresá lentamente sin juntar con impacto.'],
      array['Balancear el tronco.', 'Abrir mediante impulso.', 'Soltar el peso al cerrar.']
    ),
    (
      'Elevación de gemelos de pie',
      'standing-calf-raise',
      'Flexión plantar de pie para trabajar pantorrillas.',
      'beginner',
      'calf_raise',
      array['Apoyá el antepié y mantené las rodillas estables.', 'Elevá los talones hasta arriba.', 'Descendé lentamente hasta un rango cómodo.'],
      array['Rebotar en la parte baja.', 'Flexionar las rodillas en cada repetición.', 'Acortar el recorrido.']
    ),
    (
      'Elevación de gemelos sentado',
      'seated-calf-raise',
      'Flexión plantar sentado con carga sobre los muslos.',
      'beginner',
      'calf_raise',
      array['Ajustá el apoyo sobre los muslos.', 'Elevá los talones manteniendo el antepié firme.', 'Descendé con control.'],
      array['Mover la cadera.', 'Rebotar abajo.', 'Dejar caer el peso.']
    ),
    (
      'Sentadilla goblet',
      'kettlebell-goblet-squat',
      'Sentadilla con carga frontal sostenida cerca del pecho.',
      'beginner',
      'squat',
      array['Sostené la kettlebell junto al pecho.', 'Descendé entre las piernas con pies firmes.', 'Subí manteniendo el torso estable.'],
      array['Separar la carga del cuerpo.', 'Colapsar las rodillas.', 'Perder el apoyo de los talones.']
    ),
    (
      'Sentadilla en Smith',
      'smith-machine-squat',
      'Sentadilla guiada en Smith para entrenar piernas con trayectoria estable.',
      'beginner',
      'squat',
      array['Ubicá la barra y los pies según la trayectoria de la máquina.', 'Desbloqueá y descendé con control.', 'Empujá hasta una posición estable antes de trabar.'],
      array['Colocar los pies sin considerar la trayectoria.', 'Rebotar abajo.', 'Trabar la máquina antes de estar estable.']
    ),
    (
      'Subida al banco con mancuernas',
      'dumbbell-step-up',
      'Subida unilateral a banco para glúteos, cuádriceps y equilibrio.',
      'beginner',
      'lunge',
      array['Apoyá todo el pie de trabajo sobre el banco.', 'Subí empujando con esa pierna.', 'Descendé lentamente antes de repetir.'],
      array['Impulsarse demasiado con la pierna del suelo.', 'Apoyar sólo la punta del pie.', 'Caer sin control al bajar.']
    ),
    (
      'Crunch',
      'crunch',
      'Flexión corta del tronco con peso corporal para el recto abdominal.',
      'beginner',
      'core_flexion',
      array['Acostate con rodillas flexionadas y zona lumbar estable.', 'Acercá las costillas a la pelvis.', 'Descendé sin relajar por completo el abdomen.'],
      array['Tirar del cuello.', 'Sentarse por completo.', 'Usar impulso de los brazos.']
    ),
    (
      'Crunch en polea',
      'cable-crunch',
      'Flexión de tronco arrodillado con resistencia de polea.',
      'beginner',
      'core_flexion',
      array['Arrodillate y sostené la cuerda junto a la cabeza.', 'Flexioná el tronco acercando costillas y pelvis.', 'Regresá sin mover la cadera hacia atrás.'],
      array['Tirar con los brazos.', 'Convertirlo en una bisagra de cadera.', 'Perder tensión arriba.']
    ),
    (
      'Elevación de piernas acostado',
      'lying-leg-raise',
      'Elevación de piernas en el suelo con control de pelvis y abdomen.',
      'beginner',
      'core_flexion',
      array['Acostate y estabilizá la zona lumbar.', 'Elevá las piernas manteniendo el control de la pelvis.', 'Bajá sin arquear la espalda.'],
      array['Despegar la zona lumbar.', 'Usar impulso.', 'Bajar más allá del control abdominal.']
    ),
    (
      'Elevación de rodillas colgado',
      'hanging-knee-raise',
      'Flexión de cadera y pelvis colgado para entrenar el abdomen.',
      'intermediate',
      'core_flexion',
      array['Colgate con hombros activos.', 'Llevá las rodillas hacia el torso enrollando la pelvis.', 'Descendé hasta quedar estable sin balanceo.'],
      array['Balancear el cuerpo.', 'Subir sólo con la cadera.', 'Soltar las piernas en la bajada.']
    ),
    (
      'Plancha frontal',
      'front-plank',
      'Ejercicio isométrico para resistir la extensión del tronco.',
      'beginner',
      'core_stability',
      array['Apoyá antebrazos y puntas de pies.', 'Alineá cabeza, tronco y cadera.', 'Respirá manteniendo abdomen y glúteos activos.'],
      array['Dejar caer la cadera.', 'Elevar demasiado los glúteos.', 'Contener la respiración.']
    ),
    (
      'Plancha lateral',
      'side-plank',
      'Ejercicio isométrico lateral para oblicuos y estabilidad del tronco.',
      'beginner',
      'core_stability',
      array['Apoyá un antebrazo debajo del hombro.', 'Elevá la cadera y alineá el cuerpo de lado.', 'Mantené la respiración y la pelvis estable.'],
      array['Rotar el torso hacia el suelo.', 'Dejar caer la cadera.', 'Cargar el cuello.']
    ),
    (
      'Pallof press',
      'pallof-press',
      'Press antirotación en polea para entrenar la estabilidad del tronco.',
      'beginner',
      'core_stability',
      array['Ubicate de lado a la polea con postura firme.', 'Llevá el agarre al centro del pecho.', 'Extendé los brazos resistiendo la rotación.'],
      array['Girar hacia la polea.', 'Inclinar el torso.', 'Usar una base inestable.']
    ),
    (
      'Giro ruso',
      'russian-twist',
      'Rotación controlada del tronco sentado para trabajar oblicuos.',
      'beginner',
      'core_rotation',
      array['Sentate con torso inclinado y espalda larga.', 'Gir&aacute las costillas hacia cada lado.', 'Mantené la pelvis estable durante el cambio.'],
      array['Mover sólo los brazos.', 'Redondear excesivamente la espalda.', 'Girar con impulso.']
    ),
    (
      'Rueda abdominal',
      'ab-wheel-rollout',
      'Extensión controlada del cuerpo con rueda para abdomen y estabilidad.',
      'intermediate',
      'core_stability',
      array['Arrodillate y sujetá la rueda debajo de los hombros.', 'Rodá hacia adelante manteniendo abdomen activo.', 'Regresá sin colapsar la zona lumbar.'],
      array['Arquear la espalda.', 'Ir más lejos de lo controlable.', 'Tirar sólo con los brazos.']
    )
) as catalog(
  name,
  slug,
  description,
  difficulty,
  movement_pattern,
  instructions,
  common_mistakes
)
on conflict (slug) where not is_custom do update
set name = excluded.name,
    description = excluded.description,
    difficulty = excluded.difficulty,
    movement_pattern = excluded.movement_pattern,
    instructions = excluded.instructions,
    common_mistakes = excluded.common_mistakes;

create temporary table seed_exercise_muscles (
  exercise_slug text not null,
  muscle_slug text not null,
  involvement_type public.muscle_involvement not null,
  primary key (exercise_slug, muscle_slug)
) on commit drop;

insert into seed_exercise_muscles (exercise_slug, muscle_slug, involvement_type)
values
  ('barbell-bench-press', 'mid-chest', 'primary'),
  ('barbell-bench-press', 'triceps-lateral-head', 'secondary'),
  ('barbell-bench-press', 'anterior-deltoid', 'secondary'),
  ('dumbbell-bench-press', 'mid-chest', 'primary'),
  ('dumbbell-bench-press', 'triceps-lateral-head', 'secondary'),
  ('dumbbell-bench-press', 'anterior-deltoid', 'secondary'),
  ('incline-barbell-bench-press', 'upper-chest', 'primary'),
  ('incline-barbell-bench-press', 'mid-chest', 'secondary'),
  ('incline-barbell-bench-press', 'triceps-lateral-head', 'secondary'),
  ('incline-barbell-bench-press', 'anterior-deltoid', 'secondary'),
  ('incline-dumbbell-bench-press', 'upper-chest', 'primary'),
  ('incline-dumbbell-bench-press', 'mid-chest', 'secondary'),
  ('incline-dumbbell-bench-press', 'triceps-lateral-head', 'secondary'),
  ('incline-dumbbell-bench-press', 'anterior-deltoid', 'secondary'),
  ('decline-barbell-bench-press', 'lower-chest', 'primary'),
  ('decline-barbell-bench-press', 'mid-chest', 'secondary'),
  ('decline-barbell-bench-press', 'triceps-lateral-head', 'secondary'),
  ('dumbbell-chest-fly', 'mid-chest', 'primary'),
  ('dumbbell-chest-fly', 'anterior-deltoid', 'secondary'),
  ('cable-crossover', 'mid-chest', 'primary'),
  ('cable-crossover', 'lower-chest', 'secondary'),
  ('machine-chest-press', 'mid-chest', 'primary'),
  ('machine-chest-press', 'triceps-lateral-head', 'secondary'),
  ('machine-chest-press', 'anterior-deltoid', 'secondary'),
  ('chest-focused-dips', 'lower-chest', 'primary'),
  ('chest-focused-dips', 'triceps-long-head', 'secondary'),
  ('chest-focused-dips', 'anterior-deltoid', 'secondary'),
  ('push-up', 'mid-chest', 'primary'),
  ('push-up', 'triceps-lateral-head', 'secondary'),
  ('push-up', 'anterior-deltoid', 'secondary'),
  ('push-up', 'transverse-abdominis', 'stabilizer'),
  ('pull-up', 'lats', 'primary'),
  ('pull-up', 'rhomboids', 'secondary'),
  ('pull-up', 'biceps-long-head', 'secondary'),
  ('pull-up', 'brachialis', 'secondary'),
  ('lat-pulldown', 'lats', 'primary'),
  ('lat-pulldown', 'biceps-long-head', 'secondary'),
  ('lat-pulldown', 'brachialis', 'secondary'),
  ('barbell-row', 'lats', 'primary'),
  ('barbell-row', 'rhomboids', 'primary'),
  ('barbell-row', 'trapezius', 'secondary'),
  ('barbell-row', 'biceps-long-head', 'secondary'),
  ('barbell-row', 'spinal-erectors', 'stabilizer'),
  ('one-arm-dumbbell-row', 'lats', 'primary'),
  ('one-arm-dumbbell-row', 'rhomboids', 'secondary'),
  ('one-arm-dumbbell-row', 'biceps-long-head', 'secondary'),
  ('seated-cable-row', 'lats', 'primary'),
  ('seated-cable-row', 'rhomboids', 'primary'),
  ('seated-cable-row', 'trapezius', 'secondary'),
  ('seated-cable-row', 'biceps-long-head', 'secondary'),
  ('machine-row', 'lats', 'primary'),
  ('machine-row', 'rhomboids', 'primary'),
  ('machine-row', 'trapezius', 'secondary'),
  ('machine-row', 'biceps-long-head', 'secondary'),
  ('straight-arm-pulldown', 'lats', 'primary'),
  ('straight-arm-pulldown', 'triceps-long-head', 'secondary'),
  ('straight-arm-pulldown', 'rectus-abdominis', 'stabilizer'),
  ('conventional-deadlift', 'spinal-erectors', 'primary'),
  ('conventional-deadlift', 'glutes', 'primary'),
  ('conventional-deadlift', 'hamstrings', 'secondary'),
  ('conventional-deadlift', 'trapezius', 'secondary'),
  ('conventional-deadlift', 'forearms', 'stabilizer'),
  ('chest-supported-dumbbell-row', 'lats', 'primary'),
  ('chest-supported-dumbbell-row', 'rhomboids', 'secondary'),
  ('chest-supported-dumbbell-row', 'posterior-deltoid', 'secondary'),
  ('chest-supported-dumbbell-row', 'biceps-long-head', 'secondary'),
  ('inverted-row', 'lats', 'primary'),
  ('inverted-row', 'rhomboids', 'primary'),
  ('inverted-row', 'posterior-deltoid', 'secondary'),
  ('inverted-row', 'biceps-long-head', 'secondary'),
  ('barbell-overhead-press', 'anterior-deltoid', 'primary'),
  ('barbell-overhead-press', 'lateral-deltoid', 'secondary'),
  ('barbell-overhead-press', 'triceps-lateral-head', 'secondary'),
  ('dumbbell-shoulder-press', 'anterior-deltoid', 'primary'),
  ('dumbbell-shoulder-press', 'lateral-deltoid', 'secondary'),
  ('dumbbell-shoulder-press', 'triceps-lateral-head', 'secondary'),
  ('dumbbell-lateral-raise', 'lateral-deltoid', 'primary'),
  ('dumbbell-lateral-raise', 'trapezius', 'secondary'),
  ('cable-lateral-raise', 'lateral-deltoid', 'primary'),
  ('cable-lateral-raise', 'trapezius', 'secondary'),
  ('bent-over-reverse-fly', 'posterior-deltoid', 'primary'),
  ('bent-over-reverse-fly', 'rhomboids', 'secondary'),
  ('bent-over-reverse-fly', 'trapezius', 'secondary'),
  ('reverse-pec-deck', 'posterior-deltoid', 'primary'),
  ('reverse-pec-deck', 'rhomboids', 'secondary'),
  ('reverse-pec-deck', 'trapezius', 'secondary'),
  ('face-pull', 'posterior-deltoid', 'primary'),
  ('face-pull', 'rhomboids', 'primary'),
  ('face-pull', 'trapezius', 'secondary'),
  ('dumbbell-front-raise', 'anterior-deltoid', 'primary'),
  ('dumbbell-front-raise', 'upper-chest', 'secondary'),
  ('machine-shoulder-press', 'anterior-deltoid', 'primary'),
  ('machine-shoulder-press', 'lateral-deltoid', 'secondary'),
  ('machine-shoulder-press', 'triceps-lateral-head', 'secondary'),
  ('resistance-band-pull-apart', 'posterior-deltoid', 'primary'),
  ('resistance-band-pull-apart', 'rhomboids', 'primary'),
  ('resistance-band-pull-apart', 'trapezius', 'secondary'),
  ('barbell-curl', 'biceps-long-head', 'primary'),
  ('barbell-curl', 'biceps-short-head', 'primary'),
  ('barbell-curl', 'brachialis', 'secondary'),
  ('barbell-curl', 'forearms', 'stabilizer'),
  ('ez-bar-curl', 'biceps-long-head', 'primary'),
  ('ez-bar-curl', 'biceps-short-head', 'primary'),
  ('ez-bar-curl', 'brachialis', 'secondary'),
  ('alternating-dumbbell-curl', 'biceps-long-head', 'primary'),
  ('alternating-dumbbell-curl', 'biceps-short-head', 'primary'),
  ('alternating-dumbbell-curl', 'brachialis', 'secondary'),
  ('incline-dumbbell-curl', 'biceps-long-head', 'primary'),
  ('incline-dumbbell-curl', 'biceps-short-head', 'secondary'),
  ('incline-dumbbell-curl', 'brachialis', 'secondary'),
  ('hammer-curl', 'brachialis', 'primary'),
  ('hammer-curl', 'biceps-long-head', 'secondary'),
  ('hammer-curl', 'forearms', 'secondary'),
  ('ez-bar-preacher-curl', 'biceps-short-head', 'primary'),
  ('ez-bar-preacher-curl', 'brachialis', 'secondary'),
  ('cable-curl', 'biceps-long-head', 'primary'),
  ('cable-curl', 'biceps-short-head', 'primary'),
  ('cable-curl', 'brachialis', 'secondary'),
  ('concentration-curl', 'biceps-short-head', 'primary'),
  ('concentration-curl', 'brachialis', 'secondary'),
  ('cable-triceps-pushdown', 'triceps-lateral-head', 'primary'),
  ('cable-triceps-pushdown', 'triceps-medial-head', 'primary'),
  ('cable-triceps-pushdown', 'triceps-long-head', 'secondary'),
  ('overhead-cable-triceps-extension', 'triceps-long-head', 'primary'),
  ('overhead-cable-triceps-extension', 'triceps-lateral-head', 'secondary'),
  ('ez-bar-skull-crusher', 'triceps-long-head', 'primary'),
  ('ez-bar-skull-crusher', 'triceps-lateral-head', 'secondary'),
  ('parallel-bar-dips', 'triceps-long-head', 'primary'),
  ('parallel-bar-dips', 'triceps-lateral-head', 'primary'),
  ('parallel-bar-dips', 'lower-chest', 'secondary'),
  ('parallel-bar-dips', 'anterior-deltoid', 'secondary'),
  ('close-grip-bench-press', 'triceps-lateral-head', 'primary'),
  ('close-grip-bench-press', 'triceps-medial-head', 'primary'),
  ('close-grip-bench-press', 'mid-chest', 'secondary'),
  ('close-grip-bench-press', 'anterior-deltoid', 'secondary'),
  ('dumbbell-overhead-triceps-extension', 'triceps-long-head', 'primary'),
  ('dumbbell-overhead-triceps-extension', 'triceps-lateral-head', 'secondary'),
  ('dumbbell-triceps-kickback', 'triceps-lateral-head', 'primary'),
  ('dumbbell-triceps-kickback', 'triceps-long-head', 'secondary'),
  ('assisted-dip-machine', 'triceps-long-head', 'primary'),
  ('assisted-dip-machine', 'triceps-lateral-head', 'primary'),
  ('assisted-dip-machine', 'lower-chest', 'secondary'),
  ('barbell-back-squat', 'quadriceps', 'primary'),
  ('barbell-back-squat', 'glutes', 'primary'),
  ('barbell-back-squat', 'hamstrings', 'secondary'),
  ('barbell-back-squat', 'adductors', 'secondary'),
  ('barbell-back-squat', 'spinal-erectors', 'stabilizer'),
  ('barbell-front-squat', 'quadriceps', 'primary'),
  ('barbell-front-squat', 'glutes', 'secondary'),
  ('barbell-front-squat', 'transverse-abdominis', 'stabilizer'),
  ('hack-squat', 'quadriceps', 'primary'),
  ('hack-squat', 'glutes', 'secondary'),
  ('leg-press', 'quadriceps', 'primary'),
  ('leg-press', 'glutes', 'primary'),
  ('leg-press', 'hamstrings', 'secondary'),
  ('leg-extension', 'quadriceps', 'primary'),
  ('romanian-deadlift', 'hamstrings', 'primary'),
  ('romanian-deadlift', 'glutes', 'primary'),
  ('romanian-deadlift', 'spinal-erectors', 'secondary'),
  ('romanian-deadlift', 'forearms', 'stabilizer'),
  ('seated-leg-curl', 'hamstrings', 'primary'),
  ('seated-leg-curl', 'calves', 'secondary'),
  ('lying-leg-curl', 'hamstrings', 'primary'),
  ('lying-leg-curl', 'calves', 'secondary'),
  ('barbell-hip-thrust', 'glutes', 'primary'),
  ('barbell-hip-thrust', 'hamstrings', 'secondary'),
  ('barbell-hip-thrust', 'quadriceps', 'stabilizer'),
  ('walking-lunge', 'quadriceps', 'primary'),
  ('walking-lunge', 'glutes', 'primary'),
  ('walking-lunge', 'hamstrings', 'secondary'),
  ('walking-lunge', 'abductors', 'stabilizer'),
  ('bulgarian-split-squat', 'quadriceps', 'primary'),
  ('bulgarian-split-squat', 'glutes', 'primary'),
  ('bulgarian-split-squat', 'hamstrings', 'secondary'),
  ('bulgarian-split-squat', 'abductors', 'stabilizer'),
  ('machine-hip-adduction', 'adductors', 'primary'),
  ('machine-hip-abduction', 'abductors', 'primary'),
  ('machine-hip-abduction', 'glutes', 'secondary'),
  ('standing-calf-raise', 'calves', 'primary'),
  ('seated-calf-raise', 'calves', 'primary'),
  ('kettlebell-goblet-squat', 'quadriceps', 'primary'),
  ('kettlebell-goblet-squat', 'glutes', 'primary'),
  ('kettlebell-goblet-squat', 'transverse-abdominis', 'stabilizer'),
  ('smith-machine-squat', 'quadriceps', 'primary'),
  ('smith-machine-squat', 'glutes', 'primary'),
  ('dumbbell-step-up', 'glutes', 'primary'),
  ('dumbbell-step-up', 'quadriceps', 'primary'),
  ('dumbbell-step-up', 'hamstrings', 'secondary'),
  ('crunch', 'rectus-abdominis', 'primary'),
  ('crunch', 'transverse-abdominis', 'secondary'),
  ('cable-crunch', 'rectus-abdominis', 'primary'),
  ('cable-crunch', 'transverse-abdominis', 'secondary'),
  ('lying-leg-raise', 'rectus-abdominis', 'primary'),
  ('lying-leg-raise', 'transverse-abdominis', 'secondary'),
  ('hanging-knee-raise', 'rectus-abdominis', 'primary'),
  ('hanging-knee-raise', 'forearms', 'stabilizer'),
  ('hanging-knee-raise', 'lats', 'stabilizer'),
  ('front-plank', 'transverse-abdominis', 'primary'),
  ('front-plank', 'rectus-abdominis', 'secondary'),
  ('front-plank', 'glutes', 'stabilizer'),
  ('side-plank', 'obliques', 'primary'),
  ('side-plank', 'transverse-abdominis', 'primary'),
  ('side-plank', 'abductors', 'stabilizer'),
  ('pallof-press', 'obliques', 'primary'),
  ('pallof-press', 'transverse-abdominis', 'primary'),
  ('pallof-press', 'glutes', 'stabilizer'),
  ('russian-twist', 'obliques', 'primary'),
  ('russian-twist', 'rectus-abdominis', 'secondary'),
  ('ab-wheel-rollout', 'rectus-abdominis', 'primary'),
  ('ab-wheel-rollout', 'transverse-abdominis', 'primary'),
  ('ab-wheel-rollout', 'lats', 'secondary');

delete from public.exercise_muscles
using public.exercises, (
  select distinct exercise_slug from seed_exercise_muscles
) as catalog
where exercise_muscles.exercise_id = exercises.id
  and exercises.slug = catalog.exercise_slug
  and not exercises.is_custom;

insert into public.exercise_muscles (exercise_id, muscle_id, involvement_type)
select exercises.id, muscles.id, seed_exercise_muscles.involvement_type
from seed_exercise_muscles
join public.exercises
  on exercises.slug = seed_exercise_muscles.exercise_slug
  and not exercises.is_custom
join public.muscles
  on muscles.slug = seed_exercise_muscles.muscle_slug;

create temporary table seed_exercise_equipment (
  exercise_slug text not null,
  equipment_slug text not null,
  position smallint not null,
  primary key (exercise_slug, equipment_slug),
  unique (exercise_slug, position)
) on commit drop;

insert into seed_exercise_equipment (exercise_slug, equipment_slug, position)
values
  ('barbell-bench-press', 'barbell', 1),
  ('barbell-bench-press', 'bench', 2),
  ('dumbbell-bench-press', 'dumbbells', 1),
  ('dumbbell-bench-press', 'bench', 2),
  ('incline-barbell-bench-press', 'barbell', 1),
  ('incline-barbell-bench-press', 'bench', 2),
  ('incline-dumbbell-bench-press', 'dumbbells', 1),
  ('incline-dumbbell-bench-press', 'bench', 2),
  ('decline-barbell-bench-press', 'barbell', 1),
  ('decline-barbell-bench-press', 'bench', 2),
  ('dumbbell-chest-fly', 'dumbbells', 1),
  ('dumbbell-chest-fly', 'bench', 2),
  ('cable-crossover', 'cable', 1),
  ('machine-chest-press', 'machine', 1),
  ('chest-focused-dips', 'bodyweight', 1),
  ('chest-focused-dips', 'dip-bars', 2),
  ('push-up', 'bodyweight', 1),
  ('pull-up', 'bodyweight', 1),
  ('pull-up', 'pull-up-bar', 2),
  ('lat-pulldown', 'cable', 1),
  ('barbell-row', 'barbell', 1),
  ('one-arm-dumbbell-row', 'dumbbells', 1),
  ('one-arm-dumbbell-row', 'bench', 2),
  ('seated-cable-row', 'cable', 1),
  ('machine-row', 'machine', 1),
  ('straight-arm-pulldown', 'cable', 1),
  ('conventional-deadlift', 'barbell', 1),
  ('chest-supported-dumbbell-row', 'dumbbells', 1),
  ('chest-supported-dumbbell-row', 'bench', 2),
  ('inverted-row', 'bodyweight', 1),
  ('inverted-row', 'smith-machine', 2),
  ('barbell-overhead-press', 'barbell', 1),
  ('dumbbell-shoulder-press', 'dumbbells', 1),
  ('dumbbell-shoulder-press', 'bench', 2),
  ('dumbbell-lateral-raise', 'dumbbells', 1),
  ('cable-lateral-raise', 'cable', 1),
  ('bent-over-reverse-fly', 'dumbbells', 1),
  ('reverse-pec-deck', 'machine', 1),
  ('face-pull', 'cable', 1),
  ('dumbbell-front-raise', 'dumbbells', 1),
  ('machine-shoulder-press', 'machine', 1),
  ('resistance-band-pull-apart', 'resistance-band', 1),
  ('barbell-curl', 'barbell', 1),
  ('ez-bar-curl', 'ez-bar', 1),
  ('alternating-dumbbell-curl', 'dumbbells', 1),
  ('incline-dumbbell-curl', 'dumbbells', 1),
  ('incline-dumbbell-curl', 'bench', 2),
  ('hammer-curl', 'dumbbells', 1),
  ('ez-bar-preacher-curl', 'ez-bar', 1),
  ('ez-bar-preacher-curl', 'preacher-bench', 2),
  ('cable-curl', 'cable', 1),
  ('concentration-curl', 'dumbbells', 1),
  ('cable-triceps-pushdown', 'cable', 1),
  ('overhead-cable-triceps-extension', 'cable', 1),
  ('ez-bar-skull-crusher', 'ez-bar', 1),
  ('ez-bar-skull-crusher', 'bench', 2),
  ('parallel-bar-dips', 'bodyweight', 1),
  ('parallel-bar-dips', 'dip-bars', 2),
  ('close-grip-bench-press', 'barbell', 1),
  ('close-grip-bench-press', 'bench', 2),
  ('dumbbell-overhead-triceps-extension', 'dumbbells', 1),
  ('dumbbell-triceps-kickback', 'dumbbells', 1),
  ('dumbbell-triceps-kickback', 'bench', 2),
  ('assisted-dip-machine', 'machine', 1),
  ('barbell-back-squat', 'barbell', 1),
  ('barbell-front-squat', 'barbell', 1),
  ('hack-squat', 'machine', 1),
  ('leg-press', 'machine', 1),
  ('leg-extension', 'machine', 1),
  ('romanian-deadlift', 'barbell', 1),
  ('seated-leg-curl', 'machine', 1),
  ('lying-leg-curl', 'machine', 1),
  ('barbell-hip-thrust', 'barbell', 1),
  ('barbell-hip-thrust', 'bench', 2),
  ('walking-lunge', 'dumbbells', 1),
  ('bulgarian-split-squat', 'dumbbells', 1),
  ('bulgarian-split-squat', 'bench', 2),
  ('machine-hip-adduction', 'machine', 1),
  ('machine-hip-abduction', 'machine', 1),
  ('standing-calf-raise', 'machine', 1),
  ('seated-calf-raise', 'machine', 1),
  ('kettlebell-goblet-squat', 'kettlebell', 1),
  ('smith-machine-squat', 'smith-machine', 1),
  ('dumbbell-step-up', 'dumbbells', 1),
  ('dumbbell-step-up', 'bench', 2),
  ('crunch', 'bodyweight', 1),
  ('cable-crunch', 'cable', 1),
  ('lying-leg-raise', 'bodyweight', 1),
  ('hanging-knee-raise', 'bodyweight', 1),
  ('hanging-knee-raise', 'pull-up-bar', 2),
  ('front-plank', 'bodyweight', 1),
  ('side-plank', 'bodyweight', 1),
  ('pallof-press', 'cable', 1),
  ('russian-twist', 'bodyweight', 1),
  ('ab-wheel-rollout', 'ab-wheel', 1);

delete from public.exercise_equipment
using public.exercises, (
  select distinct exercise_slug from seed_exercise_equipment
) as catalog
where exercise_equipment.exercise_id = exercises.id
  and exercises.slug = catalog.exercise_slug
  and not exercises.is_custom;

insert into public.exercise_equipment (exercise_id, equipment_id, position)
select exercises.id, equipment.id, seed_exercise_equipment.position
from seed_exercise_equipment
join public.exercises
  on exercises.slug = seed_exercise_equipment.exercise_slug
  and not exercises.is_custom
join public.equipment
  on equipment.slug = seed_exercise_equipment.equipment_slug;

do $$
begin
  if (select count(distinct exercise_slug) from seed_exercise_muscles) <> 73
    or (select count(distinct exercise_slug) from seed_exercise_equipment) <> 73
  then
    raise exception 'Exercise seed must define exactly 73 official exercises';
  end if;

  if exists (
    select 1
    from seed_exercise_muscles
    left join public.exercises
      on exercises.slug = seed_exercise_muscles.exercise_slug
      and not exercises.is_custom
    left join public.muscles
      on muscles.slug = seed_exercise_muscles.muscle_slug
    where exercises.id is null or muscles.id is null
  ) then
    raise exception 'Exercise seed contains an unknown exercise or muscle slug';
  end if;

  if exists (
    select 1
    from seed_exercise_equipment
    left join public.exercises
      on exercises.slug = seed_exercise_equipment.exercise_slug
      and not exercises.is_custom
    left join public.equipment
      on equipment.slug = seed_exercise_equipment.equipment_slug
    where exercises.id is null or equipment.id is null
  ) then
    raise exception 'Exercise seed contains an unknown exercise or equipment slug';
  end if;

  if exists (
    select 1
    from public.exercises
    where not is_custom
      and (
        description is null
        or movement_pattern is null
        or cardinality(instructions) = 0
        or cardinality(common_mistakes) = 0
      )
  ) then
    raise exception 'Every official exercise requires complete catalog content';
  end if;

  if exists (
    select 1
    from public.exercises
    where not is_custom
      and not exists (
        select 1
        from public.exercise_muscles
        where exercise_muscles.exercise_id = exercises.id
          and involvement_type = 'primary'
      )
  ) then
    raise exception 'Every official exercise requires a primary muscle';
  end if;

  if exists (
    select 1
    from public.exercises
    where not is_custom
      and not exists (
        select 1
        from public.exercise_equipment
        where exercise_equipment.exercise_id = exercises.id
      )
  ) then
    raise exception 'Every official exercise requires equipment';
  end if;
end;
$$;

commit;
