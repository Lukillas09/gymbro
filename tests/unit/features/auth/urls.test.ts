import { describe, expect, it } from "vitest";
import { resolveConfirmationOrigin } from "@/features/auth/urls";

describe("origin de confirmación", () => {
  it("usa el loopback real de la solicitud durante desarrollo", () => {
    expect(
      resolveConfirmationOrigin({
        configuredAppUrl: "http://localhost:3000",
        requestOrigin: "http://127.0.0.1:3000",
        environment: "development",
      }),
    ).toBe("http://127.0.0.1:3000");
  });

  it("ignora origins proporcionados por la solicitud en producción", () => {
    expect(
      resolveConfirmationOrigin({
        configuredAppUrl: "https://gymbro.example",
        requestOrigin: "https://attacker.example",
        environment: "production",
      }),
    ).toBe("https://gymbro.example");
  });
});
