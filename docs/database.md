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
nivel, objetivo, unidad preferida, dificultad, participación muscular, estado de
sesión y tipo de serie. Incorporar un valor nuevo requiere una migración
explícita.

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
MVP. El creador puede administrarlo y asociarle músculos específicos.

La interfaz todavía no ofrece ejercicios personalizados. El esquema los deja
preparados sin hacerlos públicos ni incorporarlos al alcance funcional actual.

### Única rutina y sesión activa

Índices únicos parciales impiden más de una rutina activa y más de una sesión
`in_progress` por usuario. La aplicación deberá tratar una violación de unicidad
como señal para recuperar el registro activo existente.

### Historial estable

`workout_exercises` conserva el ejercicio realizado, los objetivos de series,
repeticiones y descanso, y una referencia opcional a la configuración de rutina
que lo originó. `workout_sets` conserva los valores realizados. Editar o borrar
la rutina original no altera esas filas históricas. Los ejercicios referenciados
no pueden borrarse mientras exista historial.

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
instrucciones, errores comunes, equipamiento, dificultad e imagen opcional. Los
slugs oficiales son globales; los personalizados son únicos por creador.

### `exercise_muscles`

Relación sin duplicados entre ejercicio y músculo específico. La participación
es `primary`, `secondary` o `stabilizer`. La clave primaria compuesta es
`(exercise_id, muscle_id)` y no se guarda `muscle_group_id`: el macrogrupo se
obtiene mediante `muscles`.

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
descanso y notas.

Las posiciones comienzan en cero en todos los contenedores ordenados. Series y
repeticiones objetivo son positivas; el descanso admite entre 0 y 3600 segundos.

### `workout_sessions`

Una sesión pertenece a un usuario y puede mantener una referencia opcional al
día de rutina. Sus estados son `in_progress`, `completed` y `cancelled`. Una
sesión activa no tiene `completed_at`; una completada debe tenerlo y no puede ser
anterior al inicio.

### `workout_exercises`

Ordena los ejercicios realizados dentro de una sesión. La referencia a
`source_routine_exercise_id` es opcional y se limpia si cambia la planificación,
sin eliminar el ejercicio realizado. Series, rango de repeticiones y descanso se
copian al iniciar la sesión y no dependen después de la rutina.

### `workout_sets`

Registra número de serie, kilogramos, repeticiones, RIR opcional, tipo y momento
de finalización. El peso admite cero, RIR va de 0 a 10 y no puede repetirse el
mismo `set_number` dentro de un ejercicio realizado.

## Seguridad y RLS

Todas las tablas públicas tienen Row Level Security habilitado. El rol `anon` no
recibe permisos sobre ellas.

- `profiles`: el usuario autenticado sólo puede leer y actualizar su fila; no
  puede escribir identificadores ni marcas temporales.
- `muscle_groups`: lectura para usuarios autenticados, sin escrituras del
  cliente ordinario.
- `muscles`: lectura para usuarios autenticados, sin escrituras del cliente
  ordinario.
- `exercises`: lectura de oficiales y personalizados propios; sólo el creador
  puede escribir o eliminar un personalizado.
- `exercise_muscles`: lectura según visibilidad del ejercicio; las escrituras se
  limitan a ejercicios personalizados propios y no permiten modificar el
  catálogo de músculos.
- `routines`: CRUD limitado por `user_id`.
- `routine_days` y `routine_exercises`: la propiedad se comprueba recorriendo la
  rutina; también se valida que el ejercicio sea oficial o propio.
- `workout_sessions`: lectura y creación propias; sólo una sesión activa puede
  actualizarse, aunque puede pasar a un estado terminal.
- `workout_exercises` y `workout_sets`: lectura histórica propia; las escrituras
  sólo se permiten mientras la sesión propietaria está activa.

No existen políticas generales `USING (true)` para información privada. El rol
`service_role` conserva acceso administrativo y nunca debe usarse en el
navegador.

En el proyecto remoto de desarrollo se comprobó mediante consultas de catálogo
que las 11 tablas tienen RLS habilitado y existen las 36 políticas versionadas.
El asesor de seguridad de Supabase no informó problemas. Además, la prueba
remota opt-in comprobó que dos usuarios bajo el rol `authenticated` sólo leen y
actualizan su propio perfil. La preparación administrativa y el cleanup ocurren
fuera de esas aserciones y toda la prueba RLS se revierte en una transacción.
pgTAP local sigue pendiente hasta disponer de Supabase local.

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

`supabase/seed.sql` sólo contiene datos oficiales mínimos y usa el slug como
clave de idempotencia. No crea usuarios ni entrenamientos ficticios.

En local, `db reset` aplica el seed automáticamente después de las migraciones.
El `db push` remoto no lo aplica en el flujo ordinario. Para inicializar sólo el
proyecto remoto descartable de desarrollo se usa
`npm run supabase:remote:seed:dev`, protegido por destino, coincidencia del ref
vinculado y confirmación del dry-run. El seed nunca se aplica a producción.

En el proyecto remoto de desarrollo vinculado, las tres migraciones están
aplicadas y el dry-run no informa cambios pendientes. El wrapper aplicó el seed
y una consulta de sólo lectura verificó exactamente 7 macrogrupos, 26 músculos,
slugs únicos y ninguna referencia huérfana o duplicada.

Después de aplicar migraciones se generan los tipos desde la misma base validada:

```bash
npm run supabase:types
npm run supabase:types:remote
```

Se ejecuta únicamente el comando correspondiente al modo activo. Ambos escriben
`src/types/database.generated.ts`; el archivo no debe editarse manualmente ni
reemplazarse por otra representación del esquema.

La versión actual de ese archivo fue generada desde el proyecto remoto real,
está codificada como UTF-8 sin BOM e incluye las 11 tablas y los 8 enums. La
tercera migración incorpora `muscles`, reemplaza
`exercise_muscles.muscle_group_id` por `muscle_id` y elimina `body_region`.

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
