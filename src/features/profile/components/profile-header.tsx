import Link from "next/link";
import type { ProfileIdentityModel } from "../types";

export function ProfileHeader({
  identity,
}: Readonly<{ identity: ProfileIdentityModel["identity"] }>) {
  return (
    <header className="border-b border-[#343731] pb-8 sm:pb-10">
      <div className="flex items-start justify-between gap-4">
        <div
          aria-label={`Iniciales de ${identity.displayName}: ${identity.initials}`}
          className="grid size-20 shrink-0 place-items-center rounded-lg border border-[#5c5424] bg-[#f4cf3a] text-2xl font-black text-[#11120f] sm:size-24 sm:text-3xl"
          role="img"
        >
          {identity.initials}
        </div>
        <Link
          className="flex min-h-11 shrink-0 items-center rounded-md border border-[#444740] px-4 text-sm font-black text-white outline-none hover:border-[#f4cf3a] hover:text-[#f4cf3a] focus-visible:border-[#f4cf3a]"
          href="/profile/edit"
        >
          Editar perfil
        </Link>
      </div>

      <div className="mt-6 min-w-0">
        <h1 className="break-words text-4xl leading-tight font-black text-white sm:text-5xl">
          {identity.displayName}
        </h1>
        <p className="mt-2 break-all text-base font-bold text-[#a9ada6]">
          @{identity.username}
        </p>
        <p className="mt-4 text-sm font-black text-[#f4cf3a] sm:text-base">
          {identity.trainingLevel} · {identity.primaryGoal}
        </p>
      </div>
    </header>
  );
}
