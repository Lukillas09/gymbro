import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database.generated";
import { getSupabasePublicConfig, SupabaseEnvironmentError } from "./env";

const publicPaths = new Set(["/login", "/register", "/auth/confirm"]);

function isPublicPath(pathname: string) {
  return publicPaths.has(pathname);
}

function copySessionMetadata(source: NextResponse, target: NextResponse) {
  source.cookies.getAll().forEach((cookie) => target.cookies.set(cookie));

  for (const name of ["cache-control", "expires", "pragma"]) {
    const value = source.headers.get(name);

    if (value) {
      target.headers.set(name, value);
    }
  }

  return target;
}

function redirectToLogin(request: NextRequest, response: NextResponse) {
  const url = request.nextUrl.clone();
  const requestedPath = `${request.nextUrl.pathname}${request.nextUrl.search}`;

  url.pathname = "/login";
  url.search = "";
  url.searchParams.set("next", requestedPath);

  return copySessionMetadata(response, NextResponse.redirect(url));
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const pathname = request.nextUrl.pathname;

  let config: ReturnType<typeof getSupabasePublicConfig>;

  try {
    config = getSupabasePublicConfig();
  } catch (error) {
    if (error instanceof SupabaseEnvironmentError) {
      return isPublicPath(pathname)
        ? response
        : redirectToLogin(request, response);
    }

    throw error;
  }

  const supabase = createServerClient<Database>(config.url, config.publicKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });

        response = NextResponse.next({ request });

        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });

        Object.entries(headers).forEach(([name, value]) => {
          response.headers.set(name, value);
        });
      },
    },
  });

  const { data, error } = await supabase.auth.getClaims();
  const isAuthenticated = !error && Boolean(data?.claims?.sub);

  if (!isAuthenticated && !isPublicPath(pathname)) {
    return redirectToLogin(request, response);
  }

  return response;
}
