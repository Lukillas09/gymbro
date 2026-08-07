import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthFrame } from "@/features/auth/components/auth-frame";
import { LogoutButton } from "@/features/auth/components/logout-button";
import { OnboardingForm } from "@/features/auth/components/onboarding-form";
import { isProfileComplete } from "@/features/auth/profile";
import { resolveSafeRedirect } from "@/features/auth/redirects";
import { requireAuthContext } from "@/features/auth/server";

export const metadata: Metadata = {
  title: "Completar perfil",
};

type OnboardingPageProps = Readonly<{
  searchParams: Promise<{ next?: string | string[] }>;
}>;

export default async function OnboardingPage({
  searchParams,
}: OnboardingPageProps) {
  const context = await requireAuthContext();

  if (isProfileComplete(context.profile)) {
    redirect("/");
  }

  const params = await searchParams;
  const nextValue = Array.isArray(params.next) ? params.next[0] : params.next;
  const today = new Date().toISOString().slice(0, 10);

  return (
    <AuthFrame
      description="Estos datos adaptan GymBro a tu forma de entrenar. Los campos opcionales pueden esperar."
      eyebrow="Primer paso"
      title="Prepará tu perfil"
      wide
    >
      {context.profile ? (
        <OnboardingForm
          maximumBirthDate={today}
          next={resolveSafeRedirect(nextValue)}
          profile={context.profile}
        />
      ) : (
        <div role="alert">
          <p className="text-sm leading-6 text-[#ffb4ad]">
            No pudimos preparar tu perfil. Cerrá la sesión e intentá registrarte
            nuevamente.
          </p>
          <div className="mt-6">
            <LogoutButton />
          </div>
        </div>
      )}
    </AuthFrame>
  );
}
