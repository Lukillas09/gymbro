"use client";

import { useEffect, useRef, useState } from "react";
import { formatCountdown, getRestSecondsRemaining } from "../domain";

type RestTimerProps = Readonly<{
  restEndsAt: string;
  nextLabel: string;
  pending: boolean;
  onExtend: () => void;
  onSkip: () => void;
  onEnded: () => void;
}>;

export function RestTimer({
  restEndsAt,
  nextLabel,
  pending,
  onExtend,
  onSkip,
  onEnded,
}: RestTimerProps) {
  const [remaining, setRemaining] = useState(() =>
    getRestSecondsRemaining(restEndsAt, Date.now()),
  );
  const notified = useRef(false);

  useEffect(() => {
    notified.current = false;
    const update = () =>
      setRemaining(getRestSecondsRemaining(restEndsAt, Date.now()));
    update();
    const timer = window.setInterval(update, 250);
    return () => window.clearInterval(timer);
  }, [restEndsAt]);

  useEffect(() => {
    if (remaining !== 0 || notified.current) return;
    notified.current = true;
    if ("vibrate" in navigator) navigator.vibrate([35, 45, 35]);
    onEnded();
  }, [onEnded, remaining]);

  return (
    <section aria-labelledby="rest-title" className="grid gap-5 text-center">
      <div>
        <p className="text-6xl font-black tabular-nums text-[#f4cf3a] sm:text-7xl">
          {formatCountdown(remaining)}
        </p>
        <h2
          className="mt-2 text-sm font-black uppercase text-white"
          id="rest-title"
        >
          Descanso
        </h2>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <button
          className="min-h-12 rounded-md border border-[#6f6220] px-4 text-sm font-extrabold text-[#f4cf3a] hover:bg-[#1f1d10] disabled:opacity-50"
          disabled={pending}
          onClick={onExtend}
          type="button"
        >
          +15 s
        </button>
        <button
          className="min-h-12 rounded-md border border-[#3a3e38] px-4 text-sm font-extrabold text-white hover:bg-[#1a1d19] disabled:opacity-50"
          disabled={pending}
          onClick={onSkip}
          type="button"
        >
          Saltar
        </button>
      </div>
      <p className="text-sm text-[#969b93]">
        Próxima: <span className="font-bold text-white">{nextLabel}</span>
      </p>
    </section>
  );
}
