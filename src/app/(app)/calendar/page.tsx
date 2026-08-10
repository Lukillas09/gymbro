import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/ui/page-shell";
import { TrainingCalendar } from "@/features/calendar/components/training-calendar";
import { getCalendarPageModel } from "@/features/calendar/queries";

export const metadata: Metadata = {
  title: "Calendario",
};

type CalendarPageProps = Readonly<{
  searchParams: Promise<{
    month?: string | string[];
    day?: string | string[];
  }>;
}>;

export default async function CalendarPage({
  searchParams,
}: CalendarPageProps) {
  const params = await searchParams;
  const model = await getCalendarPageModel(params.month, params.day);

  return (
    <PageShell
      description="Tu planificación y lo que realmente entrenaste, en una sola línea temporal."
      eyebrow="Progreso"
      title="Calendario"
    >
      <Link
        className="mb-7 inline-flex min-h-11 items-center text-sm font-bold text-[#a9ada6] outline-none hover:text-white focus-visible:text-[#f4cf3a]"
        href="/progress"
      >
        Volver a Progreso
      </Link>
      <TrainingCalendar model={model} />
    </PageShell>
  );
}
