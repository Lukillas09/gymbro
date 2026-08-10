export default function PrivateLoading() {
  return (
    <div
      aria-label="Cargando GymBro"
      className="mx-auto w-full max-w-5xl animate-pulse px-4 py-8 sm:px-8"
      role="status"
    >
      <div className="h-4 w-24 rounded bg-[#242723]" />
      <div className="mt-14 h-3 w-32 rounded bg-[#242723]" />
      <div className="mt-4 h-12 w-full max-w-xl rounded bg-[#1b1e1a]" />
      <div className="mt-3 h-12 w-4/5 max-w-lg rounded bg-[#1b1e1a]" />
      <div className="mt-8 h-14 w-full max-w-64 rounded bg-[#34301a]" />
    </div>
  );
}
