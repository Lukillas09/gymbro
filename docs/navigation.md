# Navegación del MVP

## Objetivo

La navegación debe permitir llegar al entrenamiento activo con pocos toques y
mantener disponibles la planificación y el progreso sin competir con la sesión.
La aplicación utiliza cinco destinos principales.

## Navegación principal

### Inicio

Resume el estado actual del usuario:

- un hero para crear rutina, iniciar, reanudar, reconocer lo completado o
  descansar;
- como máximo un recuerdo factual o mejora reciente;
- un resumen semanal pequeño cuando aporta información.

La prioridad es sesión activa, sesión completada hoy, ausencia de rutina, día
programado hoy y descanso verificable. Si no existe una rutina activa, el estado
vacío dirige a crearla. Si existe una sesión activa, reanudarla reemplaza a
cualquier propuesta o resumen secundario.

Un día se considera programado sólo mediante `weekday`. Si todos los días
entrenables tienen weekday y ninguno coincide con hoy, Inicio muestra descanso y
el siguiente día del ciclo semanal. Si faltan weekdays, deja elegir manualmente
un día y nunca supone que corresponde descansar.

### Rutinas

Permite:

- listar las rutinas del usuario;
- crear y editar una rutina;
- definir y ordenar sus días;
- agregar, configurar y ordenar ejercicios;
- elegir la rutina activa.

La biblioteca de ejercicios se abre como parte del flujo de agregar un ejercicio
y no necesita un destino principal propio. Mientras no existen rutinas, el
estado vacío ofrece `Explorar ejercicios` hacia `/exercises`; la ficha de detalle
vive en `/exercises/[slug]` y conserva la navegación principal.

Las rutas secundarias del dominio son:

- `/routines/new`: nombre y objetivo inicial;
- `/routines/[id]`: plan completo y resumen muscular;
- `/routines/[id]/edit`: días, prescripciones, orden y selección desde catálogo.

El editor usa controles explícitos para subir y bajar elementos. No depende de
drag-and-drop y no ofrece todavía iniciar un entrenamiento.

### Entrenar

Es el acceso directo a la ejecución:

- si existe una sesión activa, abre esa sesión;
- si no existe, muestra el día sugerido y permite elegir otro día de una rutina;
- después de elegir un día, permite iniciar el entrenamiento;
- durante la sesión, concentra series, repeticiones, peso y descanso.

`/workout` mantiene la navegación principal mientras se elige el día.
`/workout/[id]` es la experiencia LIVE: reduce el chrome global, muestra
duración y progreso, y permite abrir una lista compacta para cambiar de ejercicio
sin alterar la rutina.

### Progreso

Agrupa tres vistas relacionadas:

- historial cronológico disponible en `/history`;
- calendario mensual planificado y realizado en `/calendar`;
- evolución y récord por ejercicio en `/progress/exercises/[exerciseId]`.

La pantalla Progreso mantiene el acceso en la navegación principal y ofrece una
entrada clara a Calendario sin crear una sexta pestaña. Dentro de `/calendar`,
`/history` y `/history/[id]`, Progreso continúa marcado como sección activa.
Home COMPLETED y el resumen final también pueden abrir directamente el detalle
histórico.

`/progress` prioriza una interpretación de las últimas cuatro semanas, seguida
por frecuencia semanal, mejoras factuales y una lista buscable de ejercicios
entrenados. El detalle del ejercicio enlaza cada sesión con `/history/[id]`.

Calendario responde “¿cuándo?” y enlaza History para responder “¿qué hice?”. No
duplica el detalle histórico, métricas de Progress, recomendaciones ni
comparaciones sociales.

### Perfil

`/profile` presenta primero la identidad deportiva: iniciales, nombre, username,
nivel, objetivo, hasta tres métricas positivas, plan activo, un PR factual y
actividad reciente. Cada sesión abre `/history/[id]`; el PR abre el detalle del
ejercicio en Progreso. La historia permanece visible aunque no exista una rutina
activa y una sola sesión no se interpreta como patrón muscular.

`/profile/edit` separa configuración de identidad. Allí se editan nombre,
username, nivel, objetivo, unidad y datos personales opcionales, y se puede
cerrar sesión. No se agregan tabs nuevas, perfiles públicos, biografía, avatar en
Storage ni controles inactivos.

## Acceso y vistas previas

Registro e inicio de sesión ocurren antes de la navegación principal. Un usuario
sin sesión no puede acceder a los cinco destinos privados.

- `/register` crea una cuenta por correo y contraseña. Si Supabase exige
  confirmación, permanece fuera de la aplicación hasta validar el correo.
- `/login` acepta únicamente credenciales y destinos internos seguros.
- `/auth/confirm` intercambia la confirmación por una sesión SSR y dirige al
  onboarding.
- `/onboarding` requiere sesión, pero no muestra la navegación principal hasta
  completar username, nombre visible, nivel, objetivo y unidad de peso.

Un visitante que abre una ruta privada vuelve a `/login`. Un usuario autenticado
con perfil incompleto va a `/onboarding`; uno con perfil completo que intenta
abrir login o registro vuelve a Inicio. Estas reglas se verifican en layouts de
servidor además del Proxy para evitar loops y depender de una sola barrera.

## Flujo principal de entrenamiento

1. El usuario abre la aplicación autenticado.
2. `Inicio` muestra el próximo día de la rutina activa o una sesión pendiente.
3. El usuario inicia el día sugerido o abre `Entrenar` para elegir otro.
4. GymBro crea una sesión activa con una copia del plan del día.
5. El usuario completa series y registra repeticiones y peso.
6. Completar una serie inicia descanso; puede extenderse 15 segundos o saltarse.
7. Cada cambio confirmado se persiste y puede recuperarse después de recargar.
8. El usuario revisa el resumen y confirma la finalización.
9. La sesión pasa al historial; calendario, evolución y récords se derivan de
   esos mismos resultados completados.
10. `Inicio` sugiere el siguiente día de la rutina activa.

## Estados del flujo

### Sin rutina activa

`Inicio` prioriza crear una rutina y ofrece explorar ejercicios; `Entrenar`
dirige a crear o activar un plan. No se inventan entrenamientos ni estadísticas
en cero.

### Listo para entrenar

Se muestra el día programado, hasta tres macrogrupos `primary`, cantidad de
ejercicios y una acción principal para iniciar. El usuario puede cambiar de día
antes de crear la sesión. Con calendario parcial o ausente, el selector manual
es la conducta principal.

### Sesión activa

La sesión es prioritaria y permanece accesible desde `Inicio` y `Entrenar`.
Navegar a otras secciones no la finaliza ni descarta.
El ejercicio activo puede cambiarse si otro equipo está ocupado; el orden del
snapshot permanece intacto.

Inicio muestra duración desde `started_at`, ejercicio y próxima serie, y vuelve
a `/workout/[id]` con una sola acción.

### Sesión recuperada

Después de recargar o volver a abrir la aplicación, se presenta la sesión activa
guardada y se permite continuar desde el último estado persistido.

### Sesión finalizada

Durante el resto del día local, Inicio muestra duración y series reales, una
mejora comparable si existe y un acceso al resumen inmutable de
`/workout/[id]`. Una sesión finalizada no puede reabrirse para edición en el
MVP. Al día siguiente este estado desaparece sin persistir una bandera.

### Descanso verificable

Sólo aparece con un calendario semanal completo y muestra el próximo día
programado. Puede incluir la cantidad factual de sesiones completadas en la
semana, sin frases motivacionales ni métricas inventadas.

## Reglas de navegación mobile-first

- Los cinco destinos principales permanecen accesibles desde una navegación
  persistente en celular.
- `Entrenar` se distingue como acción central sin usar el amarillo para estados
  secundarios.
- Una sesión activa siempre ofrece una ruta visible para reanudarla.
- Cambiar de sección no elimina formularios confirmados ni datos persistidos.
- Los estados vacíos conducen a la siguiente acción útil, sin pantallas de
  explicación separadas.
