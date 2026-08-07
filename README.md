# GymBro

GymBro es una aplicación web mobile-first orientada al entrenamiento de musculación, diseñada para organizar rutinas, registrar ejercicios, controlar descansos y analizar el progreso del usuario.

El objetivo del producto es funcionar como un compañero de entrenamiento: rápido durante la sesión, útil para progresar y motivador mediante la actividad de los GymBros del usuario.

## Estado del proyecto

El proyecto se encuentra en la fase de fundamentos funcionales del MVP.

Actualmente están implementados el shell mobile-first, la fundación PostgreSQL,
la autenticación por correo y contraseña, el onboarding y la protección de
rutas. La biblioteca inicial permite explorar 73 ejercicios oficiales, buscar,
filtrar y consultar su técnica, músculos y equipamiento. El constructor de
rutinas permite crear planes, ordenar días y ejercicios, definir prescripciones,
duplicar días, activar una rutina y revisar su distribución muscular. El modo
Entrenar permite elegir un día activo, registrar series con prefill, recuperar
la sesión tras recargar, controlar descansos persistentes, cambiar de ejercicio,
deshacer la última serie y finalizar con un resumen factual.

## Funcionalidades planificadas

### MVP

- Registro e inicio de sesión.
- Perfil de usuario.
- Biblioteca de ejercicios.
- Creación y edición de rutinas.
- Registro de series, repeticiones y peso.
- Temporizador de descanso.
- Historial de entrenamientos.
- Calendario de asistencia.
- Estadísticas básicas de progreso.

### Funcionalidades futuras

- Recomendaciones automáticas de progresión.
- Generación de rutinas.
- Sistema de GymBros.
- Actividad de amigos en tiempo real.
- Logros e insignias.
- Retos y comparaciones entre amigos.
- Estadísticas avanzadas.

## Stack inicial

- Next.js.
- React.
- TypeScript.
- Tailwind CSS.
- Supabase.
- PostgreSQL.
- GitHub Actions.
- Vercel.

## Requisitos

Para ejecutar el proyecto localmente se necesita:

- Node.js 24.
- npm.
- Git.
- Docker Desktop o un runtime compatible para Supabase local.

Para administrar el repositorio también se recomienda:

- GitHub CLI.
- Visual Studio Code.

## Instalación local

Clonar el repositorio:

```bash
git clone URL_DEL_REPOSITORIO
```

Entrar en la carpeta:

```bash
cd gymbro
```

Instalar las dependencias:

```bash
npm ci
```

Crear el archivo de variables de entorno:

```powershell
Copy-Item .env.example .env.local
```

Iniciar el servidor de desarrollo:

```bash
npm run dev
```

Abrir la aplicación en:

```text
http://localhost:3000
```

## Autenticación y onboarding

GymBro usa sesiones SSR de Supabase almacenadas en cookies. `src/proxy.ts`
renueva tokens con `getClaims()` y realiza la redirección optimista; los layouts
de servidor vuelven a verificar la sesión y el perfil, mientras PostgreSQL
mantiene la autorización mediante RLS.

Las rutas `/login` y `/register` son públicas. Inicio, Rutinas, Entrenar,
Progreso y Perfil requieren sesión y onboarding completo. Un perfil se considera
completo cuando tiene `username`, `display_name`, `training_level`,
`primary_goal` y `preferred_weight_unit`.

En Supabase Auth debe configurarse:

```text
Site URL: http://localhost:3000
Redirect URL: http://localhost:3000/auth/confirm
```

Se debe usar un solo origen durante cada prueba. Si la aplicación se abre como
`http://127.0.0.1:3000`, agregar también
`http://127.0.0.1:3000/auth/confirm` a Redirect URLs. En desarrollo, GymBro usa
el origin loopback real de la solicitud cuando sólo cambia `localhost` por
`127.0.0.1`; en producción siempre prevalece `NEXT_PUBLIC_APP_URL`.

Cada despliegue debe agregar su URL exacta equivalente. Para confirmación SSR
con token hash, la plantilla `Confirm signup` puede dirigir a:

```text
{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next=/onboarding
```

Con confirmación habilitada, el registro pide revisar el correo y la ruta de
confirmación crea la sesión antes del onboarding. Si está deshabilitada en un
entorno de desarrollo, el registro obtiene sesión y redirige directamente a
`/onboarding`.

El proveedor de correo integrado de Supabase tiene un cupo bajo y puede devolver
`over_email_send_rate_limit`. GymBro conserva ese diagnóstico sólo en logs de
desarrollo y muestra un mensaje neutral. Para probar registros de forma sostenida
en el proyecto remoto de desarrollo se debe configurar un SMTP de pruebas; como
alternativa temporal, esperar a que se renueve el cupo.

## Taxonomía muscular

El catálogo separa siete macrogrupos visibles de los 26 músculos o zonas
específicas que se asocian a ejercicios:

```text
muscle_groups -> muscles -> exercise_muscles -> exercises
```

Los macrogrupos son Pecho, Espalda, Abdomen, Tríceps, Bíceps, Hombros y
Piernas. `exercise_muscles` guarda solamente `muscle_id`; cualquier estadística
por macrogrupo se obtiene recorriendo `muscles.muscle_group_id`, sin persistir
una segunda clasificación redundante.

Esta es una taxonomía funcional para una aplicación de entrenamiento, no una
clasificación anatómica académica completa. Antebrazos se agrupa bajo Bíceps por
una decisión de navegación simplificada del producto.

## Biblioteca de ejercicios

La ruta privada `/exercises` presenta el catálogo oficial con búsqueda por
nombre y filtros combinables por macrogrupo, músculo específico y equipamiento.
Cada detalle muestra dificultad, patrón de movimiento, todo el equipamiento
requerido, participación muscular, pasos de técnica y errores comunes.

El catálogo versionado contiene 73 ejercicios y 14 elementos de equipamiento.
Un filtro de equipamiento significa que el ejercicio incluye ese elemento entre
sus requisitos; la ficha siempre muestra el conjunto completo. Rutinas ofrece el
acceso `Explorar ejercicios` sin agregar una sexta pestaña principal.

`movement_pattern`, `exercise_muscles` y `exercise_equipment` forman una base
tipada para sustituciones y generación de rutinas futuras. Esas funciones no se
implementan en esta fase.

## Rutinas

La ruta privada `/routines` separa la rutina activa de las demás y permite crear
una nueva desde `/routines/new`. La vista `/routines/[id]` presenta el plan y un
resumen de series objetivo asociadas a músculos `primary`; el editor
`/routines/[id]/edit` administra días, ejercicios y orden sin depender de
drag-and-drop.

Cada prescripción conserva series, rango de repeticiones, descanso y RIR objetivo
opcional. El mismo ejercicio puede aparecer en días distintos, pero no dos veces
en el mismo día. Activación, duplicado y reordenamiento usan funciones PostgreSQL
atómicas bajo la sesión autenticada y RLS.

Una prescripción como `4 × 8–10, descanso 120 s, RIR 2` no representa un
resultado realizado. Peso, repeticiones completadas y RIR real pertenecerán a
`workout_sets`; los entrenamientos ya iniciados conservan una copia estable del
plan aunque posteriormente cambie o se archive la rutina.

## Modo Entrenar

`/workout` recupera automáticamente una sesión activa o permite elegir un día
de la rutina activa. `/workout/[id]` reduce la navegación global y concentra
ejercicio, serie, peso, repeticiones y descanso en una experiencia LIVE.

Iniciar es idempotente y captura nombres, orden y objetivos. Completar una serie
persiste el resultado antes de mostrarlo, inicia descanso mediante un timestamp
absoluto y evita duplicados por ejercicio y número de serie. `+15 s`, `Saltar`,
cambio de ejercicio y Undo también se guardan mediante RPCs transaccionales.

La referencia `Última vez`, el prefill y mejoras como `+1 REP` se derivan de
sesiones completadas reales. No se generan recomendaciones, PRs, Session
Capsules ni puntuaciones opacas en esta fase.

## Supabase local

El CLI se instala como dependencia de desarrollo. Con Docker activo, iniciar la
plataforma local y aplicar migraciones y seed:

```bash
npm run supabase:start
npm run supabase:reset
```

Ejecutar las pruebas PostgreSQL y regenerar los tipos TypeScript:

```bash
npm run supabase:test
npm run supabase:types
```

Detener los servicios locales sin borrar sus datos:

```bash
npm run supabase:stop
```

`supabase:reset` reconstruye la base local y elimina sus datos. No debe usarse
con `--linked` bajo ninguna circunstancia del flujo de GymBro.

Las pruebas pgTAP requieren este modo y permanecen pendientes mientras no exista
un runtime compatible con contenedores.

## Supabase remoto de desarrollo

Mientras Docker no funcione, puede utilizarse temporalmente un proyecto Supabase
separado, descartable y exclusivo para desarrollo. Nunca debe vincularse un
proyecto de producción ni modificarse el esquema manualmente desde Dashboard:
`supabase/migrations` continúa siendo la única fuente de verdad.

Crear el proyecto de desarrollo desde Supabase y ejecutar manualmente:

```bash
npx supabase login
npx supabase link --project-ref <PROJECT_REF>
npm run supabase:remote:dry-run
```

Revisar el dry-run y las migraciones pendientes. Antes de aplicar cambios, la
terminal debe declarar explícitamente el destino esperado:

```powershell
$env:GYMBRO_SUPABASE_TARGET="development"
$env:GYMBRO_SUPABASE_DEV_PROJECT_REF="<PROJECT_REF>"
$env:GYMBRO_SUPABASE_DRY_RUN_REVIEWED="yes"
npm run supabase:remote:push
npm run supabase:types:remote
```

`db push` no aplica `supabase/seed.sql` por defecto. Sólo para inicializar ese
proyecto de desarrollo descartable, y después del push revisado, ejecutar:

```powershell
npm run supabase:remote:seed:dev
```

El script de seed comprueba que el destino sea `development`, que el ref esperado
coincida con el proyecto vinculado y que el dry-run haya sido marcado como
revisado. No debe utilizarse con producción. Al terminar, limpiar las variables
transitorias y ejecutar las validaciones normales:

```powershell
Remove-Item Env:GYMBRO_SUPABASE_TARGET
Remove-Item Env:GYMBRO_SUPABASE_DEV_PROJECT_REF
Remove-Item Env:GYMBRO_SUPABASE_DRY_RUN_REVIEWED
npm run check
npm run test:e2e
```

El login, el vínculo y los comandos remotos son siempre manuales. Ninguno forma
parte de `npm run check` o CI. No deben guardarse project refs, contraseñas,
tokens ni las variables transitorias en el repositorio o `.env.example`.

### Estado verificado de la fundación remota

El proyecto remoto exclusivo de desarrollo está vinculado y su historial
coincide con las nueve migraciones versionadas. El dry-run no informa cambios
pendientes. El seed protegido fue aplicado y una consulta de sólo lectura
confirmó 7 macrogrupos, 26 músculos específicos, 73 ejercicios, 14 elementos de
equipamiento y ausencia de duplicados, relaciones huérfanas o ejercicios
oficiales incompletos.

La validación auth remota confirmó un registro real con email pendiente de
confirmación, la creación automática de `profiles` y el aislamiento RLS entre
dos usuarios controlados. Los datos se eliminaron al finalizar.

`src/types/database.generated.ts` fue generado desde ese esquema remoto real.
Una prueba transaccional opt-in comprobó creación, activación única, duplicado,
reordenamiento y aislamiento RLS de rutinas entre dos usuarios; todos sus datos
se revirtieron al finalizar.
Otra prueba transaccional verificó inicio idempotente, snapshot, series,
descanso, finalización y aislamiento RLS de workouts; también terminó con
`ROLLBACK` y sin residuos.
Esta validación temporal no reemplaza Supabase local: `supabase:reset` y las
pruebas pgTAP siguen pendientes hasta disponer de un runtime compatible con
contenedores.

La prueba remota de auth es manual, destructiva sólo sobre su usuario temporal y
no forma parte de `check` o CI. Requiere las variables públicas de Supabase en la
sesión y estas guardas transitorias:

```powershell
$env:GYMBRO_SUPABASE_TARGET="development"
$env:GYMBRO_SUPABASE_DEV_PROJECT_REF="<PROJECT_REF>"
$env:GYMBRO_SUPABASE_AUTH_TEST="run"
npm run supabase:remote:test:auth
```

El script exige que la URL pública corresponda al proyecto vinculado, ejecuta
las aserciones RLS como `authenticated` y limpia la cuenta creada. Nunca debe
ejecutarse contra producción.

## Comandos disponibles

Iniciar el entorno de desarrollo:

```bash
npm run dev
```

Ejecutar ESLint:

```bash
npm run lint
```

Comprobar los tipos de TypeScript:

```bash
npm run typecheck
```

Ejecutar pruebas unitarias y de componentes una vez:

```bash
npm run test:run
```

Ejecutar pruebas unitarias en modo interactivo:

```bash
npm run test
npm run test:watch
```

Ejecutar pruebas end-to-end:

```bash
npm run test:e2e
```

Playwright usa un mock local y efímero de los endpoints mínimos de Supabase para
probar login SSR, la biblioteca y el constructor de rutinas sin credenciales ni
red remota. Cada login de prueba mantiene datos aislados y efímeros. Este mock
sólo se inicia desde la configuración E2E, no demuestra RLS y no participa de la
aplicación desplegada.

La validación remota de workouts es manual, permanece fuera de CI y exige el
destino de desarrollo y el project ref vinculado:

```powershell
$env:GYMBRO_SUPABASE_TARGET="development"
$env:GYMBRO_SUPABASE_DEV_PROJECT_REF="<PROJECT_REF>"
npm run supabase:remote:test:workouts
```

El SQL crea únicamente datos controlados dentro de una transacción y ejecuta
`ROLLBACK`. Nunca debe apuntarse a producción.

Abrir la interfaz de Playwright:

```bash
npm run test:e2e:ui
```

La primera ejecución local de Playwright requiere instalar Chromium fuera del
repositorio:

```bash
npx playwright install chromium
```

Formatear los archivos:

```bash
npm run format
```

Verificar el formato:

```bash
npm run format:check
```

Generar la compilación de producción:

```bash
npm run build
```

Ejecutar todas las validaciones del proyecto:

```bash
npm run check
```

## Estructura principal

```text
gymbro/
├── .github/
│   ├── ISSUE_TEMPLATE/
│   └── workflows/
├── docs/
│   └── decisions/
├── public/
├── scripts/
├── src/
│   ├── app/
│   ├── components/
│   ├── features/
│   ├── hooks/
│   ├── lib/
│   └── types/
├── supabase/
│   ├── migrations/
│   ├── tests/database/
│   ├── config.toml
│   └── seed.sql
├── tests/
│   ├── e2e/
│   ├── setup/
│   └── unit/
├── .env.example
├── AGENTS.md
├── CONTRIBUTING.md
├── playwright.config.ts
├── README.md
├── package.json
└── vitest.config.mts
```

## Documentación

- `docs/product.md`: visión, público objetivo y alcance.
- `docs/roadmap.md`: fases de desarrollo.
- `docs/architecture.md`: arquitectura y responsabilidades.
- `docs/database.md`: modelo de datos.
- `docs/decisions/`: decisiones técnicas relevantes.
- `AGENTS.md`: instrucciones para Codex y otros agentes.
- `CONTRIBUTING.md`: reglas para ramas, commits y pull requests.

## Flujo de trabajo

La rama `main` debe permanecer estable.

Cada funcionalidad se desarrolla en una rama independiente:

```text
feat/nombre-funcionalidad
fix/nombre-error
docs/nombre-documentacion
refactor/nombre-cambio
chore/nombre-tarea
```

Ejemplo:

```bash
git switch main
git pull
git switch -c feat/routine-editor
```

Antes de subir cambios:

```bash
npm run check
```

## Convención de commits

El proyecto utiliza Conventional Commits:

```text
feat: add routine creation flow
fix: preserve active workout after refresh
docs: define initial database model
test: cover workout completion
refactor: extract progression service
chore: configure continuous integration
```

## Variables de entorno

Las variables necesarias se documentan en:

```text
.env.example
```

Para clientes públicos se prefiere `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
`NEXT_PUBLIC_SUPABASE_ANON_KEY` se admite únicamente como compatibilidad con
proyectos que todavía usan claves JWT heredadas.

`NEXT_PUBLIC_APP_URL` define el origen permitido para el callback de
confirmación. Debe ser una URL HTTP(S) exacta y coincidir con la configuración de
Supabase Auth. Reiniciar `next dev` después de cambiar variables de entorno.

`SUPABASE_SECRET_KEY` y `SUPABASE_SERVICE_ROLE_KEY` son alternativas de servidor
y no deben importarse desde Client Components ni exponerse con prefijo
`NEXT_PUBLIC_*`. Ninguna clave privada se usa todavía en el código de la
aplicación.

Las credenciales reales deben guardarse únicamente en:

```text
.env.local
```

El archivo `.env.local` nunca debe subirse al repositorio.
Debe guardarse como UTF-8 sin BOM para que Supabase CLI pueda interpretarlo.

Tampoco deben versionarse `supabase/.temp`, `supabase/.branches`, `.env.keys`,
volúmenes de Docker ni credenciales producidas por el CLI.

`.env.local` permanece exclusivamente local tanto con Supabase local como con el
proyecto remoto de desarrollo.

## Licencia

La licencia del proyecto todavía no fue definida.
