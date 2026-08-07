import Link from "next/link";

export default function WorkoutNotFound() {
  return (
    <main className="mx-auto grid min-h-dvh w-full max-w-xl place-content-center gap-4 px-5 text-center">
      <h1 className="text-2xl font-black text-white">
        No encontramos ese entrenamiento
      </h1>
      <p className="text-sm leading-6 text-[#a9ada6]">
        Puede haber finalizado, pertenecer a otra cuenta o no existir.
      </p>
      <Link
        className="mx-auto inline-flex min-h-12 items-center justify-center rounded-md bg-[#f4cf3a] px-5 text-sm font-black text-[#11120f]"
        href="/workout"
      >
        Volver a Entrenar
      </Link>
    </main>
  );
}
