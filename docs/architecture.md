# Arquitectura de GymBro

## Estado

Documento inicial. Las decisiones se actualizarán durante el desarrollo.

## Aplicación

GymBro será una aplicación Next.js mobile-first construida con App Router.

## Responsabilidades

### `src/app`

Rutas, layouts, páginas, carga de datos y composición general.

### `src/features`

Lógica organizada por dominio:

- autenticación;
- ejercicios;
- rutinas;
- entrenamientos;
- progreso;
- funciones sociales.

### `src/components/ui`

Componentes visuales reutilizables y sin reglas de negocio específicas.

### `src/lib`

Clientes externos, validaciones, cálculos y utilidades compartidas.

### `supabase`

Configuración y migraciones PostgreSQL.

## Datos

Supabase proporcionará inicialmente:

- PostgreSQL;
- autenticación;
- almacenamiento;
- eventos en tiempo real.

## Reglas generales

- Autorización validada en servidor y base de datos.
- Row Level Security para información privada.
- Migraciones versionadas.
- TypeScript estricto.
- Diseño mobile-first.
