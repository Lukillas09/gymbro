import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  INITIAL_AUTH_ACTION_STATE,
  type AuthActionState,
} from "@/features/auth/action-state";
import { loginAction } from "@/features/auth/actions";
import { LoginForm } from "@/features/auth/components/login-form";
import { LogoutButton } from "@/features/auth/components/logout-button";
import { OnboardingForm } from "@/features/auth/components/onboarding-form";
import { RegisterForm } from "@/features/auth/components/register-form";
import type { Profile } from "@/features/auth/profile";

vi.mock("@/features/auth/actions", () => ({
  loginAction: vi.fn(async (state) => state),
  logoutAction: vi.fn(async (state) => state),
  onboardingAction: vi.fn(async (state) => state),
  registerAction: vi.fn(async (state) => state),
}));

const emptyProfile: Profile = {
  avatar_url: null,
  biological_sex: null,
  birth_date: null,
  created_at: "2026-08-06T00:00:00Z",
  current_weight_kg: null,
  display_name: null,
  height_cm: null,
  id: "11111111-1111-4111-8111-111111111111",
  preferred_weight_unit: "kg",
  primary_goal: null,
  training_level: null,
  updated_at: "2026-08-06T00:00:00Z",
  username: null,
};

beforeEach(() => {
  document.body.innerHTML = "";
});

describe("LoginForm", () => {
  it("expone campos accesibles y muestra errores visibles", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    expect(screen.getByLabelText("Correo electrónico")).toHaveAttribute(
      "autocomplete",
      "email",
    );
    expect(screen.getByLabelText("Contraseña")).toHaveAttribute(
      "autocomplete",
      "current-password",
    );

    await user.click(screen.getByRole("button", { name: "Iniciar sesión" }));

    expect(
      screen.getByText("Ingresá un correo electrónico válido."),
    ).toBeVisible();
    expect(screen.getByText("Ingresá tu contraseña.")).toBeVisible();
  });

  it("bloquea envíos duplicados mientras inicia sesión", async () => {
    const user = userEvent.setup();
    let finishAction: (state: AuthActionState) => void = () => undefined;

    vi.mocked(loginAction).mockReturnValueOnce(
      new Promise((resolve) => {
        finishAction = resolve;
      }),
    );

    render(<LoginForm />);
    await user.type(
      screen.getByLabelText("Correo electrónico"),
      "lucas@example.com",
    );
    await user.type(screen.getByLabelText("Contraseña"), "password-segura");
    await user.click(screen.getByRole("button", { name: "Iniciar sesión" }));

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Ingresando..." }),
      ).toBeDisabled();
    });

    await act(async () => {
      finishAction(INITIAL_AUTH_ACTION_STATE);
    });
  });
});

describe("LogoutButton", () => {
  it("expone una acción accesible para cerrar la sesión", () => {
    render(<LogoutButton />);

    expect(screen.getByRole("button", { name: "Cerrar sesión" })).toBeEnabled();
  });
});

describe("RegisterForm", () => {
  it("valida la confirmación de contraseña antes de enviar", async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);

    await user.type(
      screen.getByLabelText("Correo electrónico"),
      "lucas@example.com",
    );
    await user.type(screen.getByLabelText("Contraseña"), "password-segura");
    await user.type(
      screen.getByLabelText("Confirmar contraseña"),
      "password-distinta",
    );
    await user.click(screen.getByRole("button", { name: "Crear cuenta" }));

    expect(screen.getByText("Las contraseñas no coinciden.")).toBeVisible();
  });
});

describe("OnboardingForm", () => {
  it("muestra los campos requeridos y conserva kg como valor inicial", () => {
    render(
      <OnboardingForm maximumBirthDate="2026-08-06" profile={emptyProfile} />,
    );

    expect(screen.getByLabelText("Nombre de usuario")).toBeRequired();
    expect(screen.getByLabelText("Nombre visible")).toBeRequired();
    expect(screen.getByLabelText("Nivel de entrenamiento")).toBeRequired();
    expect(screen.getByLabelText("Objetivo principal")).toBeRequired();
    expect(screen.getByLabelText("Unidad preferida")).toHaveValue("kg");
  });

  it("comunica un username inválido de forma accesible", async () => {
    const user = userEvent.setup();
    render(
      <OnboardingForm maximumBirthDate="2026-08-06" profile={emptyProfile} />,
    );

    await user.type(screen.getByLabelText("Nombre de usuario"), "nombre malo");
    await user.click(
      screen.getByRole("button", { name: "Guardar y continuar" }),
    );

    expect(
      screen.getByText(/3 a 20 letras minúsculas, números, punto/i),
    ).toBeVisible();
  });
});
