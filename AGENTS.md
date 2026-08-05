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

Las funcionalidades nuevas deben mejorar este flujo o aportar una razón
clara para incorporarse.

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
- Validar autorización en el servidor.
- No confiar únicamente en controles de interfaz.
- Toda tabla privada de Supabase debe tener políticas RLS.
- No registrar información sensible en logs.

## Base de datos

- Las modificaciones se realizan mediante migraciones.
- No modificar manualmente producción.
- Agregar restricciones cuando una regla pueda garantizarse en PostgreSQL.
- Mantener documentación del esquema actualizada.

## Calidad

Antes de terminar una tarea, ejecutar:

````bash
npm run format:check
npm run lint
npm run typecheck
npm run build

# 16. Crear la documentación inicial

## `docs/product.md`

```markdown
# Producto GymBro

## Visión

Convertir GymBro en el compañero indispensable para personas que realizan
entrenamiento de musculación en gimnasio o en casa.

## Problema

Muchas personas anotan sus entrenamientos de forma desordenada, olvidan
sus pesos anteriores, no controlan correctamente los descansos y no
tienen una visión clara de su progreso.

## Propuesta de valor

GymBro reúne rutina, ejecución, descanso, historial, estadísticas y
motivación social en una experiencia diseñada principalmente para celular.

## Público inicial

Personas principiantes e intermedias que entrenan musculación entre dos y
seis veces por semana.

## Experiencia central

1. Abrir GymBro.
2. Ver el entrenamiento del día.
3. Iniciar la sesión.
4. Registrar cada serie rápidamente.
5. Controlar el descanso.
6. Finalizar la sesión.
7. Ver progreso y recomendaciones.

## Principios del producto

- El entrenamiento es más importante que la aplicación.
- Registrar una serie debe requerir muy pocos toques.
- Los datos del usuario deben ser privados por defecto.
- Las sugerencias deben ser explicables.
- La actividad social debe motivar, no distraer.
- La aplicación no debe convertirse en una red social de contenido.

## MVP incluido

- Registro e inicio de sesión.
- Perfil básico.
- Biblioteca de ejercicios.
- Creación de rutinas.
- Entrenamiento activo.
- Series, repeticiones y peso.
- Temporizador de descanso.
- Historial.
- Calendario.
- Estadísticas básicas.

## Fuera del MVP

- Chat.
- Feed de publicaciones.
- Rankings globales.
- Análisis mediante cámara.
- Nutrición.
- Integraciones con relojes.
- Rutinas generadas completamente por IA.
- Suscripciones.
````
