# GymBro — instrucciones para agentes

## Objetivo del producto

GymBro es una aplicación mobile-first para acompañar entrenamientos de
musculación. La experiencia central es:

1. Ver qué entrenamiento corresponde.
2. Iniciar la sesión.
3. Registrar series, repeticiones y peso.
4. Controlar descansos.
5. Finalizar el entrenamiento.
6. Consultar progreso e historial.

Las funcionalidades nuevas deben mejorar este flujo o aportar una razón clara
para incorporarse.

## Stack

- Next.js con App Router.
- React.
- TypeScript estricto.
- Tailwind CSS.
- Supabase y PostgreSQL.
- npm como gestor de paquetes.

No reemplazar estas tecnologías sin una decisión documentada.

## Antes de editar

1. Inspeccionar la estructura existente.
2. Leer los documentos relacionados dentro de `docs/`.
3. Revisar componentes, servicios, migraciones y tests existentes.
4. No duplicar funcionalidades.
5. Mantener el alcance solicitado.
6. Informar archivos modificados y decisiones tomadas.

## Arquitectura

- Las rutas viven en `src/app`.
- La lógica de cada dominio vive en `src/features`.
- Los componentes genéricos viven en `src/components/ui`.
- La lógica reutilizable no visual vive en `src/lib`.
- Los hooks compartidos viven en `src/hooks`.
- Los tipos compartidos viven en `src/types`.
- Las migraciones viven en `supabase/migrations`.

Los componentes visuales no deben contener reglas de negocio complejas.

## Autenticación

- Next.js 16 utiliza `src/proxy.ts`; no crear `middleware.ts`.
- El Proxy renueva la sesión con `supabase.auth.getClaims()` y sólo realiza
  comprobaciones optimistas.
- Los layouts y acciones de servidor vuelven a verificar la identidad antes de
  cargar o modificar datos.
- No confiar en `getSession()` como prueba de identidad en servidor.
- La autorización de datos privados también debe permanecer en RLS.
- La identidad se obtiene desde la sesión, nunca desde un `user_id` del cliente.
- No usar `service_role` para registro, login, onboarding o consultas RLS.
- El onboarding está completo cuando existen username, nombre visible, nivel,
  objetivo y unidad preferida.
- Las redirecciones proporcionadas por el cliente deben restringirse a rutas
  privadas internas.

## TypeScript

- No usar `any` sin justificación.
- Validar datos externos.
- No silenciar errores con `@ts-ignore`.
- Preferir tipos de dominio explícitos.
- Manejar estados nulos y errores.

## Experiencia de usuario

- Diseñar primero para celular.
- Mantener objetivos táctiles cómodos.
- Minimizar escritura durante el entrenamiento.
- Incluir estados de carga, error y contenido vacío.
- Mantener accesibilidad básica.
- El amarillo se reserva para acciones importantes.

## Seguridad

- Nunca agregar secretos al repositorio.
- No exponer claves privadas mediante variables `NEXT_PUBLIC_*`.
- Validar autorización en servidor y PostgreSQL.
- No confiar únicamente en controles de interfaz o Proxy.
- Toda tabla privada de Supabase debe tener políticas RLS.
- No registrar passwords, tokens, cookies ni información sensible.

## Base de datos

- Las modificaciones se realizan mediante migraciones nuevas.
- No modificar manualmente producción ni migraciones ya aplicadas.
- Agregar restricciones cuando una regla pueda garantizarse en PostgreSQL.
- Mantener documentación del esquema actualizada.
- Ejecutar `npm run supabase:reset` y `npm run supabase:test` para cambios SQL
  cuando Docker esté disponible.
- Regenerar tipos con `npm run supabase:types` en local o
  `npm run supabase:types:remote` después de migraciones remotas que cambien
  tipos.
- Las validaciones normales y CI no dependen de Supabase remoto.
- Ejecutar `supabase:remote:dry-run` antes de cualquier push remoto.
- Nunca ejecutar `db reset --linked` ni apuntar desarrollo a producción.
- Las migraciones son la única fuente de verdad; no editar el esquema desde
  Dashboard.
- No afirmar que pgTAP pasó sin un entorno local compatible con contenedores.
- No editar manualmente los tipos generados desde PostgreSQL.
- `muscle_groups` contiene sólo los siete macrogrupos visibles del producto.
- `muscles` contiene músculos o zonas específicas y siempre pertenece a un
  macrogrupo.
- `exercise_muscles` referencia `muscles`; el macrogrupo se obtiene mediante la
  relación y no se duplica en esa tabla.
- Antebrazos pertenece a Bíceps como simplificación funcional de producto, no
  como afirmación anatómica estricta.

La prueba `supabase:remote:test:auth` es manual y opt-in. Sólo puede ejecutarse
contra el proyecto descartable de desarrollo, no pertenece a `check` o CI y debe
eliminar los usuarios controlados creados.

## Calidad

Antes de terminar una tarea, ejecutar:

```bash
npm run format:check
npm run lint
npm run typecheck
npm run test:run
npm run build
npm run test:e2e
git diff --check
```

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
