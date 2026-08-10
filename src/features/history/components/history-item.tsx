import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { formatHistoryDuration, formatHistoryListDate } from "../domain";
import type { HistoryListItem as HistoryListItemModel } from "../types";

export function HistoryItem({
  item,
}: Readonly<{ item: HistoryListItemModel }>) {
  const setLabel = item.completedSetCount === 1 ? "serie" : "series";

  return (
    <li>
      <Link
        aria-label={`Ver ${item.dayName} del ${formatHistoryListDate(item.completedAt)}`}
        className="group grid min-h-28 grid-cols-[4.5rem_minmax(0,1fr)_1.5rem] items-center gap-3 border-t border-[#292c28] py-5 outline-none focus-visible:bg-[#171916] sm:grid-cols-[5.5rem_minmax(0,1fr)_1.5rem]"
        href={`/history/${item.id}`}
      >
        <time
          className="text-sm font-black text-[#a9ada6]"
          dateTime={item.completedAt}
        >
          {formatHistoryListDate(item.completedAt)}
        </time>
        <span className="min-w-0">
          <span className="block truncate text-lg font-black text-white group-hover:text-[#f4cf3a]">
            {item.dayName}
          </span>
          <span className="mt-1 block text-sm text-[#a7aba4]">
            {formatHistoryDuration(item.startedAt, item.completedAt)} ·{" "}
            {item.completedSetCount} {setLabel}
          </span>
          {item.primaryMuscleGroups.length > 0 ? (
            <span className="mt-2 block truncate text-xs font-bold uppercase text-[#7f847c]">
              {item.primaryMuscleGroups.join(" · ")}
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
}
