import { describe, expect, it } from "vitest";
import {
  getOnboardingPath,
  resolveSafeRedirect,
} from "@/features/auth/redirects";

describe("redirecciones de autenticación", () => {
  it("conserva destinos privados internos", () => {
    expect(resolveSafeRedirect("/workout?resume=1")).toBe("/workout?resume=1");
  });

  it("rechaza URLs externas y rutas públicas", () => {
    expect(resolveSafeRedirect("https://example.com/phishing")).toBe("/");
    expect(resolveSafeRedirect("//example.com/phishing")).toBe("/");
    expect(resolveSafeRedirect("/login")).toBe("/");
  });

  it("transporta un destino seguro a onboarding", () => {
    expect(getOnboardingPath("/progress?view=history")).toBe(
      "/onboarding?next=%2Fprogress%3Fview%3Dhistory",
    );
  });
});
