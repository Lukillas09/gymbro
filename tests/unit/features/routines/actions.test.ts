import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  activateRoutineAction,
  updateRoutineDayWeekdayAction,
} from "@/features/routines/actions";

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
  from: vi.fn(),
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
    mocks.createClient.mockResolvedValue({ from: mocks.from, rpc: mocks.rpc });
    mocks.rpc.mockResolvedValue({ error: null });
  });

  it("revalida Home, calendario, rutinas y entrenamiento al activar", async () => {
    const routineId = "10000000-0000-4000-8000-000000000001";

    await activateRoutineAction(routineId, new FormData());

    expect(mocks.rpc).toHaveBeenCalledWith("activate_routine", {
      target_routine_id: routineId,
    });
    expect(mocks.revalidatePath.mock.calls).toEqual([
      ["/"],
      ["/calendar"],
      ["/routines"],
      ["/workout"],
      [`/routines/${routineId}`],
      [`/routines/${routineId}/edit`],
    ]);
  });

  it("guarda el weekday y revalida el calendario", async () => {
    const routineId = "10000000-0000-4000-8000-000000000001";
    const dayId = "20000000-0000-4000-8000-000000000002";
    const builder = {
      update: vi.fn(),
      eq: vi.fn(),
      select: vi.fn(),
      maybeSingle: vi
        .fn()
        .mockResolvedValue({ data: { id: dayId }, error: null }),
    };
    builder.update.mockReturnValue(builder);
    builder.eq.mockReturnValue(builder);
    builder.select.mockReturnValue(builder);
    mocks.from.mockReturnValue(builder);
    const formData = new FormData();
    formData.set("weekday", "1");

    const result = await updateRoutineDayWeekdayAction(
      routineId,
      dayId,
      "2026-08-10T12:00:00.000Z",
      { status: "idle" },
      formData,
    );

    expect(result).toEqual({
      status: "success",
      message: "Día fijo guardado.",
    });
    expect(builder.update).toHaveBeenCalledWith({ weekday: 1 });
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/calendar");
  });
});
