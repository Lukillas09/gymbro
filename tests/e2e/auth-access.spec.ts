import { expect, test } from "@playwright/test";

const privateRoutes = [
  "/",
  "/routines",
  "/workout",
  "/progress",
  "/profile",
] as const;

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
