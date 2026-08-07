# Producto GymBro

## Estado

Este documento define la visión, el público y los límites del producto. El
detalle verificable del alcance se encuentra en [`mvp.md`](mvp.md), y la
navegación se define en [`navigation.md`](navigation.md).

## Visión

Convertir GymBro en un compañero de entrenamiento confiable para personas que
realizan musculación en el gimnasio o en casa.

## Usuario objetivo

El MVP está dirigido a personas principiantes e intermedias que entrenan
musculación entre dos y seis veces por semana y usan principalmente el celular
durante la sesión.

Este usuario necesita recordar qué debe entrenar, consultar sus cargas
anteriores y registrar lo que hace sin interrumpir el ejercicio con demasiados
pasos o escritura.

## Problema principal

Muchas personas organizan sus rutinas y registran sus entrenamientos en notas,
planillas o aplicaciones no diseñadas para usarse mientras entrenan. Esto
dificulta saber qué corresponde hacer, conservar pesos y repeticiones, controlar
los descansos y reconocer el progreso de forma consistente.

## Propuesta de valor

GymBro reúne la planificación y ejecución de una rutina en una experiencia web
mobile-first. Permite llegar al entrenamiento del día, registrar cada serie con
pocos toques, controlar descansos y consultar el historial y el progreso básico
en un mismo lugar.

## Experiencia central

1. Abrir GymBro.
2. Ver el entrenamiento sugerido.
3. Iniciar la sesión.
4. Registrar series, repeticiones y peso.
5. Controlar los descansos.
6. Finalizar el entrenamiento.
7. Consultar el historial y el progreso.

## Principios del producto

- El entrenamiento es más importante que la aplicación.
- Registrar una serie debe requerir pocos toques.
- La experiencia principal debe funcionar correctamente en celulares.
- Los datos personales y de entrenamiento son privados por defecto.
- El progreso debe surgir de datos comprensibles para el usuario.
- El amarillo se reserva para acciones importantes.
- Las funciones nuevas deben mejorar la experiencia central o justificar
  claramente su incorporación.

## Alcance del MVP

El MVP incluye:

- registro, inicio y cierre de sesión;
- perfil básico;
- biblioteca de ejercicios;
- creación y edición de rutinas;
- días ordenados dentro de cada rutina;
- ejercicios configurables por día;
- registro de series, repeticiones y peso;
- entrenamiento activo y temporizador de descanso;
- recuperación de una sesión activa después de recargar;
- historial y calendario de entrenamientos;
- evolución básica por ejercicio;
- récords personales básicos.

Las reglas exactas y los criterios de aceptación están en
[`mvp.md`](mvp.md).

## Fuera del MVP

- GymBros y sistema de amigos;
- actividad en tiempo real;
- chat;
- feed;
- generación de rutinas con inteligencia artificial;
- recomendaciones inteligentes avanzadas;
- suscripciones;
- nutrición;
- integración con relojes;
- análisis mediante cámara.

Estas exclusiones no deben condicionar el modelo inicial ni generar
abstracciones anticipadas.
