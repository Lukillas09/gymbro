import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { HistoryDetail } from "@/features/history/components/history-detail";
import { HistoryItem } from "@/features/history/components/history-item";
import { HistoryList } from "@/features/history/components/history-list";
import { HistoricalSetRow } from "@/features/history/components/historical-set-row";
import {
  completedWorkoutHistoryFixture,
  historyListItemFixture,
} from "../../../fixtures/history";

vi.mock("@/features/history/actions", () => ({
  loadMoreHistoryAction: vi.fn(),
}));

describe("componentes del historial", () => {
  it("muestra el estado vacío honesto y su CTA", () => {
    render(<HistoryList initialPage={{ items: [], nextCursor: null }} />);

    expect(
      screen.getByRole("heading", {
        name: "Todavía no completaste entrenamientos",
      }),
    ).toBeVisible();
    expect(screen.getByRole("link", { name: /Entrenar/ })).toHaveAttribute(
      "href",
      "/workout",
    );
  });

  it("resume una sesión y enlaza su detalle", () => {
    render(
      <ol>
        <HistoryItem item={historyListItemFixture} />
      </ol>,
    );

    const link = screen.getByRole("link", { name: /Ver Torso A/ });
    expect(link).toHaveAttribute(
      "href",
      `/history/${historyListItemFixture.id}`,
    );
    expect(within(link).getByText(/3 series/)).toBeVisible();
    expect(within(link).getByText("Pecho · Tríceps")).toBeVisible();
  });

  it("muestra sets reales, RIR y tipo de serie cuando aporta valor", () => {
    const set = completedWorkoutHistoryFixture.session.exercises[0].sets[0];
    render(
      <ol>
        <HistoricalSetRow set={set} />
      </ol>,
    );

    expect(screen.getByText("40 kg × 10")).toBeVisible();
    expect(screen.getByText("RIR 4")).toBeVisible();
    expect(screen.getByText("Entrada en calor")).toBeVisible();
  });

  it("renderiza el detalle sin fabricar la cuarta serie omitida", () => {
    render(<HistoryDetail history={completedWorkoutHistoryFixture} />);

    expect(screen.getByRole("heading", { name: "Torso A" })).toBeVisible();
    expect(screen.getByText("1 h 04 min")).toBeVisible();
    expect(screen.getByText("3 / 4 series realizadas")).toBeVisible();
    expect(screen.getByText("0 / 2 series realizadas")).toBeVisible();
    expect(screen.getAllByText(/^Serie [1-3]$/)).toHaveLength(3);
    expect(screen.queryByText("Serie 4")).not.toBeInTheDocument();
    expect(
      screen.getByText("↑ +1 REP respecto de la sesión anterior"),
    ).toBeVisible();
  });
});
