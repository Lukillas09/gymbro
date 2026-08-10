const privateRouteRoots = [
  "/",
  "/calendar",
  "/exercises",
  "/history",
  "/profile",
  "/progress",
  "/routines",
  "/workout",
] as const;

function isPrivatePath(pathname: string) {
  return privateRouteRoots.some((root) =>
    root === "/"
      ? pathname === root
      : pathname === root || pathname.startsWith(`${root}/`),
  );
}

export function resolveSafeRedirect(
  candidate: string | null | undefined,
  fallback = "/",
) {
  if (!candidate || candidate.includes("\\")) {
    return fallback;
  }

  try {
    const baseUrl = new URL("https://gymbro.local");
    const destination = new URL(candidate, baseUrl);

    if (
      destination.origin !== baseUrl.origin ||
      !isPrivatePath(destination.pathname)
    ) {
      return fallback;
    }

    return `${destination.pathname}${destination.search}${destination.hash}`;
  } catch {
    return fallback;
  }
}

export function getOnboardingPath(next: string | null | undefined) {
  const destination = resolveSafeRedirect(next);

  return destination === "/"
    ? "/onboarding"
    : `/onboarding?next=${encodeURIComponent(destination)}`;
}
