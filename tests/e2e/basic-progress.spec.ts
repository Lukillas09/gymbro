import { expect, test } from "@playwright/test";

async function loginForProgress(
  page: import("@playwright/test").Page,
  scenario: string,
  projectName: string,
) {
  await page.goto("/login?next=/progress");
  await page
    .getByLabel("Correo electrónico")
    .fill(`${scenario}-${projectName}@gymbro.test`);
  await page.getByLabel("Contraseña").fill("Gymbro123!");
  await page.getByRole("button", { name: "Iniciar sesión" }).click();
  await expect(page).toHaveURL("/progress");
}

async function verifyResponsive(
  page: import("@playwright/test").Page,
  testInfo: import("@playwright/test").TestInfo,
  name: string,
) {
  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
  await page.screenshot({
    fullPage: true,
    path: testInfo.outputPath(`${name}.png`),
  });

  if (testInfo.project.name === "mobile-chromium") {
    await page.setViewportSize({ width: 320, height: 700 });
    const narrow = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));
    expect(narrow.scrollWidth).toBeLessThanOrEqual(narrow.clientWidth);
  }
}

test.beforeEach(async ({ page }, testInfo) => {
  if (testInfo.project.name === "mobile-chromium") {
    await page.setViewportSize({ width: 390, height: 844 });
  }
});

test("Progreso vacío ofrece entrenar sin métricas ficticias", async ({
  page,
}, testInfo) => {
  await loginForProgress(page, "progress-empty", testInfo.project.name);

  await expect(
    page.getByRole("heading", { name: "Todavía no hay progreso para mostrar" }),
  ).toBeVisible();
  await expect(
    page.locator("#main-content").getByRole("link", { name: "Entrenar" }),
  ).toHaveAttribute("href", "/workout");
  await expect(page.getByText(/volumen|1RM|racha/i)).toHaveCount(0);
  await verifyResponsive(page, testInfo, "progress-empty");
});

test("Una sesión muestra sólo lo que ya puede saberse", async ({
  page,
}, testInfo) => {
  await loginForProgress(page, "progress-one", testInfo.project.name);

  await expect(
    page.getByRole("heading", { name: "Ya tenés un primer registro reciente" }),
  ).toBeVisible();
  await expect(page.getByText("Mejoras recientes")).toHaveCount(0);
  await expect(
    page.getByRole("link", { name: "Ver progreso de Press banca con barra" }),
  ).toBeVisible();
});

test("Varias sesiones muestran mejora factual, búsqueda y detalle", async ({
  page,
}, testInfo) => {
  await loginForProgress(page, "progress-improving", testInfo.project.name);

  await expect(
    page.getByRole("heading", { name: "Hay señales concretas de progreso" }),
  ).toBeVisible();
  await expect(page.getByText("Mejoras recientes")).toBeVisible();
  await expect(page.getByText("+1 REP").first()).toBeVisible();

  const search = page.getByRole("searchbox", {
    name: "Buscar ejercicio entrenado",
  });
  await search.fill("hip");
  await expect(
    page.getByRole("link", { name: "Ver progreso de Hip thrust con barra" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Ver progreso de Press banca con barra" }),
  ).toHaveCount(0);
  await search.fill("");
  await verifyResponsive(page, testInfo, "progress-improving");

  await page
    .getByRole("link", { name: "Ver progreso de Press banca con barra" })
    .click();
  await expect(page).toHaveURL(/\/progress\/exercises\/[0-9a-f-]+$/);
  await expect(
    page.getByRole("heading", { name: "Press banca con barra" }),
  ).toBeVisible();
  await expect(page.getByText("PR de peso")).toBeVisible();
  await expect(page.getByText("80 kg × 9").first()).toBeVisible();
  await verifyResponsive(page, testInfo, "progress-exercise-detail");

  await page
    .getByRole("link", { name: /Ver entrenamiento del/ })
    .first()
    .click();
  await expect(page).toHaveURL(/\/history\/[0-9a-f-]+$/);

  await page.goBack();
  await expect(page).toHaveURL(/\/progress\/exercises\/[0-9a-f-]+$/);
  await page.getByRole("link", { name: "Volver a Progreso" }).click();
  await expect(page).toHaveURL("/progress");
});

test("Un cambio mixto queda sin clasificación concluyente", async ({
  page,
}, testInfo) => {
  await loginForProgress(page, "progress-mixed", testInfo.project.name);

  await expect(
    page.getByRole("heading", { name: "Entrenaste con más frecuencia" }),
  ).toBeVisible();
  await expect(
    page.getByText(/todavía no hay una mejora directa/i),
  ).toBeVisible();
  await expect(page.getByText("Mejoras recientes")).toHaveCount(0);
  await expect(page.getByText(/en descenso|empeoraste/i)).toHaveCount(0);
});
