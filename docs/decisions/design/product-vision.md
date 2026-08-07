# GymBro — Product Vision & Design Philosophy

> Status: Product North Star
> Scope: UX, UI, product identity and long-term experience
> Last updated: 2026-08-07

This document defines the long-term product and design vision of GymBro.

It is a source of direction, not an implementation checklist.

Features described here must be implemented incrementally according to
the current roadmap and task scope.

The core principle is:

> GymBro no tiene que parecer una aplicación donde administrás entrenamientos.
> Tiene que parecer una aplicación con la que entrenás.

---

# PROMPT MAESTRO — IDENTIDAD Y EXPERIENCIA DE GYMBRO

Contexto

Estamos desarrollando una aplicación llamada GymBro.

GymBro es una aplicación de entrenamiento enfocada principalmente en musculación, hipertrofia y fuerza.

No queremos construir simplemente otro tracker donde el usuario ingresa:

peso;
series;
repeticiones;
ejercicios;
estadísticas.

La ambición del producto es mucho mayor.

La idea central es:

GymBro debe convertirse en la representación digital de la vida del usuario en el gimnasio.

Queremos que una persona no abra GymBro solamente porque necesita registrar una serie.

Queremos que sienta:

“Acá está mi entrenamiento.”

Sus rutinas.

Sus marcas.

Sus PRs.

Sus entrenamientos.

Su evolución.

Sus músculos trabajados.

Su consistencia.

Sus logros.

Su historia.

Sus GymBros.

Su identidad deportiva.

1. NORTE ABSOLUTO DEL PRODUCTO

Toda decisión de diseño y UX debe evaluarse utilizando esta frase:

GymBro no tiene que parecer una aplicación donde administrás entrenamientos. Tiene que parecer una aplicación con la que entrenás.

Una aplicación de administración prioriza:

formularios,
tablas,
configuraciones,
dashboards,
menús,
listas.

GymBro debe priorizar:

Qué hago ahora.

Qué hice la última vez.

Qué debería intentar ahora.

Qué viene después.

Estoy progresando o no.

Durante un entrenamiento real el usuario puede estar:

cansado,
transpirado,
escuchando música,
sosteniendo el teléfono con una sola mano,
con pocos segundos antes de la siguiente serie.

Por lo tanto:

la carga cognitiva durante Entrenar debe ser extremadamente baja.

2. GYMBRO ESTÁ “VIVO”

Este debe convertirse en uno de los conceptos fundamentales de la identidad.

GymBro no debería sentirse como un conjunto de páginas estáticas.

Debe reaccionar al estado actual del usuario.

La aplicación sabe:

qué estaba entrenando,
qué está entrenando,
qué hizo anteriormente,
qué acaba de conseguir,
qué debe hacer después.

Por eso la interfaz también debe reaccionar.

GymBro tiene tres estados visuales principales:

IDLE

El usuario está explorando.

Por ejemplo:

Perfil,
Biblioteca,
Configuración,
Historial.

La aplicación está tranquila.

Visualmente:

negro profundo,
blanco,
grises,
muy poco amarillo,
movimiento mínimo,
mucho espacio.

Debe sentirse:

premium, sobria, personal.

READY

Existe algo que el usuario puede hacer.

Ejemplo:

Hoy toca Push.

GymBro empieza a cobrar energía.

El entrenamiento del día domina Home.

Aparece más amarillo.

Puede aparecer una representación visual de los músculos a trabajar.

El CTA principal es evidente.

Ejemplo:

HOY
PUSH
Pecho · Hombros · Tríceps
7 ejercicios · ~65 min

EMPEZAR ENTRENAMIENTO

La interfaz comunica:

“Estoy listo cuando vos estés listo.”

LIVE

El usuario toca:

ENTRENAR

GymBro cambia de estado.

No debe sentirse simplemente como haber navegado a otra página.

Debe sentirse como si la aplicación se hubiera encendido.

3. LA ANALOGÍA DEL AUTO DEPORTIVO

Esta metáfora debe utilizarse para tomar decisiones de diseño.

Un auto deportivo estacionado puede ser:

elegante,
sobrio,
limpio.

No necesita mostrar veinte indicadores.

Pero al arrancarlo:

se enciende el tablero,
aparecen indicadores relevantes,
el tacómetro cobra protagonismo,
la interfaz cambia,
todo se orienta a conducir.

GymBro debe funcionar igual.

Fuera del entrenamiento:

premium + tranquilo.

Durante entrenamiento:

performance + energía.

No debemos utilizar el mismo nivel de intensidad visual en todas las pantallas.

Entrenar tiene que sentirse diferente.

4. EL AMARILLO NO ES DECORACIÓN

El amarillo de GymBro tiene significado.

No debe utilizarse solamente porque “es el color de marca”.

Debe representar principalmente:

acción, actividad, progreso, estado vivo y atención.

Cuanto más activo está GymBro, mayor puede ser su presencia.

IDLE

5–10 % de presencia visual.

READY

10–20 %.

LIVE

puede tener más protagonismo.

Nunca convertir toda la interfaz en amarillo.

Si todo es amarillo, nada es importante.

5. PERSONALIDAD SIN FRASES ARTIFICIALES

GymBro se llama “Bro”, pero no queremos que constantemente diga:

VAMOS BRO 🔥

DALE CAMPEÓN

NO PAIN NO GAIN

ROMPE TUS LÍMITES

Eso rápidamente se vuelve artificial.

El “Bro” debe aparecer por comportamiento.

GymBro demuestra que es tu compañero porque:

se acuerda.

Por ejemplo:

La última vez hiciste 80 × 8.

Después:

80 × 9

GymBro responde:

+1 rep.

Y la próxima sesión:

La última vez hiciste 80 × 9.

Ahí está el concepto de compañero.

No en utilizar la palabra “bro”.

6. EL PROGRESO ES LA RECOMPENSA

No queremos crear un sistema adictivo artificial.

No queremos utilizar:

lootboxes,
monedas,
puntos sin significado,
XP innecesaria,
notificaciones manipulativas,
recompensas por abrir la app,
rachas punitivas.

La recompensa debe ser:

descubrir que mejoraste.

GymBro tiene un loop de progreso real.

Paso 1 — Recordar

GymBro muestra:

Última vez: 80 × 8.

Paso 2 — Objetivo

GymBro puede mostrar:

Objetivo: intentar 9.

Paso 3 — Acción

El usuario entrena.

Paso 4 — Resultado

Registra:

80 × 9.

Paso 5 — Reconocimiento

GymBro muestra:

↑ +1 rep.

Paso 6 — Persistencia

Ese resultado queda registrado.

Paso 7 — Construcción

Su historial, perfil y Training Signature evolucionan.

Paso 8 — Memoria

La siguiente sesión:

Última vez: 80 × 9.

Ese ciclo debe ser uno de los corazones del producto.

7. LAS TRES FORMAS DE SATISFACCIÓN

Toda la experiencia de GymBro debería generar satisfacción en tres escalas diferentes.

A. SATISFACCIÓN INMEDIATA

Sucede durante segundos.

Ejemplo:

completar una serie.

Puede provocar:

haptic,
microanimación,
check,
transición automática al descanso.

Tiene que existir esa sensación de:

“Listo.”

B. SATISFACCIÓN DE PROGRESO

Sucede durante días o semanas.

Ejemplo:

80 × 8 → 80 × 9

o:

80 kg → 82,5 kg

o:

Nuevo PR.

La aplicación debe detectar y destacar estas mejoras.

C. SATISFACCIÓN DE CONSTRUCCIÓN

Sucede durante meses o años.

Esta es probablemente la más diferenciadora de GymBro.

El usuario siente:

mi historial crece;

mi perfil crece;

mi Training Signature cambia;

mis Session Capsules se acumulan;

mi mapa muscular refleja mi entrenamiento;

aparecen mis hitos;

mi año se construye.

La aplicación se convierte en algo que ganó valor porque el usuario la utilizó.

8. TRAINING SIGNATURE

Una de las características visuales más importantes de GymBro debe ser la:

Training Signature

Es una representación gráfica única del entrenamiento del usuario.

No debe ser una puntuación.

NO queremos:

Fitness score: 83/100.

Eso da una falsa impresión científica y genera preguntas como:

¿por qué soy 83?

¿qué significa llegar a 90?

Training Signature debe ser principalmente:

identidad visual + representación de patrones reales de entrenamiento.

9. QUÉ DEBERÍA REPRESENTAR

Una primera versión podría utilizar información de las últimas 4–8 semanas:

distribución muscular,
frecuencia de entrenamiento,
consistencia,
progresión,
cantidad de PRs,
volumen relativo.

Pero no debe presentarlos como precisión fisiológica absoluta.

Su objetivo es:

“Así se ve mi entrenamiento.”

10. CÓMO IMPLEMENTAR TRAINING SIGNATURE

Preferentemente generar el gráfico mediante SVG/CSS/Canvas.

NO mediante imágenes stock.

Debe ser determinista.

Eso significa:

los mismos datos producen aproximadamente la misma firma.

Ejemplo conceptual:

Distribución muscular

controla segmentos o direcciones.

Frecuencia

controla densidad.

Consistencia

controla continuidad de las líneas.

Progreso reciente

controla expansión o amplitud.

PRs

pueden introducir pequeños puntos o marcas.

Volumen

puede modificar peso visual.

No hace falta utilizar exactamente esos parámetros.

Lo importante es:

los cambios gráficos deben provenir de datos reales.

11. LA FIRMA NO DEBE CAMBIAR CAÓTICAMENTE

Si cambia completamente después de cada serie pierde identidad.

Debe evolucionar lentamente.

Una buena estrategia inicial sería recalcular:

cuando termina un entrenamiento

pero utilizando datos de varias semanas.

Eso produce cambios graduales.

Se podría guardar eventualmente:

una snapshot semanal,
una mensual,
una anual.

Así en el futuro podríamos mostrar:

Tu Training Signature — enero

vs.

Tu Training Signature — diciembre.

12. EL PERFIL DEJA DE SER UNA PÁGINA

El perfil actual no debe concebirse como:

información del usuario.

Debe convertirse en:

la identidad del usuario dentro de GymBro.

El usuario debería sentir:

“Esto me representa.”

La referencia psicológica puede ser Instagram:

la gente cuida su avatar,
su perfil,
sus highlights,
sus fotos.

Pero NO queremos copiar Instagram funcionalmente.

Queremos replicar:

la sensación de ownership.

13. QUÉ NO DEBE DOMINAR PERFIL

No poner como contenido principal:

sexo,
fecha de nacimiento,
altura,
unidad preferida,
configuración técnica.

Eso pertenece a:

Configuración / Datos personales.

El perfil debería mostrar:

identidad + historia + progreso.

14. CABECERA DEL PERFIL

Una posible arquitectura:

Avatar

Lucas

@lucasmartinez.09

Intermedio · Hipertrofia

Training Signature.

Después:

126
Entrenos

18
PRs

9
GymBros

Luego:

Editar perfil

Compartir perfil

15. ELEMENTOS “DESTACADOS”

Podemos inspirarnos conceptualmente en los highlights de Instagram.

Pero deben ser deportivos.

Por ejemplo:

PRs

Rutinas

Logros

Favoritos

2026

No son stories.

Son pequeñas colecciones de la identidad deportiva del usuario.

16. SESSION CAPSULE

Cada entrenamiento completado genera automáticamente una:

Session Capsule

Una Session Capsule es una pieza visual que representa ese entrenamiento.

No es solamente una fila en una tabla.

Debe sentirse como:

un recuerdo de esa sesión.

17. INFORMACIÓN DE UNA SESSION CAPSULE

Ejemplo:

PUSH

7 AGO 2026

1 h 04 min

22 series

Pecho · Hombros · Tríceps

Press banca

80 × 9

+1 REP

1 PR

No todas deben mostrar exactamente la misma información.

Se debe priorizar aquello que hizo particular a esa sesión.

18. TRES REPRESENTACIONES DE LA MISMA CAPSULE

Una Session Capsule debería poder tener:

Compact

Para el grid del perfil.

Detail

Cuando el usuario entra a verla.

Share

Formato preparado para compartir externamente.

Así reutilizamos la misma identidad gráfica.

19. NO OBLIGAR AL USUARIO A “CREAR CONTENIDO”

Esto es fundamental.

No queremos pedir:

subir una foto,
escribir descripción,
hashtags,
publicar.

El usuario entrenó.

Eso es suficiente.

GymBro transforma el entrenamiento en una pieza de su historia.

Esto diferencia mucho al producto de una red social.

20. EL GRID DEL PERFIL

En lugar de fotos:

Session Capsules.

Ejemplo:

┌──────────────┐ ┌──────────────┐
│ PUSH │ │ PULL │
│ 07 AGO │ │ 05 AGO │
│ │ │ │
│ +1 PR │ │ 58 MIN │
└──────────────┘ └──────────────┘

┌──────────────┐ ┌──────────────┐
│ LEGS │ │ PUSH │
│ 03 AGO │ │ 01 AGO │
│ │ │ │
│ 9.820 KG │ │ +2 PR │
└──────────────┘ └──────────────┘

La acumulación produce satisfacción.

Después de 100 sesiones:

el usuario puede ver visualmente su historia.

21. EL PERFIL NO DEBE PARECER UN DASHBOARD

Evitar:

20 cards estadísticas,
gráficos diminutos,
KPI por todos lados.

Más identidad.

Menos dashboard.

Debe haber espacio.

Jerarquía.

Piezas visuales grandes.

Contenido que represente al usuario.

22. ELEMENTOS VISUALES GENERADOS POR GYMBRO

Queremos eliminar casi completamente fotografías stock.

No usar como identidad principal:

personas levantando pesas,
discos genéricos,
gimnasios oscuros,
mancuernas cinematográficas.

Eso se ve bien, pero podría pertenecer a cualquier marca.

Los elementos visuales de GymBro deberían venir principalmente de:

Training Signature,
mapa muscular,
Session Capsules,
datos personales,
progresión,
tipografía,
geometrías propias,
animaciones propias.

Queremos que una captura pueda identificarse como GymBro sin necesitar ver el logo.

23. LENGUAJE GRÁFICO PROPIO

Crear un lenguaje visual alrededor de:

líneas,
anillos,
segmentos,
placas,
presión,
movimiento,
carga.

Una buena referencia conceptual son:

los discos de una barra.

No utilizar fotografías de discos.

Utilizar su geometría:

círculos concéntricos,
capas,
peso,
segmentos.

Por ejemplo, una Session Capsule podría incorporar anillos relacionados con volumen o grupos musculares.

24. PATRONES SEGÚN EL ENTRENAMIENTO

Se puede explorar un sistema donde ciertas distribuciones musculares generen diferentes composiciones.

Ejemplo conceptual:

Push:

líneas que se expanden.

Pull:

líneas que convergen.

Legs:

formas verticales/pesadas.

Full Body:

composición cerrada o radial.

No codificar arbitrariamente:

“Push siempre es una imagen X”.

Preferentemente derivarlo de los músculos realmente trabajados.

Así incluso rutinas personalizadas producen diseños coherentes.

25. HOME NO ES FIJO

Home debe tener una:

composición adaptativa.

No significa utilizar un layout aleatorio cada día.

Significa que GymBro decide qué es más importante según el contexto actual.

26. POSIBLES ESTADOS DE HOME
    Sin rutina

Prioridad:

crear rutina.

Rutina preparada

Prioridad:

entrenamiento de hoy.

Entrenamiento activo

Prioridad:

continuar sesión.

Entrenamiento terminado hoy

Prioridad:

resumen / progreso conseguido.

Día de descanso

Prioridad:

descanso + siguiente entrenamiento.

27. HOME READY

Ejemplo:

VIERNES 7 AGO

HOY
PUSH

Pecho · Hombros · Tríceps

7 ejercicios · ~65 min

EMPEZAR ENTRENAMIENTO

Debajo solamente uno o dos elementos relevantes.

Ejemplo:

LA ÚLTIMA VEZ

Press banca

80 × 8

Hoy podrías intentar 80 × 9.

Luego:

TU SEMANA

Nada más es necesario arriba.

28. BRO CUES

Crear un componente conceptual llamado:

Bro Cue

Son pequeñas intervenciones de GymBro.

No parecen mensajes de chatbot.

Ejemplos:

La última vez hiciste 8 reps.

Te queda 1 ejercicio.

+1 rep.

Nuevo PR.

Hace 3 sesiones que utilizás 80 kg.

Esta semana entrenaste pecho 2 veces.

Deben ser:

breves,
contextuales,
basadas en datos reales.

Nunca inventar recomendaciones.

29. EVITAR SOBRECARGAR HOME

No poner simultáneamente:

peso semanal,
volumen total,
PRs,
gráficos,
mapa muscular,
actividad social,
logros,
calendario,
routine overview.

Regla:

1 hero + 1 insight + 1 resumen pequeño.

30. TRAINING MODE

Entrar a Entrenar debe cambiar la experiencia.

Idealmente ocultar o reducir mucho:

navegación global,
branding,
estadísticas secundarias.

La prioridad absoluta es la serie.

Ejemplo:

× PUSH 38:42
3 / 7

PRESS BANCA

Última sesión
80×8 80×8 80×7

✓ Serie 1 80 kg 8
● Serie 2 80 kg
Serie 3 80 kg 8–10
Serie 4 80 kg 8–10

              80
              KG

               9
             REPS


       COMPLETAR SERIE

31. REGISTRAR UNA SERIE

Objetivo:

1–2 acciones cuando los datos no cambiaron demasiado.

GymBro debe recordar:

peso anterior,
serie anterior,
última sesión.

Si la serie anterior fue:

80 × 8

la siguiente puede arrancar con:

80 kg
8 reps

El usuario puede simplemente:

COMPLETAR

o cambiar 8 → 9.

No volver a introducir todo.

32. COMPLETAR SERIE

No mostrar:

¿Estás seguro?

Registrar inmediatamente.

Mostrar durante algunos segundos:

✓ 80 × 9

Deshacer

Undo es mejor que confirmación.

33. MICROINTERACCIÓN DE SERIE COMPLETADA

Al tocar completar:

haptic ligero;
el botón responde;
los datos pasan al historial;
aparece el check;
una línea/acento amarillo puede atravesar brevemente el componente;
comienza descanso automáticamente.

Duración rápida.

No convertirlo en una celebración.

34. DESCANSO

El descanso no abre obligatoriamente otra pantalla.

La misma zona se transforma.

Antes:

COMPLETAR SERIE

Después:

01:29

DESCANSO

+15 s

Saltar

Próxima:

Serie 3 · 80 kg · 8–10

El cambio:

trabajo → descanso

debe sentirse orgánico.

35. HAPTICS

Donde la plataforma lo permita:

Tap normal

muy leve.

Serie completada

haptic claro pero corto.

Descanso terminado

patrón diferente.

PR

haptic especial.

En PWA/web debemos usar degradación elegante cuando el dispositivo o navegador no soporta vibración.

Nunca depender del haptic para comunicar información.

36. CUANDO EXISTE PROGRESO

Serie anterior:

80 × 8.

Actual:

80 × 9.

Después de completar:

80 × 9
↑ +1 REP

Puede existir una animación ligeramente más intensa.

El producto no necesita decir:

¡SOS INCREÍBLE!

El dato es suficientemente satisfactorio.

El progreso es la celebración.

37. PR

El PR sí es un evento especial.

Puede utilizar:

haptic diferente,
animación amarilla más extensa,
badge específico,
Session Capsule especial.

Pero evitar confetti constante.

Los eventos raros pueden ser espectaculares precisamente porque son raros.

38. TRAINING SIGNATURE + SESSION CAPSULE + PERFIL

Estos tres sistemas están relacionados.

Entrenás.

↓

Se genera Session Capsule.

↓

La Capsule entra en tu historia.

↓

Tus estadísticas cambian.

↓

Training Signature evoluciona.

↓

Perfil cambia.

↓

Tu identidad digital crece.

Este es uno de los loops centrales de pertenencia.

39. ELEMENTOS COLECCIONABLES

Queremos sensación de construcción, pero no economía artificial.

Hitos posibles:

10 entrenamientos

25

50

100

250

500

1 año

Primer PR

10 PRs

etc.

40. CÓMO DEBEN FUNCIONAR LOS HITOS

No simplemente:

Achievement unlocked +20 XP.

El hito puede desbloquear pequeñas variantes visuales.

Ejemplo:

una variación del marco de Training Signature,
una geometría nueva,
un pequeño detalle de perfil,
un estilo especial de Capsule,
un badge discreto.

La sensación buscada:

“Mi perfil está creciendo conmigo.”

41. NO VENDER PODER

Si en el futuro existen planes premium:

no bloquear detrás de pago la satisfacción básica.

Registrar entrenamientos debe seguir siendo excelente.

Lo premium puede ofrecer:

más análisis,
más personalización,
más variantes visuales,
comparaciones históricas,
insights avanzados.

Pero nunca:

pagar para que tu entrenamiento básico sea agradable.

42. MAPA MUSCULAR

El mapa muscular puede ser otra pieza visual emblemática.

Utilizar una figura propia de GymBro.

No anatomía hiperrealista.

Debe funcionar:

frontal + posterior.

Los músculos cambian de intensidad según la métrica seleccionada.

Ejemplo:

últimos 7 días,
últimas 4 semanas,
rutina actual.

43. EVITAR FALSA PRECISIÓN

No mostrar:

Pectoral: 73,49 %.

Preferible:

bajo,
medio,
alto,

o cuatro niveles de intensidad.

El mapa es una representación interpretativa del entrenamiento registrado.

No una medición clínica.

44. GYMBRO YEAR

Una feature futura fundamental:

GymBro Year

Al finalizar el año, crear un resumen de toda la vida deportiva del usuario durante ese período.

Inspiración conceptual:

Spotify Wrapped.

Pero completamente GymBro.

45. INFORMACIÓN POSIBLE

Por ejemplo:

186 entrenamientos

142 horas entrenando

42 PRs

Ejercicio más realizado:

Press banca

Músculo más entrenado:

Espalda

Mayor progreso:

Press banca +17,5 kg

Mes más consistente:

Abril

Rutina más utilizada:

Push Pull Legs

Día favorito:

Lunes

Más:

Training Signature enero vs diciembre.

46. GYMBRO YEAR DEBE SER UNA EXPERIENCIA

No solamente una página estadística.

Puede utilizar:

pantallas completas,
transiciones,
tipografía grande,
Session Capsules,
mapa muscular,
Training Signature.

Debe sentirse como:

“Este fue mi año entrenando.”

47. COMPARTIR

GymBro Year y Session Capsules deben diseñarse pensando en compartir externamente.

Por ejemplo:

Instagram Stories,
WhatsApp,
otras plataformas.

No hace falta convertir GymBro internamente en Instagram.

Esto permite crecimiento orgánico sin introducir:

feed,
algoritmo,
influencers.

48. GYMBROS

Si posteriormente existe componente social:

la relación debe ser:

GymBros

idealmente mutua.

No:

followers/following.

Podrían verse eventos como:

Mateo terminó Pull.

Juan consiguió PR en press banca.

Nico empezó Legs.

Reacciones rápidas:

💪
🔥
👏

Pero evitar:

feed infinito,
contenido viral,
conteo público obsesivo,
algoritmo de engagement.

49. DISEÑO VISUAL

La estética general:

moderna + premium + deportiva + tecnológica + personal.

No queremos:

hardcore gym,
fuego,
calaveras,
metal exagerado,
neón,
interfaces gamer.

Tampoco:

minimalismo clínico excesivo.

50. BASE VISUAL

Background:

negro profundo, no necesariamente #000.

Surfaces:

grises muy oscuros.

Texto:

blanco ligeramente cálido.

Secondary:

gris.

Accent:

GymBro Yellow.

El amarillo debe estar tokenizado:

accent-primary

No utilizar variantes arbitrarias por pantalla.

51. TIPOGRAFÍA

Utilizar una excelente sans-serif para interfaz.

Ejemplos conceptuales:

Geist,
Inter,

o equivalente.

Para números grandes o títulos de rendimiento se puede explorar una segunda familia ligeramente condensada.

Pero debe mantenerse legibilidad.

Usar números tabulares para:

timers,
pesos,
repeticiones,
estadísticas.

52. NÚMEROS COMO ELEMENTO DE IDENTIDAD

Durante entrenamiento:

80

KG

9

REPS

01:29

Los números pueden tener mucha más importancia gráfica que iconos o fotografías.

GymBro es una aplicación basada en progreso cuantificable.

Los datos del usuario deben convertirse en estética.

53. EVITAR CARD-IFICATION

No meter todo dentro de una card.

Utilizar:

espacio,
tipografía,
alineación,
fondos,
contraste.

Una card debe existir porque agrupa algo.

No porque todos los componentes “necesitan borde”.

54. MENOS BORDES

Reducir drásticamente:

bordes visibles,
separadores innecesarios,
cajas.

Queremos que el diseño respire.

55. MOVIMIENTO

Las animaciones deben responder a eventos.

No utilizar movimiento constante solamente porque queda atractivo.

Tiempos orientativos:

tap/respuesta:

100–180 ms

transiciones:

200–350 ms

evento especial como PR:

400–800 ms

Respetar:

prefers-reduced-motion.

56. UNA ACCIÓN DOMINANTE

Especialmente durante entrenamiento:

debería existir una acción visual dominante.

Ejemplo:

COMPLETAR SERIE

No competir simultáneamente con cinco CTAs amarillos.

57. HOME CAMBIA, NO CRECE

A medida que agreguemos funcionalidades no queremos que Home termine teniendo:

15 módulos.

GymBro selecciona qué mostrar.

La inteligencia consiste también en ocultar información que no es relevante ahora.

58. PERFIL CRECE, NO SE LLENA DE ESTADÍSTICAS

A medida que el usuario acumula entrenamiento:

el perfil gana historia.

No necesariamente más widgets.

Crece mediante:

Session Capsules,
Training Signature,
logros,
GymBro Year.

59. PRINCIPIO DE IMPLEMENTACIÓN

Antes de crear cada feature preguntar:

¿Qué aporta esto a entrenar mejor, comprender el progreso o construir identidad?

Si no aporta ninguna:

probablemente no debería ocupar espacio importante.

60. QUÉ NO QUEREMOS CONSTRUIR

No queremos que GymBro termine siendo:

Excel negro con amarillo.

No queremos:

dashboard SaaS,
red social genérica,
TikTok fitness,
juego RPG de gimnasio,
chatbot disfrazado de entrenador,
Instagram con pesas.

GymBro debe tener una identidad propia.

61. ESTRATEGIA DE IMPLEMENTACIÓN TÉCNICA

No implementar toda esta visión simultáneamente.

Trabajar incrementalmente.

FASE 1 — Fundamentos visuales

Primero establecer:

design tokens,
tipografía,
espaciado,
colores,
navigation,
button system,
surface system,
motion primitives.

Eliminar progresivamente el diseño provisional.

FASE 2 — Training Mode

Prioridad máxima.

Implementar:

sesión activa,
ejercicio activo,
serie activa,
registro rápido,
herencia de peso/reps,
Undo,
temporizador,
transiciones,
estado LIVE.

Hasta que esta experiencia sea excelente, no priorizar features decorativas.

FASE 3 — Home adaptativo

Implementar estados:

no routine,
ready,
live,
completed,
rest.

Crear:

Bro Cue.

Home debe derivarse del estado real.

No de contenido ficticio.

FASE 4 — Perfil

Separar:

identidad

de:

configuración.

Crear nuevo Profile Header.

Después:

stats importantes,
Training Signature placeholder,
Session Capsule grid,
highlights.

FASE 5 — Session Capsules

Crear modelo de representación.

No necesariamente nueva tabla al principio.

La Capsule puede derivarse de:

session + sets + exercises + PRs.

Crear:

compact,
detail,
share representation.

Solo persistir metadata adicional si realmente es necesario.

FASE 6 — Training Signature

Primera versión determinista.

Generarla con SVG.

Usar datos existentes.

No IA generativa.

No score.

No afirmar precisión científica.

FASE 7 — Progreso + Muscle Map

Construir una sección donde primero se interprete:

estás mejorando / estable / retrocediste.

Después mostrar evidencia.

No empezar con 15 gráficos.

FASE 8 — Hitos

Crear achievements útiles.

Después vincular algunos con variaciones visuales del perfil.

FASE 9 — GymBro Year

Construir solamente cuando exista suficiente historial real.

Debe derivarse únicamente de datos registrados.

FASE 10 — GymBros

Agregar después de que la identidad individual sea sólida.

Primero tiene que existir:

yo dentro de GymBro

antes de construir:

mis amigos dentro de GymBro.

62. REGLAS TÉCNICAS IMPORTANTES

La interfaz debe derivar de datos reales siempre que sea posible.

No duplicar lógica únicamente para UI.

Centralizar estados derivados:

trainingState,
progressState,
homeState.

Evitar:

booleanos independientes que produzcan estados imposibles.

Ejemplo conceptual:

type GymBroState =
| "idle"
| "ready"
| "live"

Y para Home algo más específico:

type HomeState =
| "no-routine"
| "ready"
| "training"
| "completed"
| "rest"

No necesariamente utilizar exactamente estos nombres.

La idea es modelar explícitamente la experiencia.

63. ACCESIBILIDAD

El diseño premium no puede sacrificar usabilidad.

Durante entrenamiento:

targets táctiles mínimos ~44–48 px.

CTA principales idealmente ~52–56 px.

Contraste adecuado.

No depender únicamente del amarillo.

Soporte de:

reduced motion.

El usuario debe poder operar lo esencial con una mano.

64. MÉTRICAS UX QUE DEBERÍAMOS PODER EVALUAR

Especialmente para Training Mode:

Registrar serie sin cambiar peso

ideal:

1–2 taps.

Cambiar reps + completar

ideal:

2–3 interacciones.

Acceder al entrenamiento activo

1 tap desde cualquier zona importante.

Saber qué toca hoy

menos de:

2 segundos visuales.

Saber qué hizo la última vez

sin abrir historial.

65. CRITERIO DE ÉXITO DE LA IDENTIDAD

No alcanza con:

“se ve lindo”.

Queremos que eventualmente una persona vea una captura sin logo y pueda reconocer:

GymBro.

Eso debe conseguirse mediante la combinación de:

Training Signature,
Session Capsules,
Muscle Map,
tipografía,
geometría,
amarillo estratégico,
modo LIVE,
microinteracciones.

No mediante imágenes stock.

66. EXPERIENCIA EMOCIONAL BUSCADA

Primer día:

“Qué fácil es entrenar con esto.”

Después de dos semanas:

“Se acuerda de lo que hice.”

Después de dos meses:

“Estoy viendo mi progreso.”

Después de seis meses:

“Todo mi entrenamiento está acá.”

Después de años:

“Esta es mi historia en el gimnasio.”

67. DEFINICIÓN FINAL DE GYMBRO

GymBro no es simplemente:

un tracker.

GymBro no es:

una red social.

GymBro no es:

una IA fitness.

GymBro debe convertirse en:

la representación digital de tu vida en el gimnasio.

La aplicación:

registra lo que hacés,

recuerda lo que hiciste,

reconoce cuando mejorás,

construye tu historia,

y eventualmente:

te ayuda a decidir qué hacer después.

El usuario no debería sentir que alimenta una base de datos.

Debe sentir que cada entrenamiento construye algo suyo.

Instrucción final para la IA de desarrollo

No implementar estas ideas como una colección de features independientes.

Training Signature, Session Capsules, Home adaptativo, Profile Identity, Muscle Map, Progress Loop y GymBro Year forman parte del mismo sistema conceptual.

La secuencia fundamental es:

Entreno

→ GymBro registra

→ GymBro recuerda

→ GymBro reconoce el progreso

→ GymBro crea una Session Capsule

→ mi historial crece

→ mi Training Signature evoluciona

→ mi perfil cambia

→ comprendo mejor mi progreso

→ vuelvo a entrenar.

Ese ciclo es el corazón de GymBro.

Ante cualquier decisión de UX preguntarse:

¿Hace que GymBro se sienta más como algo con lo que entreno y menos como algo donde administro entrenamientos?

Y ante cualquier decisión visual:

¿Esto proviene de GymBro y de la historia del usuario o simplemente estamos decorando una aplicación fitness?

Si la respuesta es solamente decoración, buscar otra solución.
