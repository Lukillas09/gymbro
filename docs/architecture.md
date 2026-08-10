# Arquitectura de GymBro

## Estado

Arquitectura inicial del MVP. El alcance funcional está definido en
[`mvp.md`](mvp.md), la navegación en [`navigation.md`](navigation.md) y las
entidades y decisiones PostgreSQL en [`database.md`](database.md).

## Aplicación

GymBro es una aplicación web mobile-first construida con Next.js App Router,
React, TypeScript estricto y Tailwind CSS. Supabase proporciona autenticación y
PostgreSQL.

Storage y eventos en tiempo real no son requisitos del MVP actual y no deben
incorporarse hasta que una funcionalidad aprobada los necesite.

## Dominios del MVP

- **Autenticación:** registro, sesión y cierre de sesión.
- **Perfil:** identidad visible mínima del usuario.
- **Ejercicios:** catálogo común, búsqueda, filtros y detalle técnico.
- **Rutinas:** rutinas, días, ejercicios y objetivos.
- **Entrenamientos:** sesión activa, series y descanso.
- **Home:** composición contextual derivada de rutinas y entrenamientos.
- **Progreso:** historial, calendario, evolución y récords derivados.

Los dominios sociales quedan fuera del MVP y no condicionan esta arquitectura.

## Responsabilidades del repositorio

### `src/app`

Rutas, layouts, páginas, carga de datos y composición general. Los cinco destinos
principales son Inicio, Rutinas, Entrenar, Progreso y Perfil.

### `src/features`

Lógica organizada por dominio. Cada dominio puede contener componentes propios,
validaciones, servicios y tipos locales sin exponer detalles internos a otros
dominios.

### `src/components/ui`

Componentes visuales reutilizables y sin reglas de negocio específicas.

### `src/lib`

Clientes externos, validaciones compartidas, autorización y utilidades sin
propietario de dominio claro.

`src/lib/supabase` contiene clientes separados para navegador y servidor. Ambos
leen una configuración pública validada de forma centralizada. El cliente de
servidor adapta el almacén de cookies de App Router; el navegador no importa ni
conoce claves secretas.

### `src/hooks`

Hooks verdaderamente compartidos. Los hooks específicos permanecen dentro de su
dominio.

### `src/types`

Tipos compartidos entre varios dominios. No reemplaza los tipos locales ni los
tipos generados desde servicios externos.

`src/types/database.generated.ts` se genera desde PostgreSQL local mediante
`npm run supabase:types` o desde el proyecto de desarrollo vinculado mediante
`npm run supabase:types:remote`. Ambos comandos escriben el mismo archivo UTF-8
de forma atómica. No se mantiene una copia manual o alternativa del esquema.

`src/features/exercises` concentra tipos de dominio, etiquetas, normalización,
filtros, agrupación y consultas del catálogo. Las páginas de App Router cargan
datos en servidor; el componente interactivo filtra localmente el conjunto
curado de 73 ejercicios para evitar solicitudes por cada cambio de control.

`src/features/routines` concentra tipos, validación de formularios, cálculo de
series por macrogrupo, queries y Server Actions. Las páginas resuelven la sesión
en servidor y las operaciones multirregistro delegan atomicidad a funciones
PostgreSQL `SECURITY INVOKER` protegidas por RLS.

`src/features/workouts` concentra el estado derivado, prefill, comparación
factual, countdown, queries, Server Actions y componentes de Training Mode. La
ruta `/workout` prepara o recupera; `/workout/[id]` activa una composición LIVE
sin navegación global y conserva PostgreSQL como fuente de verdad.

`src/features/home` concentra el modelo exhaustivo `HomeState`, fecha local,
resolución de días, resumen semanal, Bro Cue y consultas de Inicio. La página
`/` permanece como Server Component; sólo el selector de día en `READY` y la
duración viva de `TRAINING` necesitan estado en cliente.

### `supabase/migrations`

Migraciones PostgreSQL versionadas y fuente de verdad del esquema. El seed
idempotente vive en `supabase/seed.sql` y las pruebas pgTAP en
`supabase/tests/database`.

## Integración con Supabase

- `@supabase/ssr` administra sesiones basadas en cookies para App Router.
- `@supabase/supabase-js` proporciona el cliente base.
- El CLI local se ejecuta desde npm y necesita Docker.
- La configuración local versionada no contiene identificadores remotos ni
  secretos.
- Realtime, Storage, Analytics y Edge Functions están desactivados localmente
  porque no pertenecen a esta fase.
- `src/proxy.ts` sigue la convención de Next.js 16 y renueva las cookies de
  sesión mediante `getClaims()`. No reemplaza la autorización de servidor o RLS.

Existen dos modos operativos claramente separados:

- **Local:** modo preferido para desarrollo reproducible, reset, seed y pruebas
  pgTAP. Requiere un runtime compatible con contenedores.
- **Remoto de desarrollo:** alternativa temporal cuando Docker no funciona. Usa
  un proyecto separado, descartable y nunca productivo. Sólo recibe migraciones
  después de un dry-run revisado y no participa de CI ni `npm run check`.

En ambos modos, `supabase/migrations` es la única fuente de verdad. No se aceptan
cambios de esquema hechos manualmente desde Dashboard. Está prohibido ejecutar
`db reset --linked`; el vínculo local, project ref, credenciales y tokens nunca
se versionan.

La fundación se verificó contra el proyecto remoto de desarrollo vinculado: las
nueve migraciones están aplicadas, el seed contiene 7 macrogrupos, 26 músculos,
73 ejercicios y 14 elementos de equipamiento, y los tipos se generaron desde el
esquema remoto real. Una prueba
opt-in confirmó el registro, el trigger de perfil y el aislamiento básico de RLS
con dos usuarios controlados. pgTAP local continúa pendiente y esta comprobación
no convierte el proyecto en producción ni sustituye el entorno reproducible.

La variable pública preferida es `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, con
fallback temporal a `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Las claves
`SUPABASE_SECRET_KEY` y `SUPABASE_SERVICE_ROLE_KEY` son sólo de servidor y no se
consumen en autenticación, onboarding ni en la aplicación actual.

## Autenticación SSR

- Registro, login y onboarding usan Server Actions como autoridad y validadores
  puros compartidos para respuesta inmediata en el navegador.
- `@supabase/ssr` almacena la sesión en cookies. El Proxy propaga cookies y
  headers de renovación tanto al request como al navegador.
- `getClaims()` valida la identidad en Proxy, layouts, acciones y callback. No se
  utiliza el contenido de `getSession()` como autorización.
- El layout público redirige usuarios autenticados a onboarding o Inicio. El
  layout privado exige sesión y perfil completo antes de montar `AppShell`.
- El onboarding se infiere desde username, nombre visible, nivel, objetivo y
  unidad; no necesita una bandera persistida adicional.
- El callback `/auth/confirm` admite el intercambio PKCE por `code` y la
  verificación SSR por `token_hash`. Todos los destinos externos son rechazados.
- Logout invalida la sesión local, revalida el árbol y redirige a `/login`.

## Navegación y composición

- El acceso público contiene registro e inicio de sesión; el callback de correo
  sólo intercambia o verifica la credencial recibida.
- Onboarding exige sesión válida pero se renderiza fuera del shell privado.
- La aplicación autenticada contiene la navegación principal definida en
  [`navigation.md`](navigation.md).
- `Entrenar` resuelve primero una sesión activa y, si no existe, el día que se
  desea iniciar.
- `Progreso` compone historial, calendario y evolución sin duplicar sus datos de
  origen.

### Home adaptativo

Home deriva, sin persistir banderas de interfaz, un estado con esta precedencia:
sesión activa, sesión completada hoy, ausencia de rutina, día programado hoy y
descanso verificable. El calendario sólo es determinista cuando todos los días
entrenables tienen `weekday`; cualquier calendario parcial produce `READY` con
selección manual.

Las comparaciones de “hoy”, el rango semanal y el siguiente día usan
`America/Argentina/Buenos_Aires`. El siguiente entrenamiento recorre los
weekdays futuros dentro del ciclo semanal y no se muestra como dato cierto si
el calendario está incompleto.

La carga inicial resuelve perfil, sesión activa, rutina activa y sesiones de la
semana en consultas de servidor paralelas. Sólo `READY` consulta el historial
reciente del primer ejercicio sugerido y sólo `COMPLETED` carga un conjunto
acotado de sesiones comparables. No existe N+1 por ejercicio ni se descarga el
historial completo.

La ruta es dinámica y consulta PostgreSQL en cada request. Las Server Actions de
rutinas y entrenamientos revalidan `/` además de sus rutas propias para limpiar
el Router Cache después de una mutación. Los componentes no mantienen una copia
cliente del estado general de Home.

## Taxonomía muscular

`muscle_groups` contiene solamente los siete macrogrupos que organizan la
experiencia del usuario. `muscles` contiene las 26 zonas específicas y
`exercise_muscles` relaciona cada ejercicio directamente con ellas, incluyendo
su participación primaria, secundaria o estabilizadora.

El recorrido de datos es:

```text
exercises -> exercise_muscles -> muscles -> muscle_groups
```

El volumen de un músculo se agrega desde sus ejercicios y series; el volumen de
un macrogrupo agrega los músculos que le pertenecen. Así pueden coexistir, por
ejemplo, `Piernas: 42 series` y `Glúteos: 18 series` sin almacenar estadísticas
duplicadas.

Una futura preferencia podrá apuntar directamente a `muscles.id` para priorizar
Glúteos dentro de Piernas sin cambiar el catálogo. Esa preferencia no se
implementa en esta fase.

La clasificación es deliberadamente funcional y no pretende cubrir una anatomía
académica completa. Antebrazos se ubica bajo Bíceps para simplificar la
navegación del producto.

## Clasificación de ejercicios

Cada ejercicio oficial combina tres dimensiones sin duplicarlas:

```text
movement_pattern + exercise_muscles + exercise_equipment
```

`movement_pattern` describe la mecánica estable del gesto; los músculos expresan
participación principal, secundaria o estabilizadora; el equipamiento enumera
todos los elementos requeridos y usa `position = 1` para presentación principal.
Esta combinación permite comparar ejercicios para sustituciones o generar
rutinas en el futuro sin implementar todavía esas decisiones automáticas.

Las instrucciones y errores comunes se almacenan como arrays ordenados de texto,
una forma tipada y suficiente para listas breves. El catálogo se carga desde dos
seeds ordenados: taxonomía base y `seeds/exercise-catalog.sql`.

## Planificación de rutinas

La planificación sigue este recorrido:

```text
Routine -> Routine Day -> Routine Exercise -> Exercise Catalog
```

`routine_exercises` contiene una prescripción reutilizable: series objetivo,
rango de repeticiones, descanso y RIR objetivo opcional. No copia nombre,
músculos, patrón ni equipamiento del catálogo. Activación, append, duplicado y
reordenamiento tienen RPCs transaccionales; los controles móviles de subir y
bajar envían el orden completo para evitar estados parciales.

El resumen muscular se deriva al leer y suma `target_sets` una sola vez por
macrogrupo `primary` y prescripción. No se persiste ni atribuye peso arbitrario a
participaciones secundarias o estabilizadoras.

Planificar `4 × 8–10` no equivale a completar una serie. Training Mode captura un
snapshot y guarda resultados como `80 kg × 10` en sus propias tablas,
conservando el historial aunque cambie o se archive la rutina.

## Persistencia del entrenamiento activo

- PostgreSQL es la fuente de verdad de una sesión activa.
- Solo puede existir una sesión activa por usuario.
- Cada serie confirmada debe persistirse antes de comunicarse como guardada.
- La recarga consulta la sesión activa y reconstruye el estado desde el servidor.
- El temporizador se recupera usando una hora de finalización persistida; no se
  confía únicamente en un contador en memoria.
- La aplicación puede conservar estado local para respuesta inmediata, pero ese
  estado no reemplaza la persistencia ni la autorización del servidor.
- `start_workout` serializa inicios por usuario, recupera la sesión existente y
  bloquea un snapshot completo antes del commit.
- `active_workout_exercise_id` conserva el ejercicio elegido sin modificar el
  orden de la rutina. `rest_source_set_id` vincula Undo con el descanso iniciado.
- Completar series, Undo, extensión, salto y finalización se ejecutan mediante
  RPCs transaccionales `SECURITY INVOKER`.
- `TrainingState` se deriva como `setup`, `live`, `resting` o `completed`; no se
  persisten booleanos de interfaz incompatibles.

## Historial estable y datos derivados

- Una sesión captura el plan usado al iniciarse para que editar una rutina no
  modifique el historial.
- Calendario, evolución y récords se calculan desde sesiones finalizadas y series
  completadas.
- No se crean entidades persistentes para métricas que puedan derivarse de forma
  confiable en esta fase.

## Seguridad

- La autorización se valida en servidor y PostgreSQL.
- Toda información privada utiliza Row Level Security.
- Macrogrupos, músculos, equipamiento y ejercicios oficiales son catálogos de
  sólo lectura para el cliente común.
- Las claves de servicio se usan solo en contexto de servidor.
- Las tablas hijas validan propiedad recorriendo su rutina o sesión.
- Las escrituras de ejercicios personalizados se limitan a su creador; los
  ejercicios oficiales no admiten escrituras ordinarias.
- Los datos externos se validan antes de entrar a la lógica de dominio.
- Los logs no contienen tokens, correos ni datos privados de entrenamiento.
- Dos wrappers privados de triggers diferidos usan `SECURITY DEFINER` con
  `search_path` vacío y permisos revocados. Esta excepción sólo permite validar
  integridad dentro del esquema `private`; las RPC de negocio siguen siendo
  `SECURITY INVOKER`.

## Calidad y experiencia

- El diseño se verifica desde 320 píxeles de ancho y evita scroll horizontal.
- Los controles táctiles, estados accesibles y flujos de error siguen los
  criterios de [`mvp.md`](mvp.md).
- Los componentes visuales no contienen reglas de negocio complejas.
- Los flujos críticos de autenticación, rutina, entrenamiento y recuperación
  requieren pruebas automatizadas.
- CI valida formato, lint, tipos, pruebas y build antes de integrar cambios.
- Playwright usa un mock HTTP local de Auth y PostgREST para recorrer login SSR,
  rutas privadas, biblioteca, rutinas y Training Mode sin depender del proyecto
  remoto ni debilitar la autorización de producción. El mock aísla cuentas, pero
  no se usa para afirmar que RLS funciona.

## Complejidad postergada

- capa social y permisos entre usuarios;
- eventos en tiempo real;
- recomendaciones inteligentes;
- métricas avanzadas o precalculadas;
- almacenamiento multimedia;
- soporte offline completo;
- abstracciones para aplicaciones móviles nativas.
