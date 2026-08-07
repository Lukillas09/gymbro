# GymBro

GymBro es una aplicación web mobile-first orientada al entrenamiento de musculación, diseñada para organizar rutinas, registrar ejercicios, controlar descansos y analizar el progreso del usuario.

El objetivo del producto es funcionar como un compañero de entrenamiento: rápido durante la sesión, útil para progresar y motivador mediante la actividad de los GymBros del usuario.

## Estado del proyecto

El proyecto se encuentra en su fase inicial de definición y construcción de fundamentos.

Actualmente se está trabajando en:

- estructura del repositorio;
- documentación del producto;
- arquitectura inicial;
- configuración de calidad;
- integración continua.

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
coincide con la migración inicial versionada. El dry-run no informa cambios
pendientes. El seed protegido fue aplicado y una consulta de sólo lectura
confirmó los 12 grupos musculares esperados, con nombres y slugs únicos; una
segunda ejecución no produjo cambios y el contenido se mantuvo estable.

`src/types/database.generated.ts` fue generado desde ese esquema remoto real.
Esta validación temporal no reemplaza Supabase local: `supabase:reset` y las
pruebas pgTAP siguen pendientes hasta disponer de un runtime compatible con
contenedores.

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
