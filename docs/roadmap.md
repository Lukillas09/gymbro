# Roadmap de GymBro

El orden responde a dependencias funcionales. Cada fase debe conservar los
criterios definidos en [`mvp.md`](mvp.md) y no incorporar funciones post-MVP.

## Fase 0 — Definición

- [x] Definir visión, usuario, problema y propuesta de valor.
- [x] Definir stack y límites arquitectónicos iniciales.
- [x] Crear estructura del repositorio.
- [x] Definir alcance y criterios de aceptación del MVP.
- [x] Definir navegación y flujo principal.
- [x] Definir entidades y relaciones conceptuales.
- [ ] Aprobar las decisiones pendientes registradas en `docs/mvp.md`.

## Fase 1 — Fundamentos

- [x] Configurar Supabase, variables de entorno y clientes base.
- [x] Documentar el flujo temporal con un proyecto remoto exclusivo de
      desarrollo sin reemplazar el entorno local.
- [x] Implementar registro, confirmación, login y renovación SSR de sesión.
- [x] Implementar onboarding, perfil básico y cierre de sesión.
- [x] Proteger el layout con la navegación principal mobile-first.
- [x] Establecer el esquema PostgreSQL, sus restricciones y Row Level Security
      base.
- [x] Validar migración, seed y tipos contra el proyecto remoto exclusivo de
      desarrollo.
- [x] Validar funcionalmente el trigger de perfiles y el aislamiento RLS básico
      mediante una prueba remota opt-in con cleanup.
- [x] Separar macrogrupos y músculos específicos antes de construir la biblioteca
      de ejercicios.
- [x] Configurar pruebas unitarias, de componentes, end-to-end y CI.
- [ ] Validar reset, seed y pruebas pgTAP con Supabase local cuando exista un
      runtime compatible con contenedores.
- [ ] Configurar el despliegue de prueba.

## Fase 2 — Biblioteca de ejercicios

- [x] Implementar el modelo y la carga inicial del catálogo.
- [x] Incorporar la taxonomía base de macrogrupos y músculos específicos.
- [x] Incorporar equipamiento normalizado y patrones de movimiento.
- [x] Crear listado, búsqueda y filtros combinables.
- [x] Crear el detalle básico necesario para seleccionar ejercicios.
- [x] Verificar estados de carga, error y catálogo vacío.

## Fase 3 — Rutinas

- [x] Crear, editar y eliminar rutinas.
- [x] Crear, editar, duplicar y ordenar días.
- [x] Agregar y ordenar ejercicios desde la biblioteca.
- [x] Configurar series, repeticiones, descanso y RIR objetivo.
- [x] Activar una única rutina de forma atómica.
- [x] Mantener prescripción y resultados de entrenamiento como conceptos
      separados.
- [ ] Resolver el próximo día sugerido a partir de sesiones finalizadas.

## Fase 4 — Entrenamiento

- [x] Iniciar una única sesión activa desde un día de rutina.
- [x] Capturar y bloquear una copia estable del plan.
- [x] Registrar series, repeticiones y peso con idempotencia y Undo inmediato.
- [x] Implementar descanso persistente con extensión y salto.
- [x] Persistir y recuperar sesión, ejercicio y progreso después de recargar.
- [x] Permitir cambiar de ejercicio sin modificar el orden de rutina.
- [x] Finalizar la sesión con confirmación contextual y resumen factual.

## Fase 5 — Historial y progreso

- [ ] Listar sesiones finalizadas y mostrar su detalle.
- [ ] Crear el calendario de entrenamientos.
- [ ] Mostrar evolución básica por ejercicio.
- [ ] Calcular y mostrar récords personales básicos.
- [ ] Verificar que solo se utilicen sesiones y series completadas.

## Fase 6 — Cierre del MVP

- [ ] Cubrir los flujos críticos con pruebas automatizadas.
- [ ] Verificar aislamiento entre usuarios y políticas RLS.
- [ ] Revisar accesibilidad y objetivos táctiles.
- [ ] Verificar los flujos desde 360 píxeles sin desbordes.
- [ ] Revisar recuperación ante errores y estados vacíos.
- [ ] Validar rendimiento en navegadores móviles objetivo.
- [ ] Completar el despliegue de prueba y la revisión end-to-end.

## Post-MVP

- GymBros, amigos y actividad en tiempo real.
- Chat y feed.
- Generación de rutinas con inteligencia artificial.
- Recomendaciones avanzadas y detección de estancamiento.
- Métricas avanzadas, volumen y distribución muscular.
- Suscripciones y nutrición.
- Integraciones con relojes y análisis mediante cámara.
