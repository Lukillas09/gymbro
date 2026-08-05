import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PageShell } from "@/components/ui/page-shell";

describe("PageShell", () => {
  it("renderiza el encabezado y el contenido", () => {
    render(
      <PageShell
        description="Descripción visible de la sección."
        eyebrow="Planificación"
        title="Rutinas"
      >
        <button type="button">Contenido de prueba</button>
      </PageShell>,
    );

    expect(screen.getByText("Planificación")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 1, name: "Rutinas" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Descripción visible de la sección."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Contenido de prueba" }),
    ).toBeInTheDocument();
  });
});
