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
```

Las variables necesarias deben documentarse en:

```text
.env.example
```
