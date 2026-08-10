import { expect, test } from "@playwright/test";

const privateRoutes = [
  "/",
  "/routines",
  "/workout",
  "/history",
  "/progress",
  "/profile",
  "/exercises",
] as const;

async function loginForExerciseLibrary(page: import("@playwright/test").Page) {
  await page.goto("/login?next=/exercises");
  await page.getByLabel("Correo electrónico").fill("e2e@gymbro.test");
  await page.getByLabel("Contraseña").fill("Gymbro123!");
  await page.getByRole("button", { name: "Iniciar sesión" }).click();
  await expect(page).toHaveURL("/exercises");
}

async function loginForRoute(
  page: import("@playwright/test").Page,
  route: string,
  email: string,
) {
  await page.goto(`/login?next=${encodeURIComponent(route)}`);
  await page.getByLabel("Correo electrónico").fill(email);
  await page.getByLabel("Contraseña").fill("Gymbro123!");
  await page.getByRole("button", { name: "Iniciar sesión" }).click();
  await expect(page).toHaveURL(route);
}

test.describe("protección para visitantes", () => {
  for (const route of privateRoutes) {
    test(`${route} redirige al inicio de sesión`, async ({ page }) => {
      await page.goto(route);

      await expect(page).toHaveURL(/\/login\?next=/);
      await expect(
        page.getByRole("heading", { level: 1, name: "Volvé a entrenar" }),
      ).toBeVisible();
    });
  }
});

test("login es accesible sin credenciales remotas", async ({ page }) => {
  await page.goto("/login");

  await expect(
    page.getByRole("heading", { level: 1, name: "Volvé a entrenar" }),
  ).toBeVisible();
  await expect(page.getByLabel("Correo electrónico")).toBeVisible();
  await expect(page.getByLabel("Contraseña")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Iniciar sesión" }),
  ).toBeVisible();
});

test("registro es accesible sin credenciales remotas", async ({ page }) => {
  await page.goto("/register");

  await expect(
    page.getByRole("heading", { level: 1, name: "Tu cuenta GymBro" }),
  ).toBeVisible();
  await expect(page.getByLabel("Correo electrónico")).toBeVisible();
  await expect(page.getByLabel("Contraseña", { exact: true })).toBeVisible();
  await expect(page.getByLabel("Confirmar contraseña")).toBeVisible();
});

test("las vistas públicas no desbordan en móvil", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });

  for (const route of ["/login", "/register"]) {
    await page.goto(route);

    const dimensions = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));

    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
  }
});

test("permite navegar entre login y registro", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("link", { name: "Crear cuenta" }).click();
  await expect(page).toHaveURL("/register");

  await page.getByRole("link", { name: "Iniciar sesión" }).click();
  await expect(page).toHaveURL("/login");
});

test("usuario autenticado navega las cinco secciones principales", async ({
  page,
}, testInfo) => {
  await loginForRoute(
    page,
    "/",
    `main-navigation-${testInfo.project.name}@gymbro.test`,
  );

  for (const [label, route] of [
    ["Rutinas", "/routines"],
    ["Entrenar", "/workout"],
    ["Progreso", "/progress"],
    ["Perfil", "/profile"],
    ["Inicio", "/"],
  ] as const) {
    await page.getByRole("link", { name: label }).click();
    await expect(page).toHaveURL(route);
    await expect(page.getByRole("link", { name: label })).toHaveAttribute(
      "aria-current",
      "page",
    );
  }
});

test("usuario autenticado abre una biblioteca responsive", async ({
  page,
}, testInfo) => {
  if (testInfo.project.name === "mobile-chromium") {
    await page.setViewportSize({ width: 390, height: 844 });
  }
  await loginForExerciseLibrary(page);

  await expect(
    page.getByRole("heading", { level: 1, name: "Biblioteca" }),
  ).toBeVisible();
  await expect(page.getByText("3 ejercicios")).toBeVisible();
  await expect(
    page.getByRole("navigation", { name: "Navegación principal" }),
  ).toBeVisible();

  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));

  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);

  await page.screenshot({
    fullPage: true,
    path: testInfo.outputPath("exercise-library.png"),
  });
});

test("biblioteca combina búsqueda y filtros sin red externa", async ({
  page,
}) => {
  await loginForExerciseLibrary(page);

  await page.getByLabel("Macrogrupo", { exact: true }).selectOption("legs");
  await page.getByLabel("Músculo", { exact: true }).selectOption("glutes");
  await page
    .getByLabel("Equipamiento incluido", { exact: true })
    .selectOption("bench");

  await expect(page.getByText("1 ejercicio")).toBeVisible();
  await expect(page.getByText("Hip thrust con barra")).toBeVisible();

  await page.getByLabel("Buscar por nombre").fill("sin resultado");
  await expect(page.getByText("No encontramos ejercicios")).toBeVisible();
});

test("abre el detalle de un ejercicio oficial", async ({ page }) => {
  await loginForExerciseLibrary(page);
  await page.getByRole("link", { name: "Ver Press banca con barra" }).click();

  await expect(page).toHaveURL("/exercises/barbell-bench-press");
  await expect(
    page.getByRole("heading", { level: 1, name: "Press banca con barra" }),
  ).toBeVisible();
  await expect(
    page.getByText("Empuje horizontal", { exact: true }),
  ).toBeVisible();
  await expect(page.getByText("Pectoral medio")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Técnica paso a paso" }),
  ).toBeVisible();
});

test("rutinas muestra un estado vacío honesto", async ({ page }, testInfo) => {
  await loginForRoute(
    page,
    "/routines",
    `routine-empty-${testInfo.project.name}@gymbro.test`,
  );

  await expect(
    page.getByRole("heading", { level: 1, name: "Rutinas" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Todavía no tenés rutinas" }),
  ).toBeVisible();
  const createRoutine = page.getByRole("link", {
    name: "Crear mi primera rutina",
  });
  await expect(createRoutine).toBeVisible();
  await expect(createRoutine).toHaveAttribute("href", "/routines/new");
  await expect(
    page.getByRole("link", { name: "Explorar ejercicios" }),
  ).toBeVisible();

  const routinesNavigation = page.getByRole("link", { name: "Rutinas" });
  const workoutNavigation = page.getByRole("link", { name: "Entrenar" });
  await expect(routinesNavigation).toHaveAttribute("aria-current", "page");
  await expect(routinesNavigation).toHaveAttribute(
    "data-navigation-state",
    "active",
  );
  await expect(workoutNavigation).not.toHaveAttribute("aria-current");
  await expect(workoutNavigation).toHaveAttribute(
    "data-navigation-state",
    "inactive",
  );

  await page.screenshot({
    fullPage: true,
    path: testInfo.outputPath("routine-empty-navigation.png"),
  });

  await createRoutine.click();
  await expect(page).toHaveURL("/routines/new");
  await expect(
    page.getByRole("heading", { level: 1, name: "Crear rutina" }),
  ).toBeVisible();
});

test("crea y visualiza una rutina mobile-first", async ({ page }, testInfo) => {
  if (testInfo.project.name === "mobile-chromium") {
    await page.setViewportSize({ width: 390, height: 844 });
  }

  await loginForRoute(
    page,
    "/routines",
    `routine-builder-${testInfo.project.name}@gymbro.test`,
  );
  await page.getByRole("link", { name: "Crear mi primera rutina" }).click();
  await expect(page).toHaveURL("/routines/new");

  await page.getByLabel("Nombre de la rutina").fill("Torso Pierna");
  await page.getByLabel("Objetivo").selectOption("muscle_gain");
  await page.getByRole("button", { name: "Crear rutina" }).click();
  await expect(page).toHaveURL(/\/routines\/[0-9a-f-]+\/edit$/);

  await page.getByLabel("Nuevo día").fill("Pierna A");
  await page.getByRole("button", { name: "Agregar día" }).click();
  await expect(page.getByLabel("Nombre del día")).toHaveValue("Pierna A");

  await page.getByRole("button", { name: "Agregar ejercicio" }).click();
  const dialog = page.getByRole("dialog", { name: "Agregar ejercicio" });
  await dialog.getByLabel("Macrogrupo").selectOption("legs");
  await dialog.getByLabel("Músculo").selectOption("glutes");
  const hipThrust = dialog
    .getByRole("listitem")
    .filter({ hasText: "Hip thrust con barra" });
  await hipThrust.getByRole("button", { name: "Agregar" }).click();

  await expect(
    page.getByRole("dialog", { name: "Configurar ejercicio" }),
  ).toBeVisible();
  await page.getByLabel("Series").fill("4");
  await page.getByLabel("Reps mín.").fill("8");
  await page.getByLabel("Reps máx.").fill("10");
  await page.getByRole("button", { name: "120s" }).click();
  await page.getByLabel("RIR").fill("2");
  await page
    .getByRole("button", { name: "Agregar Hip thrust con barra" })
    .click();

  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(
    page.getByRole("link", { name: "Hip thrust con barra" }),
  ).toBeVisible();
  await expect(
    page.getByText("4 × 8–10 · Descanso 2 min · RIR 2"),
  ).toBeVisible();

  await page.getByRole("link", { name: "Ver rutina" }).click();
  await expect(page).toHaveURL(/\/routines\/[0-9a-f-]+$/);
  await expect(
    page.getByRole("heading", { level: 1, name: "Torso Pierna" }),
  ).toBeVisible();
  await expect(page.getByText("4 series primary")).toBeVisible();

  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);

  await page.screenshot({
    fullPage: true,
    path: testInfo.outputPath("routine-detail.png"),
  });
});

test("entrena, recupera la sesión y finaliza sin perder estado", async ({
  page,
}, testInfo) => {
  const runtimeErrors: string[] = [];
  page.on("pageerror", (error) => runtimeErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") runtimeErrors.push(message.text());
  });
  page.on("response", (response) => {
    if (response.status() >= 500) {
      runtimeErrors.push(`${response.status()} ${response.url()}`);
    }
  });

  if (testInfo.project.name === "mobile-chromium") {
    await page.setViewportSize({ width: 390, height: 844 });
  }

  await loginForRoute(
    page,
    "/routines",
    `training-mode-${testInfo.project.name}@gymbro.test`,
  );
  await page.getByRole("link", { name: "Crear mi primera rutina" }).click();
  await page.getByLabel("Nombre de la rutina").fill("Push real");
  await page.getByRole("button", { name: "Crear rutina" }).click();
  await page.getByLabel("Nuevo día").fill("Push A");
  await page.getByRole("button", { name: "Agregar día" }).click();

  await page.getByRole("button", { name: "Agregar ejercicio" }).click();
  await page
    .getByRole("listitem")
    .filter({ hasText: "Press banca con barra" })
    .getByRole("button", { name: "Agregar" })
    .click();
  await page
    .getByRole("button", { name: "Agregar Press banca con barra" })
    .click();

  await page.getByRole("button", { name: "Agregar ejercicio" }).click();
  await page
    .getByRole("listitem")
    .filter({ hasText: "Hip thrust con barra" })
    .getByRole("button", { name: "Agregar" })
    .click();
  await page
    .getByRole("button", { name: "Agregar Hip thrust con barra" })
    .click();

  await page.getByRole("link", { name: "Ver rutina" }).click();
  await page.getByRole("button", { name: "Activar" }).click();
  await page.getByRole("link", { name: "Entrenar" }).click();
  await expect(page).toHaveURL("/workout");

  await expect(
    page.getByRole("heading", { name: "¿Qué entrenás hoy?" }),
  ).toBeVisible();
  await expect(page.getByText("Push A")).toBeVisible();
  await page.getByRole("button", { name: "Empezar entrenamiento" }).click();
  await expect(page).toHaveURL(/\/workout\/[0-9a-f-]+$/);

  await expect(
    page.getByRole("heading", { name: "Press banca con barra" }),
  ).toBeVisible();
  await page.getByLabel("Peso en kilogramos").fill("80");
  await page.getByRole("button", { name: /Completar serie/i }).click();
  await expect(page.getByRole("heading", { name: "Descanso" })).toBeVisible();
  await expect(page.getByText(/✓ 80 kg × 8/)).toBeVisible();

  await page.getByRole("button", { name: "+15 s" }).click();
  await expect(page.getByRole("heading", { name: "Descanso" })).toBeVisible();
  await page.getByRole("button", { name: "Saltar" }).click();
  await expect(page.getByLabel("Peso en kilogramos")).toHaveValue("80");

  await page.getByRole("button", { name: "Cambiar" }).click();
  const exerciseDialog = page.getByRole("dialog", { name: "Ejercicios" });
  await exerciseDialog
    .getByRole("button", { name: /Hip thrust con barra/ })
    .click();
  await expect(
    page.getByRole("heading", { name: "Hip thrust con barra" }),
  ).toBeVisible();

  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Hip thrust con barra" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Cambiar" }).click();
  const recoveredProgress = page.getByRole("dialog", { name: "Ejercicios" });
  await expect(recoveredProgress.getByText("1/3")).toBeVisible();
  await expect(
    recoveredProgress.getByRole("button", { name: /Hip thrust con barra/ }),
  ).toHaveAttribute("aria-current", "true");
  await recoveredProgress
    .getByRole("button", { name: "Cerrar lista de ejercicios" })
    .click();

  await page.screenshot({
    fullPage: true,
    path: testInfo.outputPath("training-live.png"),
  });

  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Finalizar entrenamiento" }).click();
  await expect(page.getByText("Entrenamiento completado")).toBeVisible();
  await expect(page.getByText("1", { exact: true })).toBeVisible();
  await page.screenshot({
    fullPage: true,
    path: testInfo.outputPath("training-summary.png"),
  });

  await page.getByRole("link", { name: "Volver al inicio" }).click();
  await expect(page).toHaveURL("/");
  await expect(page.getByText("Entrenamiento completado")).toBeVisible();

  await page.getByRole("link", { name: /Ver entrenamiento/ }).click();
  await expect(page).toHaveURL(/\/history\/[0-9a-f-]+$/);
  await expect(
    page.getByRole("heading", { level: 1, name: "Push A" }),
  ).toBeVisible();
  await expect(page.getByText("80 kg × 8")).toBeVisible();

  await page.getByRole("link", { name: "Volver al historial" }).click();
  await expect(page).toHaveURL("/history");
  const completedWorkout = page.getByRole("link", {
    name: /^Ver Push A del/,
  });
  await expect(completedWorkout).toHaveCount(1);
  await completedWorkout.click();
  await expect(page).toHaveURL(/\/history\/[0-9a-f-]+$/);
  await expect(
    page.getByRole("heading", { level: 1, name: "Push A" }),
  ).toBeVisible();

  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);

  if (testInfo.project.name === "mobile-chromium") {
    await page.setViewportSize({ width: 320, height: 700 });
    const narrowDimensions = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));
    expect(narrowDimensions.scrollWidth).toBeLessThanOrEqual(
      narrowDimensions.clientWidth,
    );
  }

  await page.screenshot({
    fullPage: true,
    path: testInfo.outputPath("golden-path-history-detail.png"),
  });

  expect(runtimeErrors).toEqual([]);
});
