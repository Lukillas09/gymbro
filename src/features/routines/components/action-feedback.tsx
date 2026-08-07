import type { RoutineActionState } from "../action-state";

export function ActionFeedback({
  state,
}: Readonly<{ state: RoutineActionState }>) {
  if (!state.message) return null;

  return (
    <p
      className={`rounded-md border px-3 py-2 text-sm leading-5 ${
        state.status === "error"
          ? "border-[#62342f] bg-[#261513] text-[#ffb4ad]"
          : "border-[#3c5a37] bg-[#172316] text-[#b8e6af]"
      }`}
      role={state.status === "error" ? "alert" : "status"}
    >
      {state.message}
    </p>
  );
}
