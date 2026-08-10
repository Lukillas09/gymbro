import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ExerciseSwitcher } from "@/features/workouts/components/exercise-switcher";
import { LiveHeader } from "@/features/workouts/components/live-header";
import { RestTimer } from "@/features/workouts/components/rest-timer";
import { SetEntry } from "@/features/workouts/components/set-entry";
import { SetRows } from "@/features/workouts/components/set-rows";
import { TrainingMode } from "@/features/workouts/components/training-mode";
import { WorkoutSummary } from "@/features/workouts/components/workout-summary";
import {
  completeWorkoutSetAction,
  undoLastWorkoutSetAction,
} from "@/features/workouts/actions";
import {
  benchWorkoutExerciseId,
  previousPerformanceFixture,
  workoutSessionFixture,
} from "../../../fixtures/workouts";

vi.mock("@/features/workouts/actions", () => ({
  completeWorkoutSetAction: vi.fn(),
  extendWorkoutRestAction: vi.fn(),
  finishWorkoutAction: vi.fn(),
  selectWorkoutExerciseAction: vi.fn(),
  skipWorkoutRestAction: vi.fn(),
  undoLastWorkoutSetAction: vi.fn(),
}));

describe("componentes visibles de Training Mode", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renderiza cabecera LIVE con día, progreso, salida y duración", () => {
    render(
      <LiveHeader
        completedAt="2026-08-10T10:38:42.000Z"
        dayName="Torso A"
        exerciseCount={7}
        exerciseIndex={2}
        generatedAt="2026-08-10T10:38:42.000Z"
        startedAt="2026-08-10T10:00:00.000Z"
      />,
    );

    expect(screen.getByText("Torso A")).toBeVisible();
    expect(screen.getByText("3 / 7")).toBeVisible();
    expect(screen.getByText("38:42")).toBeVisible();
    expect(
      screen.getByRole("link", { name: "Salir del modo Entrenar" }),
    ).toHaveAttribute("href", "/");
  });

  it("hidrata la duración con el timestamp generado en servidor", () => {
    render(
      <LiveHeader
        dayName="Torso A"
        exerciseCount={2}
        exerciseIndex={0}
        generatedAt="2026-08-10T10:05:00.000Z"
        startedAt="2026-08-10T10:00:00.000Z"
      />,
    );

    expect(screen.getByText("05:00")).toBeVisible();
  });

  it("distingue series completadas, activa y pendientes", () => {
    const exercise = {
      ...workoutSessionFixture.exercises[0],
      sets: [
        {
          id: "77777777-7777-4777-8777-777777777777",
          setNumber: 1,
          weightKg: 80,
          repetitions: 8,
          rir: null,
          setType: "working" as const,
          completedAt: "2026-08-10T10:05:00.000Z",
        },
      ],
    };
    render(<SetRows exercise={exercise} />);

    const rows = screen.getAllByRole("listitem");
    expect(within(rows[0]).getByText("80 kg · 8")).toBeVisible();
    expect(within(rows[1]).getByText("Serie 2")).toBeVisible();
    expect(within(rows[2]).getByText("8–10 reps")).toBeVisible();
  });

  it("ofrece inputs numéricos y una sola acción dominante", async () => {
    const onComplete = vi.fn();
    const user = userEvent.setup();
    render(
      <SetEntry
        error={null}
        exerciseName="Press banca con barra"
        onComplete={onComplete}
        pending={false}
        prefill={{
          weightKg: 80,
          repetitions: 8,
          source: "previous-session",
        }}
        setNumber={1}
      />,
    );

    const reps = screen.getByLabelText("Repeticiones realizadas");
    await user.clear(reps);
    await user.type(reps, "9");
    await user.click(screen.getByRole("button", { name: /Completar serie/i }));

    expect(onComplete).toHaveBeenCalledWith("80", "9");
  });

  it("permite extender y saltar el descanso", async () => {
    const onExtend = vi.fn();
    const onSkip = vi.fn();
    const user = userEvent.setup();
    render(
      <RestTimer
        generatedAt="2099-01-01T00:00:00.000Z"
        nextLabel="Serie 2 · Press banca con barra"
        onEnded={vi.fn()}
        onExtend={onExtend}
        onSkip={onSkip}
        pending={false}
        restEndsAt="2099-01-01T00:01:29.000Z"
      />,
    );

    expect(screen.getByRole("heading", { name: "Descanso" })).toBeVisible();
    expect(screen.getByText(/Serie 2 · Press banca/)).toBeVisible();
    await user.click(screen.getByRole("button", { name: "+15 s" }));
    await user.click(screen.getByRole("button", { name: "Saltar" }));
    expect(onExtend).toHaveBeenCalledOnce();
    expect(onSkip).toHaveBeenCalledOnce();
  });

  it("muestra selector compacto con progreso y ejercicio activo", () => {
    render(
      <ExerciseSwitcher
        activeExerciseId={benchWorkoutExerciseId}
        dayName="Torso A"
        exercises={workoutSessionFixture.exercises}
        onClose={vi.fn()}
        onSelect={vi.fn()}
        pending={false}
      />,
    );

    const dialog = screen.getByRole("dialog", { name: "Ejercicios" });
    expect(within(dialog).getByText("Press banca con barra")).toBeVisible();
    expect(within(dialog).getByText("0/3")).toBeVisible();
    expect(
      within(dialog).getByRole("button", { name: /Press banca con barra/ }),
    ).toHaveAttribute("aria-current", "true");
  });

  it("completa una serie y expone undo inmediato", async () => {
    vi.mocked(completeWorkoutSetAction).mockResolvedValue({
      ok: true,
      value: {
        inserted: true,
        restEndsAt: null,
        activeWorkoutExerciseId: benchWorkoutExerciseId,
        set: {
          id: "77777777-7777-4777-8777-777777777777",
          setNumber: 1,
          weightKg: 80,
          repetitions: 9,
          rir: null,
          setType: "working",
          completedAt: "2026-08-10T10:05:00.000Z",
        },
      },
    });
    vi.mocked(undoLastWorkoutSetAction).mockResolvedValue({
      ok: true,
      value: {
        workoutExerciseId: benchWorkoutExerciseId,
        setNumber: 1,
        activeWorkoutExerciseId: benchWorkoutExerciseId,
        restEndsAt: null,
      },
    });
    const user = userEvent.setup();
    render(
      <TrainingMode
        generatedAt="2026-08-10T10:00:00.000Z"
        initialSession={workoutSessionFixture}
        previousByExercise={previousPerformanceFixture}
      />,
    );

    await user.click(screen.getByRole("button", { name: /Completar serie/i }));
    expect(await screen.findByText(/80 kg × 9/)).toBeVisible();
    expect(screen.getByText(/↑ \+1 REP/)).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Deshacer" }));
    expect(undoLastWorkoutSetAction).toHaveBeenCalledWith(
      workoutSessionFixture.id,
      "77777777-7777-4777-8777-777777777777",
    );
  });

  it("renderiza el resumen factual de una sesión", () => {
    const completed = {
      ...workoutSessionFixture,
      status: "completed" as const,
      completedAt: "2026-08-10T11:04:00.000Z",
      exercises: [
        {
          ...workoutSessionFixture.exercises[0],
          sets: [
            {
              id: "77777777-7777-4777-8777-777777777777",
              setNumber: 1,
              weightKg: 80,
              repetitions: 9,
              rir: null,
              setType: "working" as const,
              completedAt: "2026-08-10T10:05:00.000Z",
            },
          ],
        },
        workoutSessionFixture.exercises[1],
      ],
    };
    render(
      <WorkoutSummary
        previousByExercise={previousPerformanceFixture}
        session={completed}
      />,
    );

    expect(screen.getByRole("heading", { name: "Torso A" })).toBeVisible();
    expect(screen.getByText("1 h 04 min")).toBeVisible();
    expect(screen.getByText("Pecho · Piernas")).toBeVisible();
    expect(screen.getByText("↑ +1 REP")).toBeVisible();
    expect(
      screen.getByRole("link", { name: "Ver en historial" }),
    ).toHaveAttribute("href", `/history/${completed.id}`);
  });
});
