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
├── src/
│   ├── app/
│   ├── components/
│   ├── features/
│   ├── hooks/
│   ├── lib/
│   └── types/
├── supabase/
│   └── migrations/
├── tests/
│   └── e2e/
├── .env.example
├── AGENTS.md
├── CONTRIBUTING.md
├── README.md
└── package.json
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

Las credenciales reales deben guardarse únicamente en:

```text
.env.local
```

El archivo `.env.local` nunca debe subirse al repositorio.

## Licencia

La licencia del proyecto todavía no fue definida.
