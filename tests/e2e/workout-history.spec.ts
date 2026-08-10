import { expect, test } from "@playwright/test";

async function loginForHistory(
  page: import("@playwright/test").Page,
  scenario: string,
  projectName: string,
) {
  await page.goto("/login?next=/history");
  await page
    .getByLabel("Correo electrónico")
    .fill(`${scenario}-${projectName}@gymbro.test`);
  await page.getByLabel("Contraseña").fill("Gymbro123!");
  await page.getByRole("button", { name: "Iniciar sesión" }).click();
  await expect(page).toHaveURL("/history");
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
    await page.screenshot({
      fullPage: true,
      path: testInfo.outputPath(`${name}-320.png`),
    });
  }
}

test.beforeEach(async ({ page }, testInfo) => {
  if (testInfo.project.name === "mobile-chromium") {
    await page.setViewportSize({ width: 390, height: 844 });
  }
});

test("Historial vacío ofrece entrenar sin métricas ficticias", async ({
  page,
}, testInfo) => {
  await loginForHistory(page, "history-empty", testInfo.project.name);

  await expect(
    page.getByRole("heading", {
      name: "Todavía no completaste entrenamientos",
    }),
  ).toBeVisible();
  await expect(
    page.locator("#main-content").getByRole("link", { name: "Entrenar" }),
  ).toHaveAttribute("href", "/workout");
  await expect(page.getByText(/0 horas|0 PRs|0 volumen/)).toHaveCount(0);
  await verifyResponsive(page, testInfo, "history-empty");
});

test("Historial representa una única sesión completada", async ({
  page,
}, testInfo) => {
  await loginForHistory(page, "history-one", testInfo.project.name);

  await expect(page.getByRole("heading", { name: "Historial" })).toBeVisible();
  await expect(page.getByRole("link", { name: /^Ver Push del/ })).toHaveCount(
    1,
  );
  await expect(page.getByRole("button", { name: "Cargar más" })).toHaveCount(0);
});

test("Historial pagina por cursor y excluye la sesión activa", async ({
  page,
}, testInfo) => {
  await loginForHistory(page, "history-many", testInfo.project.name);

  const workoutLinks = page.getByRole("link", { name: /^Ver Push del/ });
  await expect(workoutLinks).toHaveCount(20);
  await expect(page.getByText("NO DEBE APARECER")).toHaveCount(0);
  await page.getByRole("button", { name: "Cargar más" }).click();
  await expect(workoutLinks).toHaveCount(23);
  await expect(page.getByRole("button", { name: "Cargar más" })).toHaveCount(0);
  await verifyResponsive(page, testInfo, "history-many");
});

test("Detalle muestra resultados reales y progreso factual", async ({
  page,
}, testInfo) => {
  await loginForHistory(page, "history-detail", testInfo.project.name);
  await page
    .getByRole("link", { name: /^Ver Push del/ })
    .first()
    .click();

  await expect(page).toHaveURL(/\/history\/[0-9a-f-]+$/);
  await expect(
    page.getByRole("heading", { level: 1, name: "Push" }),
  ).toBeVisible();
  await expect(page.getByText("3 / 4 series realizadas")).toBeVisible();
  await expect(page.getByText("40 kg × 10")).toBeVisible();
  await expect(page.getByText("RIR 4")).toBeVisible();
  await expect(page.getByText("Entrada en calor")).toBeVisible();
  await expect(
    page.getByText("↑ +1 REP respecto de la sesión anterior"),
  ).toBeVisible();
  await expect(page.getByText("Serie 4")).toHaveCount(0);
  await expect(
    page.getByRole("navigation", { name: "Navegación principal" }),
  ).toBeVisible();
  await verifyResponsive(page, testInfo, "history-detail");
});
