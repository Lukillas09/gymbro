export default function HistoryLoading() {
  return (
    <div
      aria-label="Cargando historial"
      className="mx-auto w-full max-w-4xl animate-pulse px-4 py-7 sm:px-8 sm:py-10 lg:py-14 motion-reduce:animate-none"
      role="status"
    >
      <div className="h-3 w-20 rounded bg-[#242723]" />
      <div className="mt-4 h-11 w-52 rounded bg-[#242723]" />
      <div className="mt-10 h-3 w-28 rounded bg-[#242723]" />
      <div className="mt-4 space-y-px bg-[#292c28]">
        <div className="h-28 bg-[#0b0d0b]" />
        <div className="h-28 bg-[#0b0d0b]" />
        <div className="h-28 bg-[#0b0d0b]" />
      </div>
    </div>
  );
}
