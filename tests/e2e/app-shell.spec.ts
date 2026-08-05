import { expect, test } from "@playwright/test";

const routes = [
  { path: "/", label: "Inicio", heading: "Tu espacio de entrenamiento" },
  { path: "/routines", label: "Rutinas", heading: "Rutinas" },
  { path: "/workout", label: "Entrenar", heading: "Entrenar" },
  { path: "/progress", label: "Progreso", heading: "Progreso" },
  { path: "/profile", label: "Perfil", heading: "Perfil" },
] as const;

test.describe("rutas principales", () => {
  for (const route of routes) {
    test(`permite acceder a ${route.path}`, async ({ page }) => {
      await page.goto(route.path);

      await expect(
        page.getByRole("heading", { level: 1, name: route.heading }),
      ).toBeVisible();
      await expect(
        page
          .getByRole("navigation", { name: "Navegación principal" })
          .getByRole("link", { name: route.label, exact: true }),
      ).toHaveAttribute("aria-current", "page");
    });
  }
});

test("permite navegar entre las cinco secciones", async ({ page }) => {
  await page.goto("/");

  const navigation = page.getByRole("navigation", {
    name: "Navegación principal",
  });

  for (const route of routes) {
    await navigation
      .getByRole("link", { name: route.label, exact: true })
      .click();
    await expect(page).toHaveURL(route.path);
    await expect(
      page.getByRole("heading", { level: 1, name: route.heading }),
    ).toBeVisible();
  }
});

test("no presenta desbordamiento horizontal en móvil", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });

  for (const route of routes) {
    await page.goto(route.path);

    const dimensions = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));

    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
  }
});

test("el skip link lleva el foco al contenido principal", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");

  const skipLink = page.getByRole("link", { name: "Saltar al contenido" });
  await expect(skipLink).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("main")).toBeFocused();
});

test("la navegación y sus destinos tienen nombres accesibles", async ({
  page,
}) => {
  await page.goto("/");

  const navigation = page.getByRole("navigation", {
    name: "Navegación principal",
  });
  await expect(navigation).toBeVisible();

  for (const route of routes) {
    await expect(
      navigation.getByRole("link", { name: route.label, exact: true }),
    ).toBeVisible();
  }
});
