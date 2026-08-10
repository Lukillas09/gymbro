# Modelo de datos de GymBro

## Estado

Este documento describe el esquema PostgreSQL inicial del MVP. La migración
versionada en `supabase/migrations` es la fuente de verdad ejecutable; este
archivo explica sus decisiones, propiedad y consecuencias.

No se modelan amistades, actividad social, chat, suscripciones, nutrición,
recomendaciones inteligentes ni integraciones externas.

## Decisiones implementadas

### Claves primarias

Todas las entidades usan UUID. `profiles.id` reutiliza el UUID de `auth.users` y
las demás tablas generan su identificador con `gen_random_uuid()`. Esto evita
mezclar estrategias con Supabase Auth y permite crear identificadores sin una
secuencia global. El mayor tamaño de índices frente a `bigint` es aceptable para
el volumen del MVP.

### Enums y checks

Los vocabularios cerrados y usados como reglas de dominio son enums PostgreSQL:
nivel, objetivo, unidad preferida, dificultad, patrón de movimiento,
participación muscular, estado de sesión y tipo de serie. Incorporar un valor
nuevo requiere una migración explícita.

`body_region` se eliminó junto con su columna porque repetía una agrupación que
ya resuelven los siete macrogrupos y no tenía otro consumidor.

Los rangos, formatos y coherencia entre columnas usan restricciones `CHECK`.
Entre ellas se validan username, posiciones, series, repeticiones, peso, RIR,
descanso y relación entre estado y finalización de una sesión.

### Fechas de actualización

Las tablas editables, incluida la administración del catálogo `muscles`, tienen
`created_at` y `updated_at`. Un trigger común dentro del esquema privado
`private` reemplaza `updated_at` en cada actualización, por lo que el cliente no
controla esa marca temporal.

### Borrado y archivado

Las rutinas admiten `archived_at`; una rutina archivada no puede permanecer
activa. El borrado físico de una rutina elimina su configuración en cascada,
pero las referencias desde sesiones y ejercicios realizados pasan a `null`
cuando corresponde. Las sesiones conservan sus ejercicios y series.

Las sesiones completadas alimentan el historial. La política de eliminación de
cuenta y sus ejercicios personalizados todavía debe definirse antes de exponer
esa operación al usuario.

### Unidades de peso

El peso se almacena siempre normalizado en kilogramos mediante `numeric`, sin
errores de coma flotante. `preferred_weight_unit` admite `kg` y `lb` para futura
conversión de entrada y presentación; esa conversión pertenece a la aplicación.

### Ejercicios oficiales y personalizados

Un ejercicio oficial tiene `is_custom = false` y `created_by = null`. Su slug es
único globalmente y sólo el rol de servicio puede escribirlo. Un ejercicio
personalizado tiene creador, slug único por propietario y es privado durante el
MVP. El creador puede administrarlo y asociarle músculos y equipamiento del
catálogo.

Los oficiales deben terminar cada transacción con al menos un músculo `primary`
y un elemento de equipamiento. Triggers diferidos protegen ambas invariantes sin
condicionar el orden de inserción del seed. Los personalizados permanecen
preparados para una futura operación transaccional, pero su UI no pertenece a
esta fase.

La interfaz todavía no ofrece ejercicios personalizados. El esquema los deja
preparados sin hacerlos públicos ni incorporarlos al alcance funcional actual.

### Única rutina y sesión activa

Índices únicos parciales impiden más de una rutina activa y más de una sesión
`in_progress` por usuario. La aplicación deberá tratar una violación de unicidad
como señal para recuperar el registro activo existente.

La aplicación activa rutinas mediante `activate_routine(uuid)`, una función
`SECURITY INVOKER` que bloquea las filas del propietario, desactiva la anterior y
activa la elegida dentro de una sola transacción. El índice parcial continúa
siendo la garantía final ante concurrencia.

### Historial estable

`workout_exercises` conserva el ejercicio realizado, los objetivos de series,
repeticiones, descanso y RIR, además del nombre que vio el usuario y una
referencia opcional a la configuración de rutina que lo originó. La sesión copia
los nombres de rutina y día. `workout_sets` conserva los valores realizados.
Editar o archivar la rutina original no altera esas filas históricas. Los
ejercicios referenciados no pueden borrarse mientras exista historial.

El historial normal filtra `workout_sessions.status = 'completed'` y pagina por
`completed_at DESC, id DESC`. Cada elemento cuenta filas reales de
`workout_sets`; `target_sets` permanece como contexto del snapshot. La duración
se deriva de las fechas y no se almacena por separado.

El índice actual `(user_id, started_at DESC)` y la paginación acotada son
suficientes para el volumen inicial. No se agregó un índice específico de
`(user_id, status, completed_at, id)` sin evidencia de un plan deficiente; debe
revisarse con `EXPLAIN` y volumen representativo antes de escalar.

### Onboarding

El trigger de alta crea únicamente `profiles.id` y valores predeterminados. No
confía en `raw_user_meta_data`. Username, nombre visible, datos físicos, nivel y
objetivo pueden permanecer nulos hasta que el flujo de onboarding los solicite.
La unidad preferida comienza en kilogramos.

## Entidades

### `profiles`

Extiende `auth.users` uno a uno. El username es `citext`, único sin distinguir
mayúsculas, pero la aplicación lo normaliza y PostgreSQL exige entre 3 y 20
caracteres formados por letras ASCII minúsculas, números, punto o guion bajo.
Los datos físicos y personales son opcionales y privados.

### `muscle_groups`

Catálogo oficial de los siete macrogrupos visibles: Pecho, Espalda, Abdomen,
Tríceps, Bíceps, Hombros y Piernas. Mantiene UUID, nombre, slug estable y fecha
de creación. No almacena `body_region` porque esa columna duplicaba la nueva
jerarquía sin aportar una consulta necesaria para el MVP.

### `muscles`

Catálogo oficial de 26 músculos o zonas de entrenamiento. Cada fila pertenece
obligatoriamente a un macrogrupo mediante `muscle_group_id`; la FK con
`ON DELETE RESTRICT`, el slug globalmente único y la unicidad de nombre dentro
del macrogrupo impiden referencias huérfanas o duplicadas.

Esta clasificación está diseñada para navegar y analizar entrenamientos, no para
representar una taxonomía anatómica académica. Antebrazos se agrupa bajo Bíceps
como simplificación funcional de producto.

### `exercises`

Catálogo de ejercicios oficiales y personalizados. Incluye descripción,
instrucciones y errores comunes como arrays ordenados, dificultad, patrón de
movimiento e imagen opcional. Los slugs oficiales son globales; los
personalizados son únicos por creador. El equipamiento y los músculos se
resuelven exclusivamente mediante tablas de relación.

### `exercise_muscles`

Relación sin duplicados entre ejercicio y músculo específico. La participación
es `primary`, `secondary` o `stabilizer`. La clave primaria compuesta es
`(exercise_id, muscle_id)` y no se guarda `muscle_group_id`: el macrogrupo se
obtiene mediante `muscles`.

### `equipment`

Catálogo normalizado de 14 elementos de equipamiento con UUID, nombre y slug
globalmente único. Los usuarios autenticados pueden leerlo, pero no modificarlo.

### `exercise_equipment`

Relación ordenada sin duplicados entre ejercicio y equipamiento. La posición
comienza en uno y `position = 1` identifica el elemento principal para una card,
sin volver opcionales los restantes. Filtrar por equipamiento significa que el
elemento está incluido entre todos los requisitos del ejercicio.

### Patrones de movimiento

`movement_pattern` es un enum con 22 movimientos estables, desde empujes y
tracciones hasta bisagras, sentadillas, acciones articulares y trabajo del
tronco. Junto con músculos y equipamiento permite comparar ejercicios para
sustituciones o generación futura de rutinas sin almacenar reglas inteligentes
en esta fase.

### Transformación de la taxonomía anterior

La tercera migración crea los siete macrogrupos y los 26 músculos antes de
cambiar la FK. Si encuentra relaciones antiguas, conserva ejercicio y tipo de
participación y traduce cada slug legado a una zona representativa:

- pecho a Pectoral medio;
- espalda a Dorsal ancho;
- abdominales a Recto abdominal;
- tríceps y bíceps a sus respectivas cabezas largas;
- hombros a Deltoide lateral;
- antebrazos, cuádriceps, isquiotibiales, glúteos, pantorrillas y zona lumbar a
  sus zonas específicas equivalentes.

Esa precisión es un fallback determinista porque el modelo anterior no guardaba
porciones. La migración aborta si existe un grupo desconocido y nunca descarta
una relación silenciosamente. En `gymbro-dev`, `exercises` y
`exercise_muscles` estaban vacías antes de aplicarla.

### `routines`, `routine_days` y `routine_exercises`

Una rutina pertenece a un usuario y contiene días ordenados. Cada día puede
tener un weekday opcional, pero su posición secuencial es la regla principal.
Los ejercicios de rutina guardan orden, series objetivo, rango de repeticiones,
descanso, RIR objetivo opcional entre 0 y 5, y notas. Una restricción única
impide repetir el mismo ejercicio dentro de un día; puede utilizarse nuevamente
en otro día de la misma rutina.

Las posiciones comienzan en cero en todos los contenedores ordenados. Series y
repeticiones objetivo son positivas; el descanso admite entre 0 y 3600 segundos.
Las constraints de posición son diferibles para que los RPCs de reordenamiento
asignen una secuencia completa sin colisiones intermedias.

`append_routine_day` y `append_routine_exercise` calculan la siguiente posición
bajo bloqueo. `duplicate_routine_day` copia el día y todas sus prescripciones en
una transacción, deja `weekday` sin asignar y conserva orden, sets, reps,
descanso, RIR y notas. Todos estos RPCs usan `SECURITY INVOKER` y RLS.

### `workout_sessions`

Una sesión pertenece a un usuario y puede mantener una referencia opcional al
día de rutina. Sus estados son `in_progress`, `completed` y `cancelled`. Una
sesión activa no tiene `completed_at`; una completada debe tenerlo y no puede ser
anterior al inicio. `routine_name_snapshot`, `routine_day_name_snapshot` y
`snapshot_locked_at` preservan el contexto usado al comenzar.

`active_workout_exercise_id` conserva la selección del usuario sin alterar el
orden. `rest_ends_at` guarda la hora absoluta del descanso y
`rest_source_set_id` identifica la serie que lo inició. Restricciones y triggers
diferidos garantizan que esas referencias pertenezcan a la misma sesión.

### `workout_exercises`

Ordena los ejercicios realizados dentro de una sesión. La referencia a
`source_routine_exercise_id` es opcional y se limpia si cambia la planificación,
sin eliminar el ejercicio realizado. Nombre, orden, series, rango de
repeticiones, descanso y RIR objetivo se copian al iniciar la sesión y no
dependen después de la rutina. Las políticas, grants y triggers bloquean la
edición o eliminación directa del snapshot.

### `workout_sets`

Registra número de serie, kilogramos, repeticiones, RIR opcional, tipo y momento
de finalización obligatorio. El peso admite cero, RIR va de 0 a 10 y la clave
única `(workout_exercise_id, set_number)` impide repetir la misma serie.

Siete RPCs `SECURITY INVOKER` realizan las operaciones de Training Mode:
`start_workout`, `complete_workout_set`, `undo_last_workout_set`,
`extend_workout_rest`, `skip_workout_rest`, `select_workout_exercise` y
`finish_workout`. El inicio serializa por usuario y recupera una sesión activa
existente; completar una serie es idempotente y finaliza junto con el nuevo
descanso dentro de la misma transacción.

## Seguridad y RLS

Todas las tablas públicas tienen Row Level Security habilitado. El rol `anon` no
recibe permisos sobre ellas.

- `profiles`: el usuario autenticado sólo puede leer y actualizar su fila; no
  puede escribir identificadores ni marcas temporales.
- `muscle_groups`: lectura para usuarios autenticados, sin escrituras del
  cliente ordinario.
- `muscles`: lectura para usuarios autenticados, sin escrituras del cliente
  ordinario.
- `equipment`: lectura para usuarios autenticados, sin escrituras del cliente
  ordinario.
- `exercises`: lectura de oficiales y personalizados propios; sólo el creador
  puede escribir o eliminar un personalizado.
- `exercise_muscles`: lectura según visibilidad del ejercicio; las escrituras se
  limitan a ejercicios personalizados propios y no permiten modificar el
  catálogo de músculos.
- `exercise_equipment`: lectura según visibilidad del ejercicio; las escrituras
  se limitan a ejercicios personalizados propios y el catálogo permanece
  protegido.
- `routines`: CRUD limitado por `user_id`.
- `routine_days` y `routine_exercises`: la propiedad se comprueba recorriendo la
  rutina; también se valida que el ejercicio sea oficial o propio.
- `workout_sessions`: lectura propia; inicio, descanso, selección y finalización
  se realizan mediante RPCs para sesiones del usuario. El historial agrega un
  filtro explícito por usuario y estado, además de depender de RLS.
- `workout_exercises`: lectura histórica propia y creación restringida al
  snapshot atómico; no admite update o delete ordinarios.
- `workout_sets`: lectura histórica propia e inserción sólo mediante la operación
  protegida de una sesión activa; no admite update directo y Undo se limita a la
  última serie compatible.

No existen políticas generales `USING (true)` para información privada. El rol
`service_role` conserva acceso administrativo y nunca debe usarse en el
navegador.

En el proyecto remoto de desarrollo se comprobó mediante consultas de catálogo
que las 13 tablas tienen RLS habilitado y existen las 39 políticas versionadas.
El asesor de seguridad de Supabase no informó problemas. Además, la prueba
remota opt-in comprobó que dos usuarios bajo el rol `authenticated` sólo leen y
actualizan su propio perfil. La preparación administrativa y el cleanup ocurren
fuera de esas aserciones y toda la prueba RLS se revierte en una transacción.
Una segunda prueba opt-in confirmó CRUD propio, activación, duplicado, ambos
reordenamientos y bloqueo de lectura/escritura de rutinas entre dos usuarios;
también se revirtió por completo. Una tercera prueba transaccional confirmó
snapshot, inicio idempotente, series, descanso, finalización y aislamiento de
workouts entre dos usuarios sin usar `service_role`; finalizó con `ROLLBACK`.
pgTAP local sigue pendiente hasta disponer de Supabase local.

Las RPCs públicas de negocio permanecen como `SECURITY INVOKER`. Dos wrappers de
triggers diferidos del esquema `private` usan excepcionalmente
`SECURITY DEFINER`, `search_path` vacío y permisos revocados para comprobar la
integridad del snapshot atravesando un esquema no accesible al cliente.

## Trigger de perfil

`private.handle_new_user()` se ejecuta después de insertar en `auth.users`. Usa
`SECURITY DEFINER`, `search_path` vacío y un `INSERT ... ON CONFLICT DO NOTHING`.
Sólo crea el identificador del perfil y no procesa metadata controlable por el
usuario. Un fallo del trigger bloquearía el registro, por lo que está cubierto
por las pruebas locales de base y debe verificarse junto con autenticación.

La validación remota registró una cuenta real mediante `signUp()` usando la clave
pública, comprobó la relación `auth.users` → `profiles` y eliminó la cuenta al
finalizar. La confirmación de email estaba habilitada, por lo que el alta no
entregó una sesión inmediata, tal como espera la interfaz.

## Seed y tipos

`supabase/seed.sql` contiene macrogrupos y músculos;
`supabase/seeds/exercise-catalog.sql` contiene equipamiento, ejercicios y todas
sus relaciones. Ambos usan slugs como clave de idempotencia y no crean usuarios,
rutinas ni entrenamientos ficticios.

En local, `db reset` aplica el seed automáticamente después de las migraciones.
El `db push` remoto no lo aplica en el flujo ordinario. Para inicializar sólo el
proyecto remoto descartable de desarrollo se usa
`npm run supabase:remote:seed:dev`, protegido por destino, coincidencia del ref
vinculado y confirmación del dry-run. El seed nunca se aplica a producción.

En el proyecto remoto de desarrollo vinculado, las nueve migraciones están
aplicadas y el dry-run no informa cambios pendientes. El wrapper aplicó el seed
y una segunda ejecución quedó `upToDate`. La consulta versionada de sólo lectura
verificó 73 ejercicios, 14 elementos de equipamiento, 211 relaciones musculares,
95 relaciones de equipamiento y cero duplicados, huérfanos, ejercicios sin
`primary`, sin equipamiento o con contenido incompleto.

Después de aplicar migraciones se generan los tipos desde la misma base validada:

```bash
npm run supabase:types
npm run supabase:types:remote
```

Se ejecuta únicamente el comando correspondiente al modo activo. Ambos escriben
`src/types/database.generated.ts`; el archivo no debe editarse manualmente ni
reemplazarse por otra representación del esquema.

La versión actual de ese archivo fue generada desde el proyecto remoto real,
está codificada como UTF-8 sin BOM e incluye las 13 tablas, los 9 enums, los 6
RPCs de rutinas y los 7 RPCs de entrenamiento. Las migraciones posteriores
incorporan equipamiento y patrones, el constructor de rutinas y Training Mode sin
reescribir el historial ya aplicado.

Las pruebas pgTAP permanecen en `supabase/tests/database` y requieren Supabase
local con contenedores. El proyecto remoto de desarrollo no sustituye esa suite.

## Datos derivados

Historial, calendario, evolución por ejercicio y récords personales se calculan
desde sesiones finalizadas y series completadas. No tienen tablas propias en
esta fase.

El volumen por músculo sigue `exercise_muscles -> muscles`; el volumen por
macrogrupo agrega después `muscles -> muscle_groups`. Por ejemplo, Hip Thrust se
asocia a Glúteos y deriva Piernas. Esto permite mostrar simultáneamente totales
de Piernas y Glúteos sin guardar estadísticas redundantes.

Una futura preferencia de prioridad muscular podrá referenciar `muscles.id`
después de que el usuario elija un macrogrupo. No se crea esa entidad en esta
fase.

## Decisiones pendientes

- política y experiencia futura de recuperación de acceso;
- política de eliminación de cuenta y limpieza de ejercicios personalizados;
- ubicación persistente del estado de pausa y finalización del temporizador;
- proceso administrativo para cargar y mantener ejercicios oficiales;
- momento en que los ejercicios personalizados entrarán al alcance visible.
