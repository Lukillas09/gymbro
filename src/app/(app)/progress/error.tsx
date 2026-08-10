"use client";

export default function ProgressError({
  reset,
}: Readonly<{ reset: () => void }>) {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 lg:px-10">
      <section className="border-y border-[#343731] py-10">
        <p className="text-xs font-black uppercase text-[#858a82]">Progreso</p>
        <h1 className="mt-3 text-2xl font-black text-white">
          No pudimos cargar tus registros
        </h1>
        <p className="mt-3 max-w-lg text-sm leading-6 text-[#a9ada6]">
          Tus entrenamientos siguen guardados. Volvé a intentar la consulta.
        </p>
        <button
          className="mt-7 min-h-12 rounded-lg bg-[#f4cf3a] px-5 text-sm font-black text-[#11120f] outline-none hover:bg-[#ffdc4f] focus-visible:ring-2 focus-visible:ring-white"
          onClick={reset}
          type="button"
        >
          Reintentar
        </button>
      </section>
    </div>
  );
}
