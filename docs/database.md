# Base de datos de GymBro

## Estado

El modelo definitivo todavía no fue implementado.

## Entidades iniciales previstas

- profiles
- exercises
- muscle_groups
- exercise_muscles
- routines
- routine_days
- routine_exercises
- workout_sessions
- workout_exercises
- workout_sets

## Entidades sociales futuras

- friendships
- user_activities
- achievements
- user_achievements

## Reglas

- Todas las tablas privadas deben utilizar Row Level Security.
- Los usuarios solamente pueden modificar sus propios datos.
- Las migraciones son la fuente de verdad del esquema.
- Las reglas críticas deben aplicarse también en PostgreSQL.
