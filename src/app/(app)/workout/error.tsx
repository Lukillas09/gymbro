"use client";

export default function WorkoutError({ reset }: { reset: () => void }) {
  return (
    <main className="mx-auto grid min-h-[60dvh] w-full max-w-xl place-content-center gap-4 px-5 text-center">
      <h1 className="text-2xl font-black text-white">
        No pudimos cargar el entrenamiento
      </h1>
      <p className="text-sm text-[#a9ada6]">
        La sesión guardada sigue en PostgreSQL. Podés volver a intentarlo.
      </p>
      <button
        className="mx-auto min-h-12 rounded-md bg-[#f4cf3a] px-5 text-sm font-black text-[#11120f]"
        onClick={reset}
        type="button"
      >
        Reintentar
      </button>
    </main>
  );
}
