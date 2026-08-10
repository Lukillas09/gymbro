import { expect, test } from "@playwright/test";

async function loginForCalendar(
  page: import("@playwright/test").Page,
  scenario: string,
  projectName: string,
) {
  await page.goto("/login?next=/calendar");
  await page
    .getByLabel("Correo electrónico")
    .fill(`${scenario}-${projectName}@gymbro.test`);
  await page.getByLabel("Contraseña").fill("Gymbro123!");
  await page.getByRole("button", { name: "Iniciar sesión" }).click();
  await expect(page).toHaveURL("/calendar");
}

async function expectNoHorizontalOverflow(
  page: import("@playwright/test").Page,
) {
  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
}

test.beforeEach(async ({ page }, testInfo) => {
  if (testInfo.project.name === "mobile-chromium") {
    await page.setViewportSize({ width: 390, height: 844 });
  }
});

test("calendario vacío mantiene una salida útil y diseño responsive", async ({
  page,
}, testInfo) => {
  await loginForCalendar(page, "calendar-empty", testInfo.project.name);

  await expect(page.getByRole("heading", { name: "Calendario" })).toBeVisible();
  await expect(page.getByText("No hay entrenamientos todavía")).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Crear rutina" }),
  ).toHaveAttribute("href", "/routines/new");
  await expect(
    page.getByRole("navigation", { name: "Navegación principal" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Progreso", exact: true }),
  ).toHaveAttribute("aria-current", "page");
  await expectNoHorizontalOverflow(page);
  await page.screenshot({
    fullPage: true,
    path: testInfo.outputPath("training-calendar-empty.png"),
  });

  if (testInfo.project.name === "mobile-chromium") {
    await page.setViewportSize({ width: 320, height: 700 });
    await expectNoHorizontalOverflow(page);
    await page.screenshot({
      fullPage: true,
      path: testInfo.outputPath("training-calendar-empty-320.png"),
    });
  }
});

test("history sin rutina sigue visible y conserva el regreso", async ({
  page,
}, testInfo) => {
  await loginForCalendar(page, "calendar-history", testInfo.project.name);

  const completedDay = page.getByRole("link", {
    name: /entrenamiento completado/,
  });
  await expect(completedDay).toHaveCount(1);
  await completedDay.click();
  const historyLink = page.getByRole("link", { name: "Ver entrenamiento" });
  await expect(historyLink).toBeVisible();
  await historyLink.click();
  await expect(page).toHaveURL(/\/history\/[0-9a-f-]+$/);
  await expect(
    page.getByRole("heading", { level: 1, name: "Push" }),
  ).toBeVisible();

  await page.goBack();
  await expect(page).toHaveURL(
    /\/calendar\?month=\d{4}-\d{2}&day=\d{4}-\d{2}-\d{2}$/,
  );
  await expect(
    page.getByRole("link", { name: "Ver entrenamiento" }),
  ).toBeVisible();
});

test("rutina programada inicia Training Mode con el flujo existente", async ({
  page,
}, testInfo) => {
  await loginForCalendar(page, "calendar-scheduled", testInfo.project.name);

  await expect(
    page.getByText("Programado", { exact: true }).last(),
  ).toBeVisible();
  await expect(page.getByText("Pecho", { exact: false }).last()).toBeVisible();
  await page.getByRole("button", { name: "Empezar entrenamiento" }).click();
  await expect(page).toHaveURL(/\/workout\/[0-9a-f-]+$/);
  await expect(
    page.getByRole("heading", { name: "Press banca con barra" }),
  ).toBeVisible();
});

test("un workout completado se muestra como realidad aunque no coincida con hoy", async ({
  page,
}, testInfo) => {
  await loginForCalendar(
    page,
    "calendar-completed-only",
    testInfo.project.name,
  );

  await expect(page.getByText("Completado", { exact: true })).toBeVisible();
  await expect(page.getByText("Plan realizado")).toHaveCount(0);
  await expect(
    page.getByRole("link", { name: "Ver entrenamiento" }),
  ).toBeVisible();
});

test("una sesión activa marca LIVE y sólo permite continuar", async ({
  page,
}, testInfo) => {
  await loginForCalendar(page, "calendar-live", testInfo.project.name);

  await expect(page.getByText("Entrenamiento activo")).toBeVisible();
  await expect(page.getByText("LIVE").first()).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Continuar", exact: true }),
  ).toHaveAttribute("href", /\/workout\/[0-9a-f-]+/);
  await expect(
    page.getByRole("button", { name: "Empezar entrenamiento" }),
  ).toHaveCount(0);
});

test("un plan parcial no inventa fechas programadas", async ({
  page,
}, testInfo) => {
  await loginForCalendar(page, "calendar-partial", testInfo.project.name);

  await expect(page.getByText(/no tiene días fijos/)).toBeVisible();
  await expect(page.locator('[data-calendar-state="scheduled"]')).toHaveCount(
    0,
  );
  await expect(
    page.getByRole("button", { name: "Empezar entrenamiento" }),
  ).toHaveCount(0);
});

test("plan y sesión coincidentes se comunican sin ofrecer un duplicado", async ({
  page,
}, testInfo) => {
  await loginForCalendar(
    page,
    "calendar-completed-scheduled",
    testInfo.project.name,
  );

  await expect(page.getByText("Plan realizado")).toBeVisible();
  await expect(
    page.locator('[data-calendar-state="scheduled-and-completed"]'),
  ).toHaveCount(1);
  await expect(
    page.getByRole("button", { name: "Empezar entrenamiento" }),
  ).toHaveCount(0);
});

test("navega entre meses mediante URL y vuelve con historial del navegador", async ({
  page,
}, testInfo) => {
  await loginForCalendar(page, "calendar-navigation", testInfo.project.name);
  const initialUrl = page.url();

  await page.getByRole("link", { name: "Mes siguiente" }).click();
  await expect(page).toHaveURL(/\/calendar\?month=\d{4}-\d{2}$/);
  expect(page.url()).not.toBe(initialUrl);
  await page.goBack();
  await expect(page).toHaveURL("/calendar");
});
