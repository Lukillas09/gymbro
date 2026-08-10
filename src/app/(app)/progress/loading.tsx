export default function ProgressLoading() {
  return (
    <div
      aria-label="Cargando progreso"
      className="mx-auto w-full max-w-5xl animate-pulse px-4 py-7 sm:px-6 sm:py-9 lg:px-10 lg:py-12 motion-reduce:animate-none"
      role="status"
    >
      <div className="h-3 w-24 rounded bg-[#242723]" />
      <div className="mt-4 h-10 w-64 max-w-full rounded bg-[#242723]" />
      <div className="mt-4 h-5 w-full max-w-lg rounded bg-[#242723]" />
      <div className="mt-10 h-48 border-y border-[#292c28] bg-[#111310]" />
      <div className="mt-10 grid grid-cols-2 gap-px bg-[#292c28] sm:grid-cols-4">
        <div className="h-24 bg-[#111310]" />
        <div className="h-24 bg-[#111310]" />
        <div className="h-24 bg-[#111310]" />
        <div className="h-24 bg-[#111310]" />
      </div>
    </div>
  );
}
