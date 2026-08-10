"use client";

export default function PrivateError({
  reset,
}: Readonly<{ reset: () => void }>) {
  return (
    <div className="mx-auto grid min-h-[60dvh] w-full max-w-3xl content-center px-4 py-12 sm:px-8">
      <p className="text-xs font-black uppercase text-[#858a82]">GymBro</p>
      <h1 className="mt-3 text-3xl font-black text-white">
        No pudimos actualizar este momento.
      </h1>
      <p className="mt-3 max-w-xl text-sm leading-6 text-[#a7aba4]">
        Tus datos guardados siguen intactos. Intentá cargar la vista nuevamente.
      </p>
      <button
        className="mt-7 min-h-12 w-full rounded-md bg-[#f4cf3a] px-5 text-sm font-black text-[#11120f] hover:bg-[#ffdc4f] sm:w-fit"
        onClick={reset}
        type="button"
      >
        Reintentar
      </button>
    </div>
  );
}
