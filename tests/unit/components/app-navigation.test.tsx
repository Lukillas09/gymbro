import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppNavigation } from "@/components/app-navigation";

const { mockUsePathname } = vi.hoisted(() => ({
  mockUsePathname: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: mockUsePathname,
}));

const sections = ["Inicio", "Rutinas", "Entrenar", "Progreso", "Perfil"];

describe("AppNavigation", () => {
  beforeEach(() => {
    mockUsePathname.mockReturnValue("/");
  });

  it("muestra las cinco secciones con nombres accesibles", () => {
    render(<AppNavigation />);

    const navigation = screen.getByRole("navigation", {
      name: "Navegación principal",
    });

    for (const section of sections) {
      expect(
        within(navigation).getByRole("link", { name: section }),
      ).toBeInTheDocument();
    }
  });

  it.each([
    ["/", "Inicio"],
    ["/routines", "Rutinas"],
    ["/workout", "Entrenar"],
    ["/progress", "Progreso"],
    ["/profile", "Perfil"],
  ])("marca %s como la ruta activa", (pathname, label) => {
    mockUsePathname.mockReturnValue(pathname);
    render(<AppNavigation />);

    expect(screen.getByRole("link", { name: label })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("mantiene activa una sección en rutas descendientes", () => {
    mockUsePathname.mockReturnValue("/routines/example");
    render(<AppNavigation />);

    expect(screen.getByRole("link", { name: "Rutinas" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Inicio" })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("representa Historial dentro de la sección Progreso", () => {
    mockUsePathname.mockReturnValue("/history/example");
    render(<AppNavigation />);

    expect(screen.getByRole("link", { name: "Progreso" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });
});
