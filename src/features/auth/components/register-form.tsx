"use client";

import Link from "next/link";
import { useActionState, useState, type FormEvent } from "react";
import { TextField } from "@/components/ui/form-field";
import { SubmitButton } from "@/components/ui/submit-button";
import { INITIAL_AUTH_ACTION_STATE, type AuthFieldName } from "../action-state";
import { registerAction } from "../actions";
import { MINIMUM_PASSWORD_LENGTH } from "../constants";
import { validateRegisterInput } from "../validation";

export function RegisterForm() {
  const [state, formAction] = useActionState(
    registerAction,
    INITIAL_AUTH_ACTION_STATE,
  );
  const [clientErrors, setClientErrors] = useState<Partial<
    Record<AuthFieldName, string>
  > | null>(null);
  const fieldErrors = clientErrors ?? state.fieldErrors;

  function validateBeforeSubmit(event: FormEvent<HTMLFormElement>) {
    const formData = new FormData(event.currentTarget);
    const result = validateRegisterInput({
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
      passwordConfirmation: String(formData.get("passwordConfirmation") ?? ""),
    });

    if (!result.ok) {
      event.preventDefault();
      setClientErrors(result.fieldErrors);
      return;
    }

    setClientErrors({});
  }

  if (state.status === "confirmation_required") {
    return (
      <div className="text-center" role="status">
        <div className="mx-auto grid size-12 place-items-center rounded-lg bg-[#252311] text-xl font-black text-[#f4cf3a]">
          @
        </div>
        <p className="mt-5 text-base font-bold text-white">{state.message}</p>
        <p className="mt-2 text-sm leading-6 text-[#a9ada6]">
          Después de confirmar, vas a completar tu perfil de entrenamiento.
        </p>
        <Link
          className="mt-6 inline-flex min-h-11 items-center font-bold text-[#f4cf3a] hover:text-[#ffdc4f]"
          href="/login"
        >
          Volver al inicio de sesión
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} noValidate onSubmit={validateBeforeSubmit}>
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
          id="register-email"
          inputMode="email"
          label="Correo electrónico"
          name="email"
          required
          type="email"
        />
        <TextField
          autoComplete="new-password"
          description={`Mínimo ${MINIMUM_PASSWORD_LENGTH} caracteres.`}
          error={fieldErrors?.password}
          id="register-password"
          label="Contraseña"
          maxLength={72}
          minLength={MINIMUM_PASSWORD_LENGTH}
          name="password"
          required
          type="password"
        />
        <TextField
          autoComplete="new-password"
          error={fieldErrors?.passwordConfirmation}
          id="register-password-confirmation"
          label="Confirmar contraseña"
          maxLength={72}
          minLength={MINIMUM_PASSWORD_LENGTH}
          name="passwordConfirmation"
          required
          type="password"
        />
      </div>

      <div className="mt-7">
        <SubmitButton
          idleLabel="Crear cuenta"
          pendingLabel="Creando cuenta..."
        />
      </div>
    </form>
  );
}
