import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AdaptiveHome } from "@/features/home/components/adaptive-home";
import {
  completedHomeModel,
  noRoutineHomeModel,
  readyHomeModel,
  restHomeModel,
  trainingHomeModel,
} from "../../../fixtures/home";

vi.mock("@/features/workouts/actions", () => ({
  startWorkoutAction: vi.fn(async () => ({ status: "idle" })),
}));

describe("AdaptiveHome", () => {
  it("muestra el CTA correcto cuando no existe rutina", () => {
    render(<AdaptiveHome model={noRoutineHomeModel} />);
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Tu entrenamiento empieza con una rutina.",
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Crear rutina/ })).toHaveAttribute(
      "href",
      "/routines/new",
    );
  });

  it("presenta el día real y una única acción dominante en READY", () => {
    render(<AdaptiveHome model={readyHomeModel} />);
    expect(
      screen.getByRole("heading", { level: 1, name: "Push" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Pecho · Tríceps")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Empezar entrenamiento" }),
    ).toBeInTheDocument();
  });

  it("ofrece continuar la sesión activa en TRAINING", () => {
    render(<AdaptiveHome model={trainingHomeModel} />);
    expect(screen.getByText("Entrenamiento activo")).toBeInTheDocument();
    expect(screen.getByText("Press banca con barra")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Continuar entrenamiento/ }),
    ).toHaveAttribute("href", `/workout/${trainingHomeModel.state.session.id}`);
  });

  it("muestra datos reales y progreso en COMPLETED", () => {
    render(<AdaptiveHome model={completedHomeModel} />);
    expect(screen.getByText("Entrenamiento completado")).toBeInTheDocument();
    expect(screen.getByText("2", { exact: true })).toBeInTheDocument();
    expect(
      screen.getByText("Press banca con barra · +1 REP"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Ver entrenamiento/ }),
    ).toHaveAttribute(
      "href",
      `/history/${completedHomeModel.state.session.id}`,
    );
  });

  it("muestra descanso y el siguiente entrenamiento determinista", () => {
    render(<AdaptiveHome model={restHomeModel} />);
    expect(
      screen.getByRole("heading", { level: 1, name: "Descanso" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Push · en 2 días")).toBeInTheDocument();
  });

  it("no muestra un Bro Cue cuando no existen datos útiles", () => {
    render(<AdaptiveHome model={noRoutineHomeModel} />);
    expect(screen.queryByText("La última vez")).not.toBeInTheDocument();
    expect(screen.queryByText("Progreso reciente")).not.toBeInTheDocument();
    expect(screen.queryByText("Tu semana")).not.toBeInTheDocument();
  });
});
