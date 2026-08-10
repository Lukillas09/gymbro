import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { formatDuration } from "@/features/workouts/domain";
import {
  formatNextRoutineDay,
  getCurrentExerciseProgress,
  getSessionDurationSeconds,
  getSessionSetCount,
} from "../domain";
import type { HomeBroCue, HomePageModel, HomeState } from "../types";
import { ElapsedDuration } from "./elapsed-duration";
import { ReadyHomeHero } from "./ready-home-hero";

const primaryLinkClass =
  "inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-md bg-[#f4cf3a] px-5 text-sm font-black text-[#11120f] transition-colors hover:bg-[#ffdc4f] sm:w-fit sm:min-w-64";

function NoRoutineHero({
  state,
}: Readonly<{ state: Extract<HomeState, { kind: "no-routine" }> }>) {
  const emptyRoutine = state.reason === "empty" && state.routineId;
  return (
    <section aria-labelledby="home-title" className="pb-10 sm:pb-14">
      <p className="text-xs font-black uppercase text-[#858a82]">Inicio</p>
      <h1
        className="mt-4 max-w-3xl text-4xl leading-[1.05] font-black text-white sm:text-6xl"
        id="home-title"
      >
        {emptyRoutine
          ? "Tu rutina necesita un día para entrenar."
          : "Tu entrenamiento empieza con una rutina."}
      </h1>
      <p className="mt-5 max-w-xl text-base leading-7 text-[#a7aba4]">
        {emptyRoutine
          ? "Agregá ejercicios a un día y volvé cuando el plan esté listo."
          : "Prepará los días y ejercicios que querés tener a mano."}
      </p>
      <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
        <Link
          className={primaryLinkClass}
          href={
            emptyRoutine ? `/routines/${state.routineId}/edit` : "/routines/new"
          }
        >
          {emptyRoutine ? "Completar rutina" : "Crear rutina"}
          <Icon className="size-5" name="arrow-right" />
        </Link>
        <Link
          className="inline-flex min-h-12 items-center px-2 text-sm font-extrabold text-[#c6cac3] hover:text-white"
          href="/exercises"
        >
          Explorar ejercicios
        </Link>
      </div>
    </section>
  );
}

function TrainingHero({
  generatedAt,
  state,
}: Readonly<{
  generatedAt: string;
  state: Extract<HomeState, { kind: "training" }>;
}>) {
  const progress = getCurrentExerciseProgress(state.session);
  const completedExercises = state.session.exercises.filter(
    (exercise) => exercise.sets.length >= exercise.targetSets,
  ).length;

  return (
    <section
      aria-labelledby="home-title"
      className="relative overflow-hidden border-y border-[#4a421b] bg-[#18170f] px-5 py-9 sm:px-8 sm:py-12"
    >
      <div
        aria-hidden="true"
        className="absolute inset-y-0 left-0 w-1.5 bg-[#f4cf3a]"
      />
      <div className="flex items-center justify-between gap-4">
        <p className="text-xs font-black uppercase text-[#f4cf3a]">
          Entrenamiento activo
        </p>
        <ElapsedDuration generatedAt={generatedAt} session={state.session} />
      </div>
      <h1
        className="mt-4 text-4xl leading-none font-black uppercase text-white sm:text-6xl"
        id="home-title"
      >
        {state.session.dayName}
      </h1>
      <p className="mt-3 text-sm font-bold text-[#9fa39c]">
        {completedExercises} / {state.session.exercises.length} ejercicios
      </p>

      {progress ? (
        <div className="mt-8 border-l border-[#6d6226] pl-4">
          <p className="text-xs font-bold uppercase text-[#8f948c]">Ahora</p>
          <p className="mt-2 text-xl font-black text-white">
            {progress.exercise.exerciseName}
          </p>
          <p className="mt-1 text-sm font-bold text-[#b6bab3]">
            Serie {progress.currentSet} de {progress.exercise.targetSets}
          </p>
        </div>
      ) : null}

      <Link
        className={`${primaryLinkClass} mt-9`}
        href={`/workout/${state.session.id}`}
      >
        Continuar entrenamiento
        <Icon className="size-5" name="arrow-right" />
      </Link>
    </section>
  );
}

function CompletedHero({
  generatedAt,
  state,
}: Readonly<{
  generatedAt: string;
  state: Extract<HomeState, { kind: "completed" }>;
}>) {
  const duration = getSessionDurationSeconds(
    state.session,
    Date.parse(generatedAt),
  );
  const setCount = getSessionSetCount(state.session);

  return (
    <section aria-labelledby="home-title" className="pb-10 sm:pb-14">
      <p className="text-xs font-black uppercase text-[#f4cf3a]">
        Entrenamiento completado
      </p>
      <h1
        className="mt-4 text-4xl leading-none font-black uppercase text-white sm:text-6xl"
        id="home-title"
      >
        {state.session.dayName}
      </h1>
      <div className="mt-7 flex flex-wrap gap-x-8 gap-y-3 border-y border-[#292c28] py-5">
        <p className="text-2xl font-black tabular-nums text-white">
          {formatDuration(duration)}
          <span className="mt-1 block text-xs font-bold uppercase text-[#858a82]">
            Duración
          </span>
        </p>
        <p className="text-2xl font-black tabular-nums text-white">
          {setCount}
          <span className="mt-1 block text-xs font-bold uppercase text-[#858a82]">
            Series
          </span>
        </p>
      </div>
      <Link
        className={`${primaryLinkClass} mt-8`}
        href={`/history/${state.session.id}`}
      >
        Ver entrenamiento
        <Icon className="size-5" name="arrow-right" />
      </Link>

      <div className="mt-10 border-t border-[#292c28] pt-5">
        <p className="text-xs font-bold uppercase text-[#858a82]">Próximo</p>
        <p className="mt-2 text-lg font-black text-white">
          {state.nextRoutineDay
            ? formatNextRoutineDay(state.nextRoutineDay)
            : "Elegí tu próximo entrenamiento"}
        </p>
      </div>
    </section>
  );
}

function RestHero({
  state,
}: Readonly<{ state: Extract<HomeState, { kind: "rest" }> }>) {
  return (
    <section aria-labelledby="home-title" className="pb-10 sm:pb-14">
      <p className="text-xs font-black uppercase text-[#858a82]">Hoy</p>
      <h1
        className="mt-4 text-5xl leading-none font-black uppercase text-white sm:text-7xl"
        id="home-title"
      >
        Descanso
      </h1>
      <div className="mt-9 border-y border-[#292c28] py-5">
        <p className="text-xs font-bold uppercase text-[#858a82]">
          Próximo entrenamiento
        </p>
        <p className="mt-2 text-xl font-black text-white">
          {formatNextRoutineDay(state.nextRoutineDay)}
        </p>
        <p className="mt-1 text-sm text-[#989d95]">{state.routine.name}</p>
      </div>
      <Link
        className="mt-6 inline-flex min-h-12 items-center gap-2 text-sm font-extrabold text-[#c7cbc4] hover:text-white"
        href="/workout"
      >
        Elegir otro entrenamiento
        <Icon className="size-5" name="arrow-right" />
      </Link>
    </section>
  );
}

function BroCue({ cue }: Readonly<{ cue: HomeBroCue }>) {
  return (
    <aside
      aria-labelledby="bro-cue-title"
      className="border-y border-[#30332e] py-6"
    >
      <p
        className="text-xs font-black uppercase text-[#858a82]"
        id="bro-cue-title"
      >
        {cue.eyebrow}
      </p>
      <p className="mt-3 max-w-2xl text-lg font-extrabold text-white">
        {cue.text}
      </p>
    </aside>
  );
}

export function AdaptiveHome({ model }: Readonly<{ model: HomePageModel }>) {
  const { state } = model;
  const showSeparateWeek =
    model.weeklySummary.completedCount > 0 &&
    model.broCue?.kind !== "weekly" &&
    state.kind !== "training" &&
    state.kind !== "no-routine";

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-8 sm:py-10">
      <header className="mb-10 flex items-center justify-between gap-4 sm:mb-14">
        <p className="text-sm font-black text-white">Hola, {model.firstName}</p>
        <p className="text-xs font-bold uppercase text-[#858a82]">
          {model.dateLabel}
        </p>
      </header>

      {state.kind === "no-routine" ? <NoRoutineHero state={state} /> : null}
      {state.kind === "ready" ? <ReadyHomeHero state={state} /> : null}
      {state.kind === "training" ? (
        <TrainingHero generatedAt={model.generatedAt} state={state} />
      ) : null}
      {state.kind === "completed" ? (
        <CompletedHero generatedAt={model.generatedAt} state={state} />
      ) : null}
      {state.kind === "rest" ? <RestHero state={state} /> : null}

      {model.broCue ? (
        <div className="mt-8">
          <BroCue cue={model.broCue} />
        </div>
      ) : null}

      {showSeparateWeek ? (
        <section className="mt-8" aria-labelledby="weekly-summary-title">
          <h2
            className="text-xs font-bold uppercase text-[#858a82]"
            id="weekly-summary-title"
          >
            Tu semana
          </h2>
          <p className="mt-2 text-2xl font-black tabular-nums text-white">
            {model.weeklySummary.completedCount}
            <span className="ml-2 text-sm font-bold text-[#989d95]">
              {model.weeklySummary.completedCount === 1
                ? "entrenamiento"
                : "entrenamientos"}
            </span>
          </p>
        </section>
      ) : null}
    </div>
  );
}
