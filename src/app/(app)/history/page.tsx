import type { Metadata } from "next";
import { HistoryList } from "@/features/history/components/history-list";
import { listCompletedWorkouts } from "@/features/history/queries";

export const metadata: Metadata = {
  title: "Historial",
};

export default async function HistoryPage() {
  const initialPage = await listCompletedWorkouts(null);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-7 sm:px-8 sm:py-10 lg:py-14">
      <header className="max-w-2xl">
        <p className="text-xs font-black uppercase text-[#858a82]">Progreso</p>
        <h1 className="mt-2 text-4xl font-black text-white sm:text-5xl">
          Historial
        </h1>
        <p className="mt-3 text-sm leading-6 text-[#a9ada6] sm:text-base">
          Tus entrenamientos finalizados, del más reciente al más antiguo.
        </p>
      </header>

      <div className="mt-10">
        <HistoryList initialPage={initialPage} />
      </div>
    </div>
  );
}
