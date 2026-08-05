import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { EmptyState } from "@/components/ui/empty-state";

describe("EmptyState", () => {
  it("muestra el título y la descripción", () => {
    render(
      <EmptyState
        description="Todavía no hay rutinas guardadas."
        icon="routines"
        title="Sin rutinas"
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Sin rutinas" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Todavía no hay rutinas guardadas."),
    ).toBeInTheDocument();
  });

  it("muestra una acción accesible cuando se proporciona", async () => {
    const user = userEvent.setup();

    render(
      <EmptyState
        action={{ href: "/routines", label: "Abrir Rutinas" }}
        description="Prepará tu primera rutina."
        icon="routines"
        title="Sin rutinas"
      />,
    );

    const action = screen.getByRole("link", { name: "Abrir Rutinas" });

    expect(action).toHaveAttribute("href", "/routines");
    await user.tab();
    expect(action).toHaveFocus();
  });

  it("no muestra una acción cuando no se proporciona", () => {
    render(
      <EmptyState
        description="Todavía no hay progreso registrado."
        icon="progress"
        title="Sin progreso"
      />,
    );

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});
