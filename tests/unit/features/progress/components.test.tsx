import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ExerciseProgressDetail } from "@/features/progress/components/exercise-progress-detail";
import { ProgressExerciseList } from "@/features/progress/components/progress-exercise-list";
import { ProgressOverview } from "@/features/progress/components/progress-overview";
import { getProgressPeriod } from "@/features/progress/domain";
import type { ProgressExerciseItem } from "@/features/progress/types";
import {
  exerciseProgressDetailFixture,
  progressCatalogFixture,
  progressPersonalRecordFixture,
} from "../../../fixtures/progress";

const exerciseItems: readonly ProgressExerciseItem[] =
  progressCatalogFixture.map((item, index) => ({
    ...item,
    latest: null,
    previous: null,
    periodBest: index === 0 ? progressPersonalRecordFixture.set : null,
    improvement: index === 0 ? { kind: "repetitions", label: "+1 REP" } : null,
  }));

describe("componentes de progreso básico", () => {
  it("muestra un vacío honesto y ofrece entrenar", () => {
    render(
      <ProgressOverview
        overview={{
          currentSessionCount: 0,
          previousSessionCount: 0,
          frequencyDelta: 0,
          weeklySessionCounts: [0, 0, 0, 0],
          exercises: [],
          improvements: [],
        }}
        period={getProgressPeriod(new Date("2026-08-10T15:00:00.000Z"))}
      />,
    );

    expect(
      screen.getByRole("heading", {
        name: "Todavía no hay progreso para mostrar",
      }),
    ).toBeVisible();
    expect(screen.getByRole("link", { name: /Entrenar/ })).toHaveAttribute(
      "href",
      "/workout",
    );
  });

  it("filtra únicamente ejercicios realmente entrenados", () => {
    render(<ProgressExerciseList exercises={exerciseItems} />);

    expect(
      screen.getByRole("link", {
        name: "Ver progreso de Press banca con barra",
      }),
    ).toHaveAttribute(
      "href",
      `/progress/exercises/${exerciseItems[0].exerciseId}`,
    );
    fireEvent.change(screen.getByRole("searchbox"), {
      target: { value: "hip" },
    });
    expect(
      screen.queryByRole("link", {
        name: "Ver progreso de Press banca con barra",
      }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("link", {
        name: "Ver progreso de Hip thrust con barra",
      }),
    ).toBeVisible();
  });

  it("muestra evidencia, no una clasificación para datos ambiguos", () => {
    render(
      <ProgressOverview
        overview={{
          currentSessionCount: 2,
          previousSessionCount: 3,
          frequencyDelta: -1,
          weeklySessionCounts: [0, 1, 0, 1],
          exercises: exerciseItems.map((item) => ({
            ...item,
            improvement: null,
          })),
          improvements: [],
        }}
        period={getProgressPeriod(new Date("2026-08-10T15:00:00.000Z"))}
      />,
    );

    expect(screen.getByText("Ya hay datos para comparar")).toBeVisible();
    expect(screen.queryByText(/en descenso/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/volumen|1RM/i)).not.toBeInTheDocument();
  });

  it("presenta PR de peso y enlaza cada evidencia con Historial", () => {
    render(<ExerciseProgressDetail detail={exerciseProgressDetailFixture} />);

    expect(
      screen.getByRole("heading", { name: "Press banca con barra" }),
    ).toBeVisible();
    expect(screen.getAllByText("80 kg × 9")).toHaveLength(3);
    expect(screen.getByText("+1 REP")).toBeVisible();
    expect(
      screen.getAllByRole("link", { name: /Ver entrenamiento del/ }),
    ).toHaveLength(2);
    expect(screen.queryByText(/1RM|fuerza estimada/i)).not.toBeInTheDocument();
  });
});
