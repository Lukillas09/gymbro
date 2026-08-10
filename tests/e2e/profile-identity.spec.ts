import { expect, test } from "@playwright/test";

async function loginForProfile(
  page: import("@playwright/test").Page,
  scenario: string,
  projectName: string,
) {
  await page.goto("/login?next=/profile");
  await page
    .getByLabel("Correo electrónico")
    .fill(`${scenario}-${projectName}@gymbro.test`);
  await page.getByLabel("Contraseña").fill("Gymbro123!");
  await page.getByRole("button", { name: "Iniciar sesión" }).click();
  await expect(page).toHaveURL("/profile");
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

test("un perfil nuevo conserva identidad sin métricas ficticias", async ({
  page,
}, testInfo) => {
  await loginForProfile(page, "profile-new", testInfo.project.name);

  await expect(
    page.getByRole("heading", { level: 1, name: "Lucas GymBro" }),
  ).toBeVisible();
  await expect(page.getByText("@lucas.gymbro")).toBeVisible();
  await expect(page.getByText("Sin rutina activa")).toBeVisible();
  await expect(page.getByLabel("Resumen de entrenamiento")).toHaveCount(0);
  await expect(page.getByText("0", { exact: true })).toHaveCount(0);
  await expect(
    page.getByRole("link", { name: "Crear rutina" }),
  ).toHaveAttribute("href", "/routines/new");
  await verifyResponsive(page, testInfo, "profile-new");
});

test("una rutina activa sin historial ofrece comenzar a entrenar", async ({
  page,
}, testInfo) => {
  await loginForProfile(page, "profile-routine", testInfo.project.name);

  await expect(page.getByText("Push Pull")).toBeVisible();
  await expect(page.getByText("2 días · 2 ejercicios")).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Empezar a entrenar" }),
  ).toHaveAttribute("href", "/workout");
  await expect(page.getByText("Más presentes recientemente")).toHaveCount(0);
});

test("una sola sesión muestra hechos sin inferir un patrón muscular", async ({
  page,
}, testInfo) => {
  await loginForProfile(page, "profile-one", testInfo.project.name);

  await expect(page.getByText("Entreno", { exact: true })).toBeVisible();
  await expect(page.getByText("PR de peso")).toBeVisible();
  await expect(page.getByRole("link", { name: /Ver Push del/ })).toBeVisible();
  await expect(page.getByText("Más presentes recientemente")).toHaveCount(0);
});

test("el historial construye métricas y evidencia muscular acotada", async ({
  page,
}, testInfo) => {
  await loginForProfile(page, "profile-history", testInfo.project.name);

  await expect(page.getByText("Entrenos", { exact: true })).toBeVisible();
  await expect(page.getByText("Últimos 28 días")).toBeVisible();
  await expect(page.getByText("Semanas activas")).toBeVisible();
  await expect(page.getByText("Más presentes recientemente")).toBeVisible();
  await expect(page.getByRole("link", { name: /Ver Push del/ })).toHaveCount(3);
  await verifyResponsive(page, testInfo, "profile-history");
});

test("el perfil reutiliza el PR de peso del ejercicio más reciente", async ({
  page,
}, testInfo) => {
  await loginForProfile(page, "profile-pr", testInfo.project.name);

  await expect(page.getByText("90 kg × 6")).toBeVisible();
  await expect(
    page.getByRole("link", {
      name: "Ver progreso de Press banca con barra",
    }),
  ).toHaveAttribute(
    "href",
    "/progress/exercises/11111111-1111-4111-8111-111111111111",
  );
});

test("sin rutina activa conserva el pasado y ofrece volver a planificar", async ({
  page,
}, testInfo) => {
  await loginForProfile(page, "profile-no-routine", testInfo.project.name);

  await expect(page.getByText("Sin rutina activa")).toBeVisible();
  await expect(page.getByRole("link", { name: /Ver Push del/ })).toHaveCount(3);
  await expect(page.getByRole("link", { name: "Ver rutinas" })).toHaveAttribute(
    "href",
    "/routines",
  );
});

test("navega por History, vuelve al perfil y edita la identidad", async ({
  page,
}, testInfo) => {
  await loginForProfile(page, "profile-history-flow", testInfo.project.name);

  await page.getByRole("link", { name: "Ver todo el historial" }).click();
  await expect(page).toHaveURL("/history");
  await page
    .getByRole("link", { name: /Ver Push del/ })
    .first()
    .click();
  await expect(page).toHaveURL(/\/history\/[0-9a-f-]+$/);
  await page.goBack();
  await expect(page).toHaveURL("/history");
  await page.goBack();
  await expect(page).toHaveURL("/profile");

  await page.getByRole("link", { name: "Editar perfil" }).click();
  await expect(page).toHaveURL("/profile/edit");
  await expect(
    page.getByRole("heading", { level: 1, name: "Editar perfil" }),
  ).toBeVisible();
  await page.getByLabel("Nombre visible").fill("Lucas Entrena");
  await page.getByRole("button", { name: "Guardar cambios" }).click();
  await expect(page).toHaveURL("/profile");
  await expect(
    page.getByRole("heading", { level: 1, name: "Lucas Entrena" }),
  ).toBeVisible();
});
