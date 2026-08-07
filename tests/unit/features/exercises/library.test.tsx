import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { ExerciseLibrary } from "@/features/exercises/components/exercise-library";
import { exerciseFixtures } from "../../../fixtures/exercises";

describe("ExerciseLibrary", () => {
  it("renderiza cards con información esencial y links accesibles", () => {
    render(<ExerciseLibrary exercises={exerciseFixtures} />);

    expect(screen.getByText("3 ejercicios")).toBeInTheDocument();
    expect(screen.getByText("Press banca con barra")).toBeInTheDocument();
    expect(screen.getAllByText("Intermedio")).toHaveLength(2);
    expect(
      screen.getByRole("link", { name: "Ver Press banca con barra" }),
    ).toHaveAttribute("href", "/exercises/barbell-bench-press");
  });

  it("filtra por búsqueda, macrogrupo, músculo y equipamiento", async () => {
    const user = userEvent.setup();
    render(<ExerciseLibrary exercises={exerciseFixtures} />);

    await user.selectOptions(screen.getByLabelText("Macrogrupo"), "legs");
    await user.selectOptions(screen.getByLabelText("Músculo"), "glutes");
    await user.selectOptions(
      screen.getByLabelText("Equipamiento incluido"),
      "bench",
    );

    expect(screen.getByText("1 ejercicio")).toBeInTheDocument();
    expect(screen.getByText("Hip thrust con barra")).toBeInTheDocument();
    expect(screen.queryByText("Plancha frontal")).not.toBeInTheDocument();

    await user.type(
      screen.getByLabelText("Buscar por nombre"),
      "sin resultado",
    );
    expect(screen.getByText("No encontramos ejercicios")).toBeInTheDocument();
  });

  it("limpia todos los filtros", async () => {
    const user = userEvent.setup();
    render(<ExerciseLibrary exercises={exerciseFixtures} />);

    await user.type(screen.getByLabelText("Buscar por nombre"), "plancha");
    await user.click(screen.getByRole("button", { name: "Limpiar filtros" }));

    expect(screen.getByText("3 ejercicios")).toBeInTheDocument();
    expect(screen.getByLabelText("Buscar por nombre")).toHaveValue("");
  });

  it("deshabilita el músculo hasta elegir un macrogrupo", () => {
    render(<ExerciseLibrary exercises={exerciseFixtures} />);

    const muscleFilter = screen.getByLabelText("Músculo");
    expect(muscleFilter).toBeDisabled();
    expect(
      within(muscleFilter).getByText("Elegí un macrogrupo"),
    ).toBeInTheDocument();
  });
});
