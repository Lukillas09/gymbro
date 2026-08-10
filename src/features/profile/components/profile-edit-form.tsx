"use client";

import { useActionState, useState, type FormEvent } from "react";
import { SelectField, TextField } from "@/components/ui/form-field";
import { SubmitButton } from "@/components/ui/submit-button";
import {
  INITIAL_AUTH_ACTION_STATE,
  type AuthFieldName,
} from "@/features/auth/action-state";
import {
  BIOLOGICAL_SEX_OPTIONS,
  TRAINING_GOAL_OPTIONS,
  TRAINING_LEVEL_OPTIONS,
  WEIGHT_UNIT_OPTIONS,
} from "@/features/auth/constants";
import type { Profile } from "@/features/auth/profile";
import { validateOnboardingInput } from "@/features/auth/validation";
import { updateProfileAction } from "../actions";

type ProfileEditFormProps = Readonly<{
  profile: Profile;
  maximumBirthDate: string;
}>;

export function ProfileEditForm({
  profile,
  maximumBirthDate,
}: ProfileEditFormProps) {
  const [state, formAction] = useActionState(
    updateProfileAction,
    INITIAL_AUTH_ACTION_STATE,
  );
  const [clientErrors, setClientErrors] = useState<Partial<
    Record<AuthFieldName, string>
  > | null>(null);
  const fieldErrors = clientErrors ?? state.fieldErrors;

  function validateBeforeSubmit(event: FormEvent<HTMLFormElement>) {
    const formData = new FormData(event.currentTarget);
    const result = validateOnboardingInput({
      username: String(formData.get("username") ?? ""),
      displayName: String(formData.get("displayName") ?? ""),
      trainingLevel: String(formData.get("trainingLevel") ?? ""),
      primaryGoal: String(formData.get("primaryGoal") ?? ""),
      preferredWeightUnit: String(formData.get("preferredWeightUnit") ?? ""),
      biologicalSex: String(formData.get("biologicalSex") ?? ""),
      birthDate: String(formData.get("birthDate") ?? ""),
      heightCm: String(formData.get("heightCm") ?? ""),
      currentWeightKg: String(formData.get("currentWeightKg") ?? ""),
    });

    if (!result.ok) {
      event.preventDefault();
      setClientErrors(result.fieldErrors);
      return;
    }

    setClientErrors({});
  }

  return (
    <form action={formAction} noValidate onSubmit={validateBeforeSubmit}>
      {state.message ? (
        <p
          className="mb-6 rounded-lg border border-[#62342f] bg-[#261513] px-4 py-3 text-sm leading-6 text-[#ffb4ad]"
          role="alert"
        >
          {state.message}
        </p>
      ) : null}

      <section aria-labelledby="identity-settings-title">
        <h2
          className="text-base font-extrabold text-white"
          id="identity-settings-title"
        >
          Identidad
        </h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <TextField
            autoCapitalize="none"
            autoComplete="username"
            defaultValue={profile.username ?? ""}
            description="3 a 20 caracteres: letras minúsculas, números, punto o guion bajo."
            error={fieldErrors?.username}
            id="profile-username"
            label="Nombre de usuario"
            maxLength={20}
            name="username"
            pattern="[a-z0-9_.]{3,20}"
            required
            spellCheck={false}
            type="text"
          />
          <TextField
            autoComplete="name"
            defaultValue={profile.display_name ?? ""}
            error={fieldErrors?.displayName}
            id="profile-display-name"
            label="Nombre visible"
            maxLength={80}
            name="displayName"
            required
            type="text"
          />
          <SelectField
            defaultValue={profile.training_level ?? ""}
            error={fieldErrors?.trainingLevel}
            id="profile-training-level"
            label="Nivel de entrenamiento"
            name="trainingLevel"
            required
          >
            {TRAINING_LEVEL_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </SelectField>
          <SelectField
            defaultValue={profile.primary_goal ?? ""}
            error={fieldErrors?.primaryGoal}
            id="profile-primary-goal"
            label="Objetivo principal"
            name="primaryGoal"
            required
          >
            {TRAINING_GOAL_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </SelectField>
        </div>
      </section>

      <section
        aria-labelledby="personal-settings-title"
        className="mt-8 border-t border-[#2a2d29] pt-7"
      >
        <h2
          className="text-base font-extrabold text-white"
          id="personal-settings-title"
        >
          Datos personales
        </h2>
        <p className="mt-1 text-sm leading-6 text-[#8f948c]">
          Los campos opcionales pueden permanecer vacíos.
        </p>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <SelectField
            defaultValue={profile.preferred_weight_unit ?? "kg"}
            error={fieldErrors?.preferredWeightUnit}
            id="profile-weight-unit"
            label="Unidad preferida"
            name="preferredWeightUnit"
            required
          >
            {WEIGHT_UNIT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </SelectField>
          <SelectField
            defaultValue={profile.biological_sex ?? ""}
            error={fieldErrors?.biologicalSex}
            id="profile-biological-sex"
            label="Sexo biológico"
            name="biologicalSex"
          >
            <option value="">Sin completar</option>
            {BIOLOGICAL_SEX_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </SelectField>
          <TextField
            autoComplete="bday"
            defaultValue={profile.birth_date ?? ""}
            error={fieldErrors?.birthDate}
            id="profile-birth-date"
            label="Fecha de nacimiento"
            max={maximumBirthDate}
            min="1900-01-01"
            name="birthDate"
            type="date"
          />
          <TextField
            autoComplete="off"
            defaultValue={profile.height_cm ?? ""}
            error={fieldErrors?.heightCm}
            id="profile-height"
            inputMode="decimal"
            label="Altura (cm)"
            max="300"
            min="50"
            name="heightCm"
            step="0.1"
            type="number"
          />
          <TextField
            autoComplete="off"
            defaultValue={profile.current_weight_kg ?? ""}
            description="El modelo actual guarda este valor en kilogramos."
            error={fieldErrors?.currentWeightKg}
            id="profile-weight"
            inputMode="decimal"
            label="Peso actual (kg)"
            max="500"
            min="20"
            name="currentWeightKg"
            step="0.1"
            type="number"
          />
        </div>
      </section>

      <div className="mt-8">
        <SubmitButton
          idleLabel="Guardar cambios"
          pendingLabel="Guardando cambios..."
        />
      </div>
    </form>
  );
}
