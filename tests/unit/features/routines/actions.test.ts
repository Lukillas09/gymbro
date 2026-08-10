import { beforeEach, describe, expect, it, vi } from "vitest";
import { activateRoutineAction } from "@/features/routines/actions";

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

describe("routine actions", () => {
  beforeEach(() => {
    mocks.createClient.mockResolvedValue({ rpc: mocks.rpc });
    mocks.rpc.mockResolvedValue({ error: null });
  });

  it("revalida Home, rutinas y entrenamiento al activar", async () => {
    const routineId = "10000000-0000-4000-8000-000000000001";

    await activateRoutineAction(routineId, new FormData());

    expect(mocks.rpc).toHaveBeenCalledWith("activate_routine", {
      target_routine_id: routineId,
    });
    expect(mocks.revalidatePath.mock.calls).toEqual([
      ["/"],
      ["/routines"],
      ["/workout"],
      [`/routines/${routineId}`],
      [`/routines/${routineId}/edit`],
    ]);
  });
});
