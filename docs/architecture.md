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
- **Ejercicios:** catálogo común y búsqueda.
- **Rutinas:** rutinas, días, ejercicios y objetivos.
- **Entrenamientos:** sesión activa, series y descanso.
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
dos migraciones están aplicadas, el seed contiene 12 grupos musculares y los
tipos se generaron desde el esquema remoto real. Una prueba opt-in confirmó el
registro, el trigger de perfil y el aislamiento básico de RLS con dos usuarios
controlados. pgTAP local continúa pendiente y esta comprobación no convierte el
proyecto en producción ni sustituye el entorno reproducible.

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

## Persistencia del entrenamiento activo

- PostgreSQL es la fuente de verdad de una sesión activa.
- Solo puede existir una sesión activa por usuario.
- Cada serie confirmada debe persistirse antes de comunicarse como guardada.
- La recarga consulta la sesión activa y reconstruye el estado desde el servidor.
- El temporizador se recupera usando una hora de finalización persistida; no se
  confía únicamente en un contador en memoria.
- La aplicación puede conservar estado local para respuesta inmediata, pero ese
  estado no reemplaza la persistencia ni la autorización del servidor.

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
- El catálogo común de ejercicios es de solo lectura para el cliente común.
- Las claves de servicio se usan solo en contexto de servidor.
- Las tablas hijas validan propiedad recorriendo su rutina o sesión.
- Las escrituras de ejercicios personalizados se limitan a su creador; los
  ejercicios oficiales no admiten escrituras ordinarias.
- Los datos externos se validan antes de entrar a la lógica de dominio.
- Los logs no contienen tokens, correos ni datos privados de entrenamiento.

## Calidad y experiencia

- El diseño parte de 360 píxeles de ancho y evita scroll horizontal.
- Los controles táctiles, estados accesibles y flujos de error siguen los
  criterios de [`mvp.md`](mvp.md).
- Los componentes visuales no contienen reglas de negocio complejas.
- Los flujos críticos de autenticación, rutina, entrenamiento y recuperación
  requieren pruebas automatizadas.
- CI valida formato, lint, tipos, pruebas y build antes de integrar cambios.

## Complejidad postergada

- capa social y permisos entre usuarios;
- eventos en tiempo real;
- recomendaciones inteligentes;
- métricas avanzadas o precalculadas;
- almacenamiento multimedia;
- soporte offline completo;
- abstracciones para aplicaciones móviles nativas.
