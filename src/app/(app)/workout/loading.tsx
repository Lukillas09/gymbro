export default function WorkoutLoading() {
  return (
    <div
      aria-label="Cargando entrenamiento"
      className="mx-auto grid min-h-[60dvh] w-full max-w-3xl animate-pulse content-center gap-4 px-5"
      role="status"
    >
      <div className="h-4 w-28 rounded bg-[#2a2d29]" />
      <div className="h-10 w-64 max-w-full rounded bg-[#20231f]" />
      <div className="h-24 rounded bg-[#151815]" />
    </div>
  );
}
