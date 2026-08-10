import type { Metadata } from "next";
import Link from "next/link";
import { LogoutButton } from "@/features/auth/components/logout-button";
import { requireCompletedProfile } from "@/features/auth/server";
import { ProfileEditForm } from "@/features/profile/components/profile-edit-form";
import { APP_TIME_ZONE, getLocalDateKey } from "@/lib/date-time";

export const metadata: Metadata = {
  title: "Editar perfil",
};

export default async function EditProfilePage() {
  const { profile } = await requireCompletedProfile();
  const maximumBirthDate = getLocalDateKey(new Date(), APP_TIME_ZONE);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-7 sm:px-8 sm:py-10 lg:py-14">
      <Link
        className="inline-flex min-h-11 items-center text-sm font-black text-[#a9ada6] outline-none hover:text-[#f4cf3a] focus-visible:text-[#f4cf3a]"
        href="/profile"
      >
        Volver al perfil
      </Link>

      <header className="mt-5 max-w-2xl">
        <p className="text-xs font-black uppercase text-[#858a82]">
          Configuración
        </p>
        <h1 className="mt-2 text-3xl leading-tight font-black text-white sm:text-4xl">
          Editar perfil
        </h1>
        <p className="mt-3 text-sm leading-6 text-[#a9ada6] sm:text-base">
          Actualizá tu identidad y tus preferencias personales.
        </p>
      </header>

      <div className="mt-9 border-y border-[#343731] py-8">
        <ProfileEditForm
          maximumBirthDate={maximumBirthDate}
          profile={profile}
        />
      </div>

      <section aria-labelledby="session-settings-title" className="pt-8">
        <h2
          className="text-base font-extrabold text-white"
          id="session-settings-title"
        >
          Sesión
        </h2>
        <div className="mt-5">
          <LogoutButton />
        </div>
      </section>
    </div>
  );
}
