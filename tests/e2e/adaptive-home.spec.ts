import { expect, test } from "@playwright/test";

async function loginForHome(
  page: import("@playwright/test").Page,
  scenario: string,
  projectName: string,
) {
  await page.goto("/login?next=/");
  await page
    .getByLabel("Correo electrónico")
    .fill(`${scenario}-${projectName}@gymbro.test`);
  await page.getByLabel("Contraseña").fill("Gymbro123!");
  await page.getByRole("button", { name: "Iniciar sesión" }).click();
  await expect(page).toHaveURL("/");
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

test("Home sin rutina prioriza crearla", async ({ page }, testInfo) => {
  await loginForHome(page, "home-no-routine", testInfo.project.name);
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Tu entrenamiento empieza con una rutina.",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Crear rutina/ }),
  ).toHaveAttribute("href", "/routines/new");
  await verifyResponsive(page, testInfo, "home-no-routine");
});

test("Home READY muestra el día real y permite iniciarlo", async ({
  page,
}, testInfo) => {
  await loginForHome(page, "home-ready", testInfo.project.name);
  await expect(
    page.getByRole("heading", { level: 1, name: "Push" }),
  ).toBeVisible();
  await expect(page.getByText("Pecho")).toBeVisible();
  await expect(
    page.getByText(/Press banca con barra · 80 kg × 8/),
  ).toBeVisible();
  await expect(
    page.getByRole("navigation", { name: "Navegación principal" }),
  ).toBeVisible();
  await verifyResponsive(page, testInfo, "home-ready");

  await page.getByRole("button", { name: "Empezar entrenamiento" }).click();
  await expect(page).toHaveURL(/\/workout\/[0-9a-f-]+$/);
});

test("Home TRAINING vuelve al workout activo en un toque", async ({
  page,
}, testInfo) => {
  await loginForHome(page, "home-training", testInfo.project.name);
  await expect(page.getByText("Entrenamiento activo")).toBeVisible();
  await expect(page.getByText("Press banca con barra")).toBeVisible();
  await expect(page.getByText("Serie 2 de 3")).toBeVisible();
  await verifyResponsive(page, testInfo, "home-training");

  await page.getByRole("link", { name: /Continuar entrenamiento/ }).click();
  await expect(page).toHaveURL(/\/workout\/[0-9a-f-]+$/);
});

test("Home COMPLETED reconoce el resultado factual de hoy", async ({
  page,
}, testInfo) => {
  await loginForHome(page, "home-completed", testInfo.project.name);
  await expect(page.getByText("Entrenamiento completado")).toBeVisible();
  await expect(page.getByText("Press banca con barra · +1 REP")).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Ver entrenamiento/ }),
  ).toBeVisible();
  await verifyResponsive(page, testInfo, "home-completed");

  await page.getByRole("link", { name: /Ver entrenamiento/ }).click();
  await expect(page).toHaveURL(/\/history\/[0-9a-f-]+$/);
  await expect(
    page.getByRole("heading", { level: 1, name: "Push" }),
  ).toBeVisible();
});

test("Home REST muestra el próximo día programado", async ({
  page,
}, testInfo) => {
  await loginForHome(page, "home-rest", testInfo.project.name);
  await expect(
    page.getByRole("heading", { level: 1, name: "Descanso" }),
  ).toBeVisible();
  await expect(page.getByText("Push · mañana")).toBeVisible();
  await verifyResponsive(page, testInfo, "home-rest");
});
