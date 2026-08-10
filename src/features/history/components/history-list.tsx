"use client";

import { useState, useTransition } from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { loadMoreHistoryAction } from "../actions";
import { groupHistoryByMonth } from "../domain";
import type { HistoryPage } from "../types";
import { HistoryItem } from "./history-item";

export function HistoryList({
  initialPage,
}: Readonly<{ initialPage: HistoryPage }>) {
  const [items, setItems] = useState(initialPage.items);
  const [nextCursor, setNextCursor] = useState(initialPage.nextCursor);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (items.length === 0) {
    return (
      <EmptyState
        action={{ href: "/workout", label: "Entrenar" }}
        description="Tu historial va a crecer cada vez que finalices una sesión."
        icon="workout"
        title="Todavía no completaste entrenamientos"
      />
    );
  }

  function loadMore() {
    if (!nextCursor || isPending) return;
    setError(null);
    startTransition(async () => {
      const result = await loadMoreHistoryAction(nextCursor);
      if (!result.ok) {
        setError(result.message);
        return;
      }

      setItems((current) => {
        const knownIds = new Set(current.map(({ id }) => id));
        return [
          ...current,
          ...result.page.items.filter(({ id }) => !knownIds.has(id)),
        ];
      });
      setNextCursor(result.page.nextCursor);
    });
  }

  return (
    <div>
      <div className="space-y-10">
        {groupHistoryByMonth(items).map((group) => (
          <section
            aria-labelledby={`history-month-${group.key}`}
            key={group.key}
          >
            <h2
              className="mb-3 text-xs font-black uppercase text-[#858a82]"
              id={`history-month-${group.key}`}
            >
              {group.label}
            </h2>
            <ol className="border-b border-[#292c28]">
              {group.items.map((item) => (
                <HistoryItem item={item} key={item.id} />
              ))}
            </ol>
          </section>
        ))}
      </div>

      {error ? (
        <p aria-live="polite" className="mt-6 text-sm font-bold text-[#ff9b8f]">
          {error}
        </p>
      ) : null}

      {nextCursor ? (
        <button
          className="mt-8 min-h-12 w-full rounded-md border border-[#3a3d37] px-5 text-sm font-black text-white hover:border-[#f4cf3a] focus-visible:border-[#f4cf3a] disabled:cursor-wait disabled:opacity-60 sm:w-auto sm:min-w-44"
          disabled={isPending}
          onClick={loadMore}
          type="button"
        >
          {isPending ? "Cargando…" : "Cargar más"}
        </button>
      ) : null}
    </div>
  );
}
