import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ExerciseDetail } from "@/features/exercises/components/exercise-detail";
import { exerciseFixtures } from "../../../fixtures/exercises";

describe("ExerciseDetail", () => {
  it("muestra clasificación, equipamiento y músculos agrupados", () => {
    render(<ExerciseDetail exercise={exerciseFixtures[0]} />);

    expect(screen.getByText("Intermedio")).toBeInTheDocument();
    expect(screen.getByText("Empuje horizontal")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Pecho" })).toBeInTheDocument();
    expect(screen.getByText("Pectoral medio")).toBeInTheDocument();
    expect(screen.getByText("Principal")).toBeInTheDocument();
    expect(screen.getByText("Barra")).toBeInTheDocument();
    expect(screen.getByText("Banco")).toBeInTheDocument();
  });

  it("mantiene el orden de técnica y muestra errores comunes", () => {
    render(<ExerciseDetail exercise={exerciseFixtures[0]} />);

    const steps = screen
      .getAllByRole("listitem")
      .map(({ textContent }) => textContent);
    expect(steps).toContain("1Apoyá los pies y fijá las escápulas.");
    expect(steps).toContain("2Descendé la barra con control.");
    expect(screen.getByText("Levantar los glúteos.")).toBeInTheDocument();
  });
});
