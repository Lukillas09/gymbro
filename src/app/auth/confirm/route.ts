import type { EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { resolveSafeRedirect } from "@/features/auth/redirects";

function isSupportedEmailOtpType(value: string | null): value is EmailOtpType {
  return value === "email" || value === "signup";
}

export async function GET(request: NextRequest) {
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const type = request.nextUrl.searchParams.get("type");
  const code = request.nextUrl.searchParams.get("code");
  const destination = resolveSafeRedirect(
    request.nextUrl.searchParams.get("next"),
    "/onboarding",
  );

  try {
    const supabase = await createClient();
    const result =
      tokenHash && isSupportedEmailOtpType(type)
        ? await supabase.auth.verifyOtp({ token_hash: tokenHash, type })
        : code
          ? await supabase.auth.exchangeCodeForSession(code)
          : null;

    if (result && !result.error) {
      return NextResponse.redirect(new URL(destination, request.url));
    }
  } catch {
    // Authentication details stay server-side; the user receives a neutral error.
  }

  return NextResponse.redirect(
    new URL("/login?authError=confirmation", request.url),
  );
}
