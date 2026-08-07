import { describe, expect, it } from "vitest";
import {
  getAuthErrorDiagnostic,
  getRegistrationErrorState,
} from "@/features/auth/errors";

describe("errores de registro", () => {
  it("explica el límite temporal de correos sin revelar datos internos", () => {
    const state = getRegistrationErrorState({
      name: "AuthApiError",
      code: "over_email_send_rate_limit",
      status: 429,
      message: "email rate limit exceeded",
    });

    expect(state).toEqual({
      status: "error",
      message:
        "Se alcanzó temporalmente el límite de correos de confirmación. Esperá un rato e intentá de nuevo.",
    });
  });

  it("reduce el diagnóstico a campos técnicos seguros", () => {
    const diagnostic = getAuthErrorDiagnostic({
      name: "AuthApiError",
      code: "over_email_send_rate_limit",
      status: 429,
      message: "email rate limit exceeded",
      email: "private@example.com",
      password: "not-for-logs",
    });

    expect(diagnostic).toEqual({
      name: "AuthApiError",
      code: "over_email_send_rate_limit",
      status: 429,
      message: "email rate limit exceeded",
    });
  });
});
