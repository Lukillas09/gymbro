"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { INITIAL_AUTH_ACTION_STATE } from "../action-state";
import { logoutAction } from "../actions";

function LogoutSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      className="min-h-12 w-full rounded-lg border border-[#484b45] px-4 text-sm font-extrabold text-white hover:border-[#f4cf3a] hover:text-[#f4cf3a] disabled:cursor-wait disabled:text-[#8f948c] sm:w-auto sm:min-w-44"
      disabled={pending}
      type="submit"
    >
      {pending ? "Cerrando sesión..." : "Cerrar sesión"}
    </button>
  );
}

export function LogoutButton() {
  const [state, formAction] = useActionState(
    logoutAction,
    INITIAL_AUTH_ACTION_STATE,
  );

  return (
    <form action={formAction}>
      <LogoutSubmitButton />
      {state.message ? (
        <p className="mt-3 text-sm text-[#ffb4ad]" role="alert">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
