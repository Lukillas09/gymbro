import { beforeEach, describe, expect, it, vi } from "vitest";
import { finishWorkoutAction } from "@/features/workouts/actions";

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
  redirect: vi.fn(),
  requireCompletedProfile: vi.fn(),
  revalidatePath: vi.fn(),
  rpc: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: mocks.revalidatePath,
}));

vi.mock("next/navigation", () => ({
  redirect: mocks.redirect,
}));

vi.mock("@/features/auth/server", () => ({
  requireCompletedProfile: mocks.requireCompletedProfile,
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: mocks.createClient,
}));

describe("workout actions", () => {
  beforeEach(() => {
    mocks.createClient.mockResolvedValue({ rpc: mocks.rpc });
    mocks.rpc.mockResolvedValue({
      data: "2026-08-10T12:00:00.000Z",
      error: null,
    });
  });

  it("revalida Home, calendario, entrenamiento e historial al finalizar", async () => {
    const sessionId = "10000000-0000-4000-8000-000000000001";

    const result = await finishWorkoutAction(sessionId);

    expect(result).toEqual({
      ok: true,
      value: "2026-08-10T12:00:00.000Z",
    });
    expect(mocks.rpc).toHaveBeenCalledWith("finish_workout", {
      target_workout_session_id: sessionId,
    });
    expect(mocks.revalidatePath.mock.calls).toEqual([
      ["/"],
      ["/calendar"],
      ["/workout"],
      [`/workout/${sessionId}`],
      ["/history"],
      [`/history/${sessionId}`],
    ]);
  });
});
