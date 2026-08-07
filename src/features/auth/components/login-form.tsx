"use client";

import { useActionState, useState, type FormEvent } from "react";
import { TextField } from "@/components/ui/form-field";
import { SubmitButton } from "@/components/ui/submit-button";
import { INITIAL_AUTH_ACTION_STATE, type AuthFieldName } from "../action-state";
import { loginAction } from "../actions";
import { validateLoginInput } from "../validation";

type LoginFormProps = Readonly<{
  next?: string;
  message?: string;
}>;

export function LoginForm({ next = "/", message }: LoginFormProps) {
  const [state, formAction] = useActionState(
    loginAction,
    INITIAL_AUTH_ACTION_STATE,
  );
  const [clientErrors, setClientErrors] = useState<Partial<
    Record<AuthFieldName, string>
  > | null>(null);
  const fieldErrors = clientErrors ?? state.fieldErrors;

  function validateBeforeSubmit(event: FormEvent<HTMLFormElement>) {
    const formData = new FormData(event.currentTarget);
    const result = validateLoginInput({
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
    });

    if (!result.ok) {
      event.preventDefault();
      setClientErrors(result.fieldErrors);
      return;
    }

    setClientErrors({});
  }

  return (
    <form action={formAction} noValidate onSubmit={validateBeforeSubmit}>
      <input name="next" type="hidden" value={next} />

      {message ? (
        <p
          className="mb-5 rounded-lg border border-[#4b4525] bg-[#211f13] px-4 py-3 text-sm leading-6 text-[#efe5aa]"
          role="status"
        >
          {message}
        </p>
      ) : null}

      {state.message ? (
        <p
          className="mb-5 rounded-lg border border-[#62342f] bg-[#261513] px-4 py-3 text-sm leading-6 text-[#ffb4ad]"
          role="alert"
        >
          {state.message}
        </p>
      ) : null}

      <div className="space-y-5">
        <TextField
          autoComplete="email"
          error={fieldErrors?.email}
          id="login-email"
          inputMode="email"
          label="Correo electrónico"
          name="email"
          required
          type="email"
        />
        <TextField
          autoComplete="current-password"
          error={fieldErrors?.password}
          id="login-password"
          label="Contraseña"
          name="password"
          required
          type="password"
        />
      </div>

      <div className="mt-7">
        <SubmitButton idleLabel="Iniciar sesión" pendingLabel="Ingresando..." />
      </div>
    </form>
  );
}
