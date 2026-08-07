type ConfirmationOriginOptions = Readonly<{
  configuredAppUrl: string | undefined;
  requestOrigin: string | null;
  environment: string | undefined;
}>;

const loopbackHosts = new Set(["localhost", "127.0.0.1", "[::1]"]);

function parseHttpUrl(value: string) {
  const url = new URL(value);

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("Application URLs must use HTTP or HTTPS.");
  }

  return url;
}

function isEquivalentDevelopmentOrigin(configured: URL, request: URL) {
  return (
    loopbackHosts.has(configured.hostname) &&
    loopbackHosts.has(request.hostname) &&
    configured.protocol === request.protocol &&
    configured.port === request.port
  );
}

export function resolveConfirmationOrigin({
  configuredAppUrl,
  requestOrigin,
  environment,
}: ConfirmationOriginOptions) {
  const value = configuredAppUrl?.trim();

  if (!value && environment === "production") {
    throw new Error("NEXT_PUBLIC_APP_URL is required for email confirmation.");
  }

  const configured = parseHttpUrl(value || "http://localhost:3000");

  if (environment !== "production" && requestOrigin) {
    const request = parseHttpUrl(requestOrigin);

    if (isEquivalentDevelopmentOrigin(configured, request)) {
      return request.origin;
    }
  }

  return configured.origin;
}
