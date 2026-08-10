"use client";

import { useEffect, useState } from "react";
import { formatLiveDuration, getSessionDurationSeconds } from "../domain";
import type { HomeWorkoutSession } from "../types";

type ElapsedDurationProps = Readonly<{
  generatedAt: string;
  session: HomeWorkoutSession;
}>;

export function ElapsedDuration({
  generatedAt,
  session,
}: ElapsedDurationProps) {
  const [now, setNow] = useState(() => Date.parse(generatedAt));

  useEffect(() => {
    const intervalId = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <time
      className="font-black tabular-nums text-[#f4cf3a]"
      dateTime={session.startedAt}
    >
      {formatLiveDuration(getSessionDurationSeconds(session, now))}
    </time>
  );
}
