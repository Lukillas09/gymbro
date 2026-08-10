import type { CalendarPageModel } from "../types";
import { CalendarDayDetail } from "./calendar-day-detail";
import { CalendarMonth } from "./calendar-month";

export function TrainingCalendar({
  model,
}: Readonly<{ model: CalendarPageModel }>) {
  return (
    <>
      {model.scheduleStatus === "partial" ? (
        <p className="mb-6 border-y border-[#343731] py-4 text-sm font-bold text-[#b8bcb5]">
          Tu rutina no tiene días fijos. El historial sigue visible, pero GymBro
          no va a inventar fechas futuras.
        </p>
      ) : null}

      <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.85fr)] lg:gap-12">
        <CalendarMonth month={model.month} />
        <div className="border-t border-[#343731] pt-7 lg:sticky lg:top-8 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8">
          <CalendarDayDetail model={model} />
        </div>
      </div>
    </>
  );
}
