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

- [ ] Implementar el modelo y la carga inicial del catálogo.
- [x] Incorporar la taxonomía base de macrogrupos y músculos específicos.
- [ ] Incorporar equipamiento.
- [ ] Crear listado, búsqueda y filtros.
- [ ] Crear el detalle básico necesario para seleccionar ejercicios.
- [ ] Verificar estados de carga, error y catálogo vacío.

## Fase 3 — Rutinas

- [ ] Crear y editar rutinas.
- [ ] Crear, editar y ordenar días.
- [ ] Agregar y ordenar ejercicios desde la biblioteca.
- [ ] Configurar series y repeticiones objetivo.
- [ ] Activar una única rutina y resolver el próximo día sugerido.
- [ ] Garantizar que los cambios no alteren sesiones existentes.

## Fase 4 — Entrenamiento

- [ ] Iniciar una única sesión activa desde un día de rutina.
- [ ] Capturar una copia estable del plan.
- [ ] Registrar y corregir series, repeticiones y peso.
- [ ] Implementar el temporizador de descanso.
- [ ] Persistir y recuperar la sesión después de recargar.
- [ ] Finalizar la sesión con confirmación.

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
