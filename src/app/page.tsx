import Link from "next/link";

const exercises = [
  { name: "Sentadilla trasera", sets: "4 series", reps: "6 repeticiones" },
  { name: "Peso muerto rumano", sets: "3 series", reps: "8 repeticiones" },
  { name: "Prensa inclinada", sets: "3 series", reps: "10 repeticiones" },
  { name: "Plancha frontal", sets: "3 series", reps: "45 segundos" },
] as const;

const week = [
  { day: "L", label: "Lunes, completado", state: "completed" },
  { day: "M", label: "Martes, descanso", state: "rest" },
  { day: "X", label: "Miércoles, entrenamiento de hoy", state: "today" },
  { day: "J", label: "Jueves, descanso", state: "rest" },
  { day: "V", label: "Viernes, programado", state: "planned" },
] as const;

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f4f5f3] text-[#181a19]">
      <header className="border-b border-[#dfe2dd] bg-white">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5 sm:px-8">
          <Link className="text-xl font-black text-[#181a19]" href="/">
            GYMBRO
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm font-medium text-[#626761] sm:inline">
              Semana 4
            </span>
            <div
              aria-label="Perfil de Lucas"
              className="grid size-10 place-items-center rounded-full bg-[#202421] text-sm font-bold text-white"
            >
              LM
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-6xl gap-0 lg:grid-cols-[minmax(0,1.55fr)_minmax(300px,0.85fr)] lg:gap-8 lg:px-8 lg:py-8">
        <div className="min-w-0 bg-white lg:rounded-lg lg:border lg:border-[#dfe2dd]">
          <section className="border-b border-[#e5e7e3] px-5 py-8 sm:px-8 sm:py-10">
            <p className="mb-3 text-xs font-bold uppercase text-[#687069]">
              Miércoles · Entrenamiento de hoy
            </p>
            <h1 className="max-w-xl text-4xl leading-tight font-black sm:text-5xl">
              Piernas y core
            </h1>
            <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-[#5d625d]">
              <span>
                <strong className="font-bold text-[#181a19]">4</strong>{" "}
                ejercicios
              </span>
              <span>
                <strong className="font-bold text-[#181a19]">14</strong> series
              </span>
              <span>
                <strong className="font-bold text-[#181a19]">50</strong> min
              </span>
            </div>
            <a
              className="mt-7 flex h-14 w-full items-center justify-between rounded-lg bg-[#f4cf3a] px-5 text-base font-extrabold text-[#181a19] transition-colors hover:bg-[#e7bd1e] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#181a19] sm:max-w-xs"
              href="#rutina"
            >
              Ver rutina
              <span aria-hidden="true" className="text-xl">
                →
              </span>
            </a>
          </section>

          <section id="rutina" aria-labelledby="routine-title">
            <div className="flex items-end justify-between px-5 pt-7 pb-3 sm:px-8">
              <div>
                <p className="text-xs font-bold uppercase text-[#687069]">
                  Rutina B
                </p>
                <h2 id="routine-title" className="mt-1 text-xl font-extrabold">
                  Plan de hoy
                </h2>
              </div>
              <span className="text-sm font-semibold text-[#687069]">
                50 min
              </span>
            </div>

            <ol className="px-5 pb-6 sm:px-8">
              {exercises.map((exercise, index) => (
                <li
                  className="grid min-h-20 grid-cols-[2.5rem_minmax(0,1fr)_auto] items-center gap-3 border-b border-[#e5e7e3] last:border-0"
                  key={exercise.name}
                >
                  <span className="grid size-10 place-items-center rounded-md bg-[#eef0ec] text-xs font-extrabold text-[#5b625c]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-bold sm:text-base">
                      {exercise.name}
                    </h3>
                    <p className="mt-1 text-xs text-[#6b716c] sm:text-sm">
                      {exercise.sets}
                    </p>
                  </div>
                  <span className="text-right text-xs font-bold text-[#3f4540] sm:text-sm">
                    {exercise.reps}
                  </span>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <aside
          id="progreso"
          className="border-t border-[#dfe2dd] bg-[#f4f5f3] px-5 py-7 sm:px-8 lg:border-0 lg:p-0"
          aria-label="Resumen de progreso"
        >
          <section className="bg-[#202421] p-5 text-white lg:rounded-lg">
            <p className="text-xs font-bold uppercase text-[#b6bdb7]">
              Tu semana
            </p>
            <div className="mt-2 flex items-end justify-between gap-3">
              <h2 className="text-2xl font-extrabold">1 de 3</h2>
              <span className="pb-1 text-xs font-medium text-[#b6bdb7]">
                entrenamientos
              </span>
            </div>

            <div className="mt-6 grid grid-cols-5 gap-2">
              {week.map((item) => (
                <div className="text-center" key={item.day}>
                  <div
                    aria-label={item.label}
                    className={`grid aspect-square w-full place-items-center rounded-md text-xs font-bold ${
                      item.state === "completed"
                        ? "bg-[#54b58a] text-[#10251b]"
                        : item.state === "today"
                          ? "border-2 border-white bg-white text-[#202421]"
                          : "border border-[#4a514b] text-[#c4cac5]"
                    }`}
                  >
                    {item.day}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-5 border-y border-[#dfe2dd] py-5 lg:rounded-lg lg:border lg:bg-white lg:p-5">
            <p className="text-xs font-bold uppercase text-[#687069]">
              Última mejora
            </p>
            <div className="mt-3 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-extrabold">Sentadilla trasera</h2>
                <p className="mt-1 text-sm text-[#687069]">Viernes pasado</p>
              </div>
              <strong className="shrink-0 text-xl font-black text-[#167755]">
                +2,5 kg
              </strong>
            </div>
          </section>

          <p className="mt-6 text-sm leading-6 text-[#687069]">
            Tu próxima meta es completar tres entrenamientos esta semana.
          </p>
        </aside>
      </main>
    </div>
  );
}
