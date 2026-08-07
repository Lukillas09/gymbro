import type { Metadata } from "next";
import { PageShell } from "@/components/ui/page-shell";
import {
  BIOLOGICAL_SEX_OPTIONS,
  TRAINING_GOAL_OPTIONS,
  TRAINING_LEVEL_OPTIONS,
  WEIGHT_UNIT_OPTIONS,
  getOptionLabel,
} from "@/features/auth/constants";
import { LogoutButton } from "@/features/auth/components/logout-button";
import { requireCompletedProfile } from "@/features/auth/server";

export const metadata: Metadata = {
  title: "Perfil",
};

type ProfileValueProps = Readonly<{
  label: string;
  value: string | number | null;
}>;

function ProfileValue({ label, value }: ProfileValueProps) {
  return (
    <div className="border-b border-[#2a2d29] py-4 last:border-b-0">
      <dt className="text-xs font-bold uppercase text-[#7f847c]">{label}</dt>
      <dd className="mt-1 text-sm font-semibold text-[#e7e9e4]">
        {value ?? "Sin completar"}
      </dd>
    </div>
  );
}

export default async function ProfilePage() {
  const { profile } = await requireCompletedProfile();

  return (
    <PageShell
      description="Tu identidad y preferencias de entrenamiento."
      eyebrow="Cuenta"
      title="Perfil"
    >
      <section className="rounded-lg border border-[#2a2d29] bg-[#111310] px-5 py-6 sm:px-7">
        <div className="flex items-center gap-4">
          <div className="grid size-14 shrink-0 place-items-center rounded-lg bg-[#f4cf3a] text-xl font-black text-[#11120f]">
            {profile.display_name?.trim().charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-xl font-extrabold text-white">
              {profile.display_name}
            </h2>
            <p className="mt-1 truncate text-sm text-[#9ba098]">
              @{profile.username}
            </p>
          </div>
        </div>

        <dl className="mt-6 border-t border-[#2a2d29]">
          <ProfileValue
            label="Objetivo"
            value={getOptionLabel(TRAINING_GOAL_OPTIONS, profile.primary_goal)}
          />
          <ProfileValue
            label="Nivel"
            value={getOptionLabel(
              TRAINING_LEVEL_OPTIONS,
              profile.training_level,
            )}
          />
          <ProfileValue
            label="Unidad preferida"
            value={getOptionLabel(
              WEIGHT_UNIT_OPTIONS,
              profile.preferred_weight_unit,
            )}
          />
          <ProfileValue
            label="Sexo biológico"
            value={getOptionLabel(
              BIOLOGICAL_SEX_OPTIONS,
              profile.biological_sex,
            )}
          />
          <ProfileValue
            label="Fecha de nacimiento"
            value={profile.birth_date}
          />
          <ProfileValue
            label="Altura"
            value={profile.height_cm ? `${profile.height_cm} cm` : null}
          />
          <ProfileValue
            label="Peso actual"
            value={
              profile.current_weight_kg
                ? `${profile.current_weight_kg} kg`
                : null
            }
          />
        </dl>

        <div className="mt-6 border-t border-[#2a2d29] pt-6">
          <LogoutButton />
        </div>
      </section>
    </PageShell>
  );
}
