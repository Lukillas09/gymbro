import Link from "next/link";

export default function ExerciseProgressNotFound() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-8 lg:py-16">
      <section className="border-y border-[#343731] py-10">
        <p className="text-xs font-black uppercase text-[#858a82]">Progreso</p>
        <h1 className="mt-3 text-2xl font-black text-white">
          No encontramos registros de este ejercicio
        </h1>
        <p className="mt-3 max-w-lg text-sm leading-6 text-[#a9ada6]">
          El detalle sólo existe para ejercicios con series en sesiones
          finalizadas.
        </p>
        <Link
          className="mt-7 inline-flex min-h-12 items-center rounded-lg bg-[#f4cf3a] px-5 text-sm font-black text-[#11120f] outline-none hover:bg-[#ffdc4f] focus-visible:ring-2 focus-visible:ring-white"
          href="/progress"
        >
          Volver a Progreso
        </Link>
      </section>
    </div>
  );
}
