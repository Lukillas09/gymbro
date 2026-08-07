# Definición funcional del MVP

## Estado y propósito

Este documento es la fuente de verdad del alcance funcional y de los criterios
de aceptación del MVP de GymBro. No define tablas SQL ni detalles visuales de
implementación.

La visión y las exclusiones generales viven en [`product.md`](product.md), la
navegación en [`navigation.md`](navigation.md) y el orden de construcción en
[`roadmap.md`](roadmap.md).

## Alcance funcional

### Acceso y perfil

- Una persona puede registrarse, iniciar sesión y cerrar sesión.
- El registro usa correo y contraseña. Cuando la confirmación de correo está
  habilitada, debe completarse antes de obtener una sesión.
- Las vistas y los datos de entrenamiento requieren una sesión autenticada.
- Antes de entrar a la aplicación, onboarding solicita username, nombre visible,
  nivel, objetivo y unidad de peso. Sexo biológico, nacimiento, altura y peso son
  opcionales.
- El perfil básico muestra esos datos reales. El correo permanece administrado
  por Supabase Auth y no se edita en esta fase.
- Las iniciales del nombre pueden representar visualmente al usuario; subir un
  avatar no es requisito del MVP.

### Biblioteca de ejercicios

- El usuario puede explorar un catálogo común de ejercicios de musculación.
- Puede buscar ejercicios por nombre y filtrarlos por uno de los siete
  macrogrupos musculares, músculo específico o equipamiento.
- Los filtros se combinan. Elegir equipamiento significa que ese elemento forma
  parte de los requisitos; no implica que sea el único necesario.
- Cada ejercicio presenta nombre, macrogrupo y músculo principal, equipamiento,
  dificultad, descripción, técnica ordenada y errores comunes.
- La asociación interna usa músculos o zonas específicas para permitir una
  clasificación más precisa sin recargar la navegación principal.
- La ficha distingue músculos principales, secundarios y estabilizadores.
- El catálogo se utiliza al configurar rutinas. Crear ejercicios personalizados
  no forma parte del alcance confirmado.

### Rutinas

- El usuario puede crear y editar más de una rutina.
- Solo una rutina puede estar activa para determinar el próximo entrenamiento.
- Una rutina contiene días con nombre y orden explícito.
- Cada día contiene ejercicios ordenados.
- Para cada ejercicio se configuran la cantidad objetivo de series y
  repeticiones, descanso y RIR objetivo opcional entre 0 y 5.
- Los días y sus ejercicios conservan un orden explícito que puede cambiarse con
  controles accesibles de subir y bajar.
- Un día puede duplicarse junto con todas sus prescripciones. Un ejercicio puede
  aparecer en días diferentes, pero no repetirse dentro del mismo día.
- La vista de rutina muestra una estimación de series objetivo asociadas a
  músculos `primary`, sin ponderar secundarios ni estabilizadores.
- El peso se registra en las series realizadas durante el entrenamiento. La
  última carga registrada puede mostrarse como referencia, sin modificar la
  configuración de la rutina.
- El próximo entrenamiento sugerido es el día siguiente al último día completado
  de la rutina activa. El usuario puede elegir otro día antes de iniciar.

### Entrenamiento activo

- Un usuario puede tener como máximo una sesión activa.
- La sesión se inicia desde el día sugerido o desde otro día seleccionado de una
  rutina.
- La sesión conserva una copia de los ejercicios, su orden y sus objetivos para
  que posteriores cambios en la rutina no alteren entrenamientos ya iniciados o
  finalizados.
- El usuario registra peso y repeticiones con valores precargados desde la última
  serie comparable cuando existen datos reales.
- Cada serie se completa de forma independiente y la última puede deshacerse de
  inmediato mientras la sesión continúa activa.
- El ejercicio visible puede cambiarse sin modificar el orden guardado del plan.
- El usuario puede navegar fuera de la vista activa y regresar sin perderla.
- Al recargar o volver a abrir la aplicación, la sesión activa se recupera desde
  su último estado guardado.
- Finalizar una sesión la vuelve disponible en historial y actualiza los datos
  derivados de progreso.
- Editar una sesión después de finalizarla no forma parte del MVP.

### Temporizador de descanso

- Completar una serie inicia el conteo regresivo según el descanso prescripto.
- El usuario puede extenderlo 15 segundos o finalizarlo antes de tiempo.
- El tiempo restante permanece visible dentro de la experiencia de entrenamiento.
- Si la página se recarga durante el descanso, el conteo se reconstruye a partir
  de una hora de finalización persistida, en lugar de reiniciarse.
- El final del descanso se comunica visualmente y puede usar vibración como
  mejora progresiva. No depende de sonido ni de notificaciones del sistema.

### Historial y calendario

- El historial lista sesiones finalizadas de la más reciente a la más antigua.
- Cada elemento muestra fecha, rutina o día realizado, duración y cantidad de
  ejercicios.
- El detalle muestra los ejercicios y todas las series registradas con
  repeticiones y peso.
- El calendario identifica los días con sesiones finalizadas.
- Seleccionar un día permite ver las sesiones finalizadas en esa fecha.
- Las sesiones activas no cuentan como entrenamientos completados.

### Evolución y récords personales

- El usuario puede elegir un ejercicio con historial y ver su evolución
  cronológica.
- Para el MVP, la evolución utiliza el mayor peso de una serie completada en cada
  sesión, acompañado por sus repeticiones y fecha.
- El récord personal básico de un ejercicio es el mayor peso registrado en una
  serie completada de una sesión finalizada.
- Si varias series comparten el mismo peso máximo, se muestra la de más
  repeticiones; si también empatan, se conserva la más reciente.
- Volumen, estimación de una repetición máxima, tendencias y recomendaciones no
  forman parte de esta definición básica.

## Historias de usuario

- **HU-01:** Como usuario nuevo, quiero crear una cuenta para conservar mis
  rutinas y entrenamientos de forma privada.
- **HU-02:** Como usuario registrado, quiero iniciar y cerrar sesión para acceder
  de manera segura a mis datos.
- **HU-03:** Como usuario, quiero editar mi nombre visible para identificar mi
  perfil.
- **HU-04:** Como usuario, quiero buscar y filtrar ejercicios para encontrar
  rápidamente los que necesito.
- **HU-05:** Como usuario, quiero crear una rutina con días ordenados para
  organizar mi plan de entrenamiento.
- **HU-06:** Como usuario, quiero agregar y ordenar ejercicios con series y
  repeticiones objetivo para preparar cada día.
- **HU-07:** Como usuario, quiero ver el próximo día sugerido al abrir la
  aplicación para saber qué entrenar.
- **HU-08:** Como usuario, quiero iniciar una sesión y registrar cada serie con
  repeticiones y peso usando pocos toques.
- **HU-09:** Como usuario, quiero controlar mi descanso sin salir del
  entrenamiento activo.
- **HU-10:** Como usuario, quiero recuperar una sesión después de recargar para
  no perder lo registrado.
- **HU-11:** Como usuario, quiero finalizar una sesión para incorporarla al
  historial.
- **HU-12:** Como usuario, quiero consultar un calendario para reconocer mi
  constancia.
- **HU-13:** Como usuario, quiero revisar la evolución y el récord de un ejercicio
  para comprender mi progreso.

## Criterios de aceptación

### Acceso y privacidad

- Un visitante no autenticado no puede abrir vistas privadas ni leer datos de
  entrenamiento.
- Después de registrarse e iniciar sesión, el usuario accede únicamente a sus
  rutinas, sesiones, series y perfil.
- Un usuario autenticado con onboarding incompleto no accede todavía a la
  navegación privada.
- Cerrar sesión elimina el acceso a las vistas privadas en ese dispositivo.
- Dos cuentas distintas no pueden leer ni modificar datos privados entre sí.

### Perfil y ejercicios

- El usuario puede guardar un nombre visible válido y verlo reflejado al volver a
  abrir la aplicación.
- La búsqueda encuentra coincidencias por nombre sin exigir coincidencia exacta
  de mayúsculas.
- Los filtros reducen el catálogo según cualquier músculo involucrado y según el
  equipamiento incluido entre sus requisitos.
- Todo ejercicio oficial muestra al menos un músculo principal, un elemento de
  equipamiento, instrucciones y errores comunes.
- Un ejercicio seleccionado desde la biblioteca puede agregarse a un día de
  rutina.

### Rutinas

- El usuario puede crear una rutina, agregar al menos un día y agregar ejercicios
  con series y repeticiones objetivo.
- El orden guardado de días y ejercicios se conserva después de recargar.
- Duplicar un día copia ejercicios, series, repeticiones, descanso, RIR y orden
  interno sin dejar una copia parcial.
- Sets, repeticiones, descanso y RIR fuera de sus rangos PostgreSQL se rechazan
  antes de guardar.
- Editar el nombre, objetivos u orden actualiza la rutina sin alterar sesiones
  finalizadas.
- Activar una rutina desactiva cualquier otra rutina activa del mismo usuario.
- El día sugerido avanza solamente después de finalizar una sesión asociada al
  día anterior de la rutina activa.

### Entrenamiento y descanso

- Iniciar un día crea una única sesión activa con una copia estable de su plan.
- Intentar iniciar otro entrenamiento ofrece volver a la sesión activa existente
  en lugar de crear una segunda.
- Una serie completada conserva ejercicio, orden, repeticiones y peso después de
  recargar.
- Un doble envío de la misma serie no crea una segunda fila ni reemplaza el
  resultado ya guardado.
- Deshacer elimina únicamente la última serie compatible y restaura el descanso
  asociado cuando corresponde.
- El temporizador muestra un conteo regresivo y mantiene una hora de finalización
  coherente después de recargar.
- Extender o saltar el descanso actual persiste el nuevo estado.
- Cambiar el ejercicio activo se conserva después de recargar sin reordenar el
  plan.
- Finalizar la sesión requiere confirmación y evita finalizar por accidente.
- Una sesión finalizada deja de aparecer como activa y queda disponible en el
  historial, no acepta nuevas series y muestra un resumen factual.

### Historial y progreso

- El historial ordena las sesiones finalizadas por fecha descendente.
- El detalle de una sesión reproduce los ejercicios y series registrados al
  finalizarla.
- El calendario marca exactamente las fechas que contienen sesiones finalizadas.
- La evolución de un ejercicio usa solamente series completadas de sesiones
  finalizadas.
- El récord mostrado coincide con la regla de mayor peso, repeticiones y fecha
  definida para el MVP.

### Estados de interfaz

- Toda vista con datos remotos contempla carga, error y contenido vacío.
- Toda acción guardada comunica éxito o error sin depender únicamente del color.
- Los errores recuperables permiten reintentar sin descartar datos ya guardados.

## Requisitos no funcionales

### Mobile-first y accesibilidad

- Los flujos principales son utilizables desde 360 píxeles de ancho sin scroll
  horizontal.
- Los controles primarios tienen un área táctil mínima de 44 por 44 píxeles.
- La interfaz puede recorrerse con teclado y mantiene indicadores de foco
  visibles.
- Los controles tienen nombres accesibles y los estados no se comunican solo con
  color.
- El texto admite ampliación del navegador sin superposiciones en los flujos
  principales.

### Confiabilidad y rendimiento percibido

- Una serie se considera guardada solo después de persistirse correctamente.
- La recuperación de sesión no depende únicamente del estado en memoria o del
  almacenamiento local del navegador.
- Las operaciones remotas muestran estado de carga y no bloquean silenciosamente
  la interfaz.
- La experiencia de registro prioriza interacciones cortas y evita entradas de
  texto cuando puede usarse un control numérico.

### Seguridad y calidad

- La autorización se valida en servidor y PostgreSQL, no solo en la interfaz.
- Toda información privada queda protegida por Row Level Security.
- TypeScript permanece en modo estricto y no se silencian errores de tipos.
- Los flujos críticos cuentan con pruebas automatizadas antes de cerrar el MVP.
- `format:check`, `lint`, `typecheck`, pruebas y `build` deben pasar en CI.
- El MVP apunta a las versiones estables actuales de Safari en iOS y Chrome en
  Android, además de navegadores de escritorio modernos.

## Reglas iniciales de privacidad

- El perfil, las rutinas, las sesiones y el progreso son privados por defecto.
- No existen perfiles públicos, búsqueda de usuarios ni intercambio de actividad
  en el MVP.
- El catálogo común de ejercicios puede ser leído por usuarios autenticados,
  pero no modificado desde el cliente común.
- Cada operación privada se limita al propietario autenticado mediante políticas
  de base de datos.
- Las claves de servicio se utilizan solamente en el servidor y nunca se exponen
  mediante variables `NEXT_PUBLIC_*`.
- No se registran correos, tokens, cargas de entrenamiento ni otros datos
  sensibles en logs de aplicación.
- Solo se solicita información necesaria para autenticación y perfil básico.

## Decisiones pendientes de aprobación

Estas decisiones no amplían el alcance, pero deben cerrarse antes de implementar
el dominio correspondiente:

- política y experiencia futura de recuperación de acceso;
- uso exclusivo de kilogramos o soporte inicial para libras;
- política futura de sonido y notificaciones del sistema para el descanso;
- posibilidad de crear ejercicios personalizados;
- restauración o eliminación administrativa de rutinas archivadas;
- política de eliminación de cuenta y sus datos.
