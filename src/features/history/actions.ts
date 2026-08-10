"use server";

import { parseHistoryCursor } from "./domain";
import { listCompletedWorkouts } from "./queries";
import type { LoadHistoryResult } from "./types";

export async function loadMoreHistoryAction(
  rawCursor: string,
): Promise<LoadHistoryResult> {
  const cursor = parseHistoryCursor(rawCursor);
  if (!cursor) {
    return { ok: false, message: "La página de historial no es válida." };
  }

  try {
    const page = await listCompletedWorkouts(cursor);
    return { ok: true, page };
  } catch {
    return {
      ok: false,
      message: "No pudimos cargar más entrenamientos. Intentá de nuevo.",
    };
  }
}
