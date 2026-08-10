import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProfileIdentity } from "@/features/profile/components/profile-identity";
import {
  emptyProfileIdentityFixture,
  profileIdentityFixture,
} from "../../../fixtures/profile";

describe("Profile Identity", () => {
  it("presenta la identidad principal y separa la edición", () => {
    render(<ProfileIdentity model={profileIdentityFixture} />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Lucas Martínez" }),
    ).toBeVisible();
    expect(screen.getByText("@lucasmartinez.09")).toBeVisible();
    expect(screen.getByText("Intermedio · Hipertrofia")).toBeVisible();
    expect(screen.getByRole("img", { name: /Iniciales.*LM/ })).toBeVisible();
    expect(screen.getByRole("link", { name: "Editar perfil" })).toHaveAttribute(
      "href",
      "/profile/edit",
    );
    expect(screen.queryByText("Sexo biológico")).not.toBeInTheDocument();
  });

  it("muestra métricas, rutina, récord y actividad con fuentes reales", () => {
    render(<ProfileIdentity model={profileIdentityFixture} />);

    expect(screen.getByText("12")).toBeVisible();
    expect(screen.getByText("Push Pull Legs")).toBeVisible();
    expect(screen.getByText("PR de peso")).toBeVisible();
    expect(screen.getByText("80 kg × 9")).toBeVisible();
    expect(screen.getAllByText("Pecho · Tríceps")).toHaveLength(3);
    expect(screen.getAllByRole("link", { name: /Ver Push/ })).toHaveLength(2);
    expect(
      screen.getByRole("link", { name: "Ver todo el historial" }),
    ).toHaveAttribute("href", "/history");
  });

  it("mantiene un estado nuevo sin estadísticas en cero", () => {
    render(<ProfileIdentity model={emptyProfileIdentityFixture} />);

    expect(screen.queryByText("0", { exact: true })).not.toBeInTheDocument();
    expect(screen.getByText("Sin rutina activa")).toBeVisible();
    expect(screen.getByRole("link", { name: /Crear rutina/ })).toHaveAttribute(
      "href",
      "/routines/new",
    );
    expect(
      screen.getByText(/Tus sesiones finalizadas van a construir/),
    ).toBeVisible();
  });

  it("con una rutina sin historia ofrece entrenar sin inferir músculos", () => {
    render(
      <ProfileIdentity
        model={{
          ...emptyProfileIdentityFixture,
          activeRoutine: profileIdentityFixture.activeRoutine,
        }}
      />,
    );

    expect(
      screen.getByRole("link", { name: /Empezar a entrenar/ }),
    ).toHaveAttribute("href", "/workout");
    expect(
      screen.queryByText("Más presentes recientemente"),
    ).not.toBeInTheDocument();
  });
});
