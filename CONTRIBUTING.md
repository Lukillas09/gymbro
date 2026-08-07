# Contribuir a GymBro

Este documento define las reglas básicas para trabajar en el repositorio de GymBro.

## Ramas

La rama `main` debe permanecer estable.

Cada cambio debe desarrollarse en una rama separada con un nombre descriptivo:

- `feat/nueva-funcionalidad`
- `fix/error-corregido`
- `docs/documentacion`
- `refactor/cambio-interno`
- `test/nombre-prueba`
- `chore/mantenimiento`

Ejemplos:

```text
feat/routine-editor
fix/rest-timer
docs/database-model
refactor/workout-service
test/workout-completion
chore/update-dependencies
```

## Commits

Usar Conventional Commits.

Ejemplos:

```text
feat: add routine editor
fix: preserve active workout after refresh
docs: document workout data model
test: cover completed workout calculation
refactor: extract progression service
chore: update dependencies
```

Tipos principales:

- `feat`: nueva funcionalidad.
- `fix`: corrección de un error.
- `docs`: cambios de documentación.
- `test`: creación o modificación de pruebas.
- `refactor`: reorganización interna sin cambiar el comportamiento.
- `chore`: configuración, dependencias o mantenimiento.
- `perf`: mejora de rendimiento.
- `style`: cambios de formato sin modificar la lógica.

## Antes de abrir un pull request

Ejecutar:

```bash
npm run format:check
npm run lint
npm run typecheck
npm run test:run
npm run build
```

También puede ejecutarse el comando completo:

```bash
npm run check
```

Si PowerShell bloquea `npm.ps1`, utilizar:

```powershell
npm.cmd run check
```

Los cambios que afecten rutas, navegación o flujos visibles también deben
ejecutar:

```bash
npm run test:e2e
```

Los cambios en migraciones, políticas RLS o seed requieren Docker activo y:

```bash
npm run supabase:reset
npm run supabase:test
npm run supabase:types
```

Revisar siempre el SQL generado antes de versionarlo. Las pruebas pgTAP no deben
marcarse como ejecutadas si no hubo un entorno local compatible con
contenedores.

### Proyecto remoto de desarrollo

El proyecto remoto es una alternativa temporal y manual cuando Docker no está
disponible. Debe ser separado, descartable y exclusivo para desarrollo. Nunca
vincular producción ni editar el esquema desde Dashboard.

El orden obligatorio es:

```bash
npx supabase login
npx supabase link --project-ref <PROJECT_REF>
npm run supabase:remote:dry-run
```

Después de revisar las migraciones del dry-run:

```powershell
$env:GYMBRO_SUPABASE_TARGET="development"
$env:GYMBRO_SUPABASE_DEV_PROJECT_REF="<PROJECT_REF>"
$env:GYMBRO_SUPABASE_DRY_RUN_REVIEWED="yes"
npm run supabase:remote:push
npm run supabase:types:remote
```

El seed no forma parte del push ordinario. `npm run supabase:remote:seed:dev` se
reserva para inicializar el proyecto descartable y exige las mismas guardas. No
ejecutar nunca `db reset --linked`.

Las comprobaciones funcionales de autenticación y RLS se ejecutan únicamente de
forma manual y opt-in:

```powershell
$env:GYMBRO_SUPABASE_TARGET="development"
$env:GYMBRO_SUPABASE_DEV_PROJECT_REF="<PROJECT_REF>"
$env:GYMBRO_SUPABASE_AUTH_TEST="run"
npm run supabase:remote:test:auth
```

La sesión también debe contener `NEXT_PUBLIC_SUPABASE_URL` y una publishable key
del mismo proyecto vinculado. El script crea y elimina una cuenta controlada;
sus aserciones de autorización se ejecutan con el rol `authenticated`, no con
`service_role`. Este comando nunca se agrega a `check` o CI.

Los project refs, tokens, contraseñas y variables de confirmación no se guardan
en el repositorio. `npm run check`, las pruebas unitarias y E2E deben seguir
funcionando sin credenciales de Supabase.

## Pull requests

Cada pull request debe:

- resolver una tarea concreta;
- evitar cambios no relacionados;
- explicar qué fue modificado;
- incluir pruebas cuando corresponda;
- actualizar la documentación;
- no contener secretos ni credenciales;
- pasar correctamente las validaciones del proyecto.

## Seguridad

Nunca subir archivos como:

```text
.env
.env.local
supabase/.temp
supabase/.branches
supabase/.env.keys
```

Las variables necesarias deben documentarse en:

```text
.env.example
```

Los placeholders de `.env.example` deben permanecer vacíos. Las claves secretas
y `service_role` son exclusivamente de servidor y nunca llevan el prefijo
`NEXT_PUBLIC_*`.

Los archivos locales de entorno deben usar UTF-8 sin BOM para ser compatibles
con Supabase CLI.
