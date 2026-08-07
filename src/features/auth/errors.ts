import type { AuthActionState } from "./action-state";

type AuthErrorLike = Readonly<{
  name?: unknown;
  code?: unknown;
  status?: unknown;
  message?: unknown;
}>;

const GENERIC_REGISTRATION_ERROR =
  "No pudimos crear la cuenta. Revisá los datos e intentá de nuevo.";

function asAuthErrorLike(error: unknown): AuthErrorLike {
  return typeof error === "object" && error !== null
    ? (error as AuthErrorLike)
    : {};
}

export function getAuthErrorDiagnostic(error: unknown) {
  const authError = asAuthErrorLike(error);

  return {
    name:
      typeof authError.name === "string" ? authError.name : "UnknownAuthError",
    code: typeof authError.code === "string" ? authError.code : null,
    status: typeof authError.status === "number" ? authError.status : null,
    message:
      typeof authError.message === "string"
        ? authError.message
        : "Unknown authentication error",
  };
}

export function reportAuthError(operation: string, error: unknown) {
  if (process.env.NODE_ENV !== "development") {
    return;
  }

  console.error(
    `[GymBro auth] ${operation} failed`,
    getAuthErrorDiagnostic(error),
  );
}

export function getRegistrationErrorState(error: unknown): AuthActionState {
  const diagnostic = getAuthErrorDiagnostic(error);

  if (diagnostic.code === "over_email_send_rate_limit") {
    return {
      status: "error",
      message:
        "Se alcanzó temporalmente el límite de correos de confirmación. Esperá un rato e intentá de nuevo.",
    };
  }

  return { status: "error", message: GENERIC_REGISTRATION_ERROR };
}
