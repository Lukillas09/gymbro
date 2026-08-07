# Navegación del MVP

## Objetivo

La navegación debe permitir llegar al entrenamiento activo con pocos toques y
mantener disponibles la planificación y el progreso sin competir con la sesión.
La aplicación utiliza cinco destinos principales.

## Navegación principal

### Inicio

Resume el estado actual del usuario:

- próximo día sugerido de la rutina activa;
- acceso para iniciar o reanudar el entrenamiento;
- resumen semanal de sesiones completadas;
- mejora o récord reciente, cuando exista.

Si no existe una rutina activa, el estado vacío dirige a `Rutinas`. Si existe
una sesión activa, reanudarla reemplaza a cualquier propuesta de inicio.

### Rutinas

Permite:

- listar las rutinas del usuario;
- crear y editar una rutina;
- definir y ordenar sus días;
- agregar, configurar y ordenar ejercicios;
- elegir la rutina activa.

La biblioteca de ejercicios se abre como parte del flujo de agregar un ejercicio
y no necesita un destino principal propio.

### Entrenar

Es el acceso directo a la ejecución:

- si existe una sesión activa, abre esa sesión;
- si no existe, muestra el día sugerido y permite elegir otro día de una rutina;
- después de elegir un día, permite iniciar el entrenamiento;
- durante la sesión, concentra series, repeticiones, peso y descanso.

### Progreso

Agrupa tres vistas relacionadas:

- historial cronológico;
- calendario de entrenamientos finalizados;
- evolución y récord por ejercicio.

No incluye recomendaciones ni comparaciones sociales.

### Perfil

Permite consultar el correo de la cuenta, editar el nombre visible y cerrar
sesión. Las opciones que no estén aprobadas para el MVP no deben aparecer como
controles inactivos.

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
6. Entre series, inicia o ajusta el temporizador de descanso.
7. Cada cambio confirmado se persiste y puede recuperarse después de recargar.
8. El usuario revisa el resumen y confirma la finalización.
9. La sesión pasa al historial y actualiza calendario, evolución y récords.
10. `Inicio` sugiere el siguiente día de la rutina activa.

## Estados del flujo

### Sin rutina activa

`Inicio` y `Entrenar` dirigen a crear o activar una rutina. No se inventa un
entrenamiento automático.

### Listo para entrenar

Se muestra el día sugerido, sus ejercicios y una acción principal para iniciar.
El usuario puede cambiar de día antes de crear la sesión.

### Sesión activa

La sesión es prioritaria y permanece accesible desde `Inicio` y `Entrenar`.
Navegar a otras secciones no la finaliza ni descarta.

### Sesión recuperada

Después de recargar o volver a abrir la aplicación, se presenta la sesión activa
guardada y se permite continuar desde el último estado persistido.

### Sesión finalizada

Se muestra un resumen de lo realizado y un acceso al detalle en `Progreso`. Una
sesión finalizada no puede reabrirse para edición en el MVP.

## Reglas de navegación mobile-first

- Los cinco destinos principales permanecen accesibles desde una navegación
  persistente en celular.
- `Entrenar` se distingue como acción central sin usar el amarillo para estados
  secundarios.
- Una sesión activa siempre ofrece una ruta visible para reanudarla.
- Cambiar de sección no elimina formularios confirmados ni datos persistidos.
- Los estados vacíos conducen a la siguiente acción útil, sin pantallas de
  explicación separadas.
