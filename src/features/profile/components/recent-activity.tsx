import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { formatHistoryDuration } from "@/features/history/domain";
import { formatProfileActivityDate } from "../domain";
import type { ProfileActivity } from "../types";

export function RecentActivity({
  activities,
}: Readonly<{ activities: readonly ProfileActivity[] }>) {
  return (
    <section
      aria-labelledby="recent-activity-title"
      className="border-t border-[#343731] pt-9 sm:pt-11"
    >
      <p className="text-xs font-black uppercase text-[#858a82]">Historia</p>
      <h2
        className="mt-2 text-2xl font-black text-white sm:text-3xl"
        id="recent-activity-title"
      >
        Actividad reciente
      </h2>

      {activities.length > 0 ? (
        <>
          <ol className="mt-6 border-b border-[#292c28]">
            {activities.map((activity) => {
              const dateLabel = formatProfileActivityDate(activity.completedAt);
              const setLabel =
                activity.completedSetCount === 1 ? "serie" : "series";

              return (
                <li key={activity.id}>
                  <Link
                    aria-label={`Ver ${activity.dayName} del ${dateLabel}`}
                    className="group grid min-h-24 grid-cols-[4.25rem_minmax(0,1fr)_1.5rem] items-center gap-3 border-t border-[#292c28] py-4 outline-none focus-visible:bg-[#171916] sm:grid-cols-[5.5rem_minmax(0,1fr)_1.5rem]"
                    href={`/history/${activity.id}`}
                  >
                    <time
                      className="text-xs font-black text-[#a9ada6] sm:text-sm"
                      dateTime={activity.completedAt}
                    >
                      {dateLabel}
                    </time>
                    <span className="min-w-0">
                      <span className="block truncate text-lg font-black text-white group-hover:text-[#f4cf3a]">
                        {activity.dayName}
                      </span>
                      <span className="mt-1 block text-sm text-[#a7aba4]">
                        {formatHistoryDuration(
                          activity.startedAt,
                          activity.completedAt,
                        )}{" "}
                        · {activity.completedSetCount} {setLabel}
                      </span>
                      {activity.primaryMuscleGroups.length > 0 ? (
                        <span className="mt-1 block truncate text-xs font-bold uppercase text-[#7f847c]">
                          {activity.primaryMuscleGroups.join(" · ")}
                        </span>
                      ) : null}
                    </span>
                    <Icon
                      className="size-5 text-[#71766e] group-hover:text-[#f4cf3a]"
                      name="arrow-right"
                    />
                  </Link>
                </li>
              );
            })}
          </ol>
          <Link
            className="mt-5 inline-flex min-h-11 items-center font-black text-white outline-none hover:text-[#f4cf3a] focus-visible:text-[#f4cf3a]"
            href="/history"
          >
            Ver todo el historial
          </Link>
        </>
      ) : (
        <p className="mt-5 max-w-lg text-sm leading-6 text-[#a9ada6]">
          Tus sesiones finalizadas van a construir esta parte de tu identidad.
        </p>
      )}
    </section>
  );
}
