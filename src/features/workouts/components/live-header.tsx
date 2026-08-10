"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatCountdown } from "../domain";

type LiveHeaderProps = Readonly<{
  dayName: string;
  exerciseIndex: number;
  exerciseCount: number;
  startedAt: string;
  generatedAt: string;
  completedAt?: string | null;
  onOpenExercises?: () => void;
}>;

export function LiveHeader({
  dayName,
  exerciseIndex,
  exerciseCount,
  startedAt,
  generatedAt,
  completedAt = null,
  onOpenExercises,
}: LiveHeaderProps) {
  const [now, setNow] = useState(() => Date.parse(generatedAt));

  useEffect(() => {
    if (completedAt) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [completedAt]);

  const durationSeconds = Math.max(
    0,
    Math.floor(
      ((completedAt ? Date.parse(completedAt) : now) - Date.parse(startedAt)) /
        1000,
    ),
  );

  return (
    <header className="sticky top-0 z-30 border-b border-[#292c28] bg-[#0a0c0a]/95 pt-[env(safe-area-inset-top)] backdrop-blur-md">
      <div className="mx-auto grid min-h-16 w-full max-w-3xl grid-cols-[3rem_minmax(0,1fr)_4.5rem] items-center px-3">
        <Link
          aria-label="Salir del modo Entrenar"
          className="grid size-11 place-items-center rounded-md text-2xl text-[#c7cac4] hover:bg-[#1b1e1a] hover:text-white"
          href="/"
        >
          ×
        </Link>
        <button
          className="min-w-0 rounded-md px-2 py-2 text-center hover:bg-[#171917] disabled:cursor-default"
          disabled={!onOpenExercises}
          onClick={onOpenExercises}
          type="button"
        >
          <span className="block truncate text-sm font-black uppercase text-white">
            {dayName}
          </span>
          <span className="mt-0.5 block text-xs font-bold tabular-nums text-[#969b93]">
            {exerciseIndex + 1} / {exerciseCount}
          </span>
        </button>
        <span className="text-right text-sm font-extrabold tabular-nums text-[#f4cf3a]">
          {formatCountdown(durationSeconds)}
        </span>
      </div>
    </header>
  );
}
