import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { ActionFeedback } from "@/features/routines/components/action-feedback";
import { RoutineCard } from "@/features/routines/components/routine-card";
import { RoutineDetail } from "@/features/routines/components/routine-detail";
import { RoutineEditor } from "@/features/routines/components/routine-editor";
import { RoutineEmptyState } from "@/features/routines/components/routine-empty-state";
import { exerciseFixtures } from "../../../fixtures/exercises";
import { routineFixture } from "../../../fixtures/routines";

describe("componentes de rutinas", () => {
  it("muestra el empty state con ambas acciones reales", () => {
    render(<RoutineEmptyState />);

    expect(screen.getByText("Todavía no tenés rutinas")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Crear mi primera rutina" }),
    ).toHaveAttribute("href", "/routines/new");
    expect(
      screen.getByRole("link", { name: "Explorar ejercicios" }),
    ).toHaveAttribute("href", "/exercises");
  });

  it("muestra estado, objetivo y conteos en la card", () => {
    render(
      <RoutineCard
        routine={{
          id: routineFixture.id,
          name: routineFixture.name,
          goal: routineFixture.goal,
          isActive: true,
          archivedAt: null,
          updatedAt: routineFixture.updatedAt,
          dayCount: 2,
          exerciseCount: 2,
        }}
      />,
    );

    expect(screen.getByText("Torso Pierna")).toBeInTheDocument();
    expect(screen.getByText("Activa")).toBeInTheDocument();
    expect(screen.getByText("2 días · 2 ejercicios")).toBeInTheDocument();
  });

  it("renderiza días, prescripciones y resumen muscular", () => {
    render(<RoutineDetail routine={routineFixture} />);

    expect(screen.getByText("Plan completo")).toBeInTheDocument();
    expect(screen.getByText("4 × 8–10")).toBeInTheDocument();
    expect(screen.getByText("Descanso 2 min · RIR 2")).toBeInTheDocument();
    expect(screen.getByText("4 series primary")).toBeInTheDocument();
    expect(
      screen.getByText(/Estimación basada únicamente/),
    ).toBeInTheDocument();
  });

  it("muestra feedback de éxito y error sin depender del color", () => {
    const { rerender } = render(
      <ActionFeedback state={{ status: "error", message: "Falló" }} />,
    );
    expect(screen.getByRole("alert")).toHaveTextContent("Falló");

    rerender(
      <ActionFeedback state={{ status: "success", message: "Guardado" }} />,
    );
    expect(screen.getByRole("status")).toHaveTextContent("Guardado");
  });

  it("ofrece editor, botones de reorder y selector reutilizado", async () => {
    const user = userEvent.setup();
    render(
      <RoutineEditor catalog={exerciseFixtures} routine={routineFixture} />,
    );

    expect(screen.getAllByLabelText("Nombre del día")[0]).toHaveValue(
      "Torso A",
    );
    expect(
      screen.getByRole("button", { name: "Subir Torso A" }),
    ).toBeDisabled();
    expect(screen.getByRole("button", { name: "Bajar Torso A" })).toBeEnabled();
    expect(screen.getAllByText("Editar prescripción")).toHaveLength(2);

    const torsoSection = screen.getByRole("region", { name: "Editar Torso A" });
    await user.click(
      within(torsoSection).getByRole("button", { name: "Agregar ejercicio" }),
    );

    const dialog = screen.getByRole("dialog", { name: "Agregar ejercicio" });
    expect(dialog).toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText("Macrogrupo"), "legs");
    expect(
      within(dialog).getByText("Hip thrust con barra"),
    ).toBeInTheDocument();
    expect(
      within(dialog).queryByText("Plancha frontal"),
    ).not.toBeInTheDocument();
  });
});
