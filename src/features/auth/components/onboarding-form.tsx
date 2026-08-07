"use client";

import { useActionState, useState, type FormEvent } from "react";
import { SelectField, TextField } from "@/components/ui/form-field";
import { SubmitButton } from "@/components/ui/submit-button";
import type { Profile } from "../profile";
import { INITIAL_AUTH_ACTION_STATE, type AuthFieldName } from "../action-state";
import { onboardingAction } from "../actions";
import {
  BIOLOGICAL_SEX_OPTIONS,
  TRAINING_GOAL_OPTIONS,
  TRAINING_LEVEL_OPTIONS,
  WEIGHT_UNIT_OPTIONS,
} from "../constants";
import { validateOnboardingInput } from "../validation";

type OnboardingFormProps = Readonly<{
  profile: Profile;
  next?: string;
  maximumBirthDate: string;
}>;

export function OnboardingForm({
  profile,
  next = "/",
  maximumBirthDate,
}: OnboardingFormProps) {
  const [state, formAction] = useActionState(
    onboardingAction,
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
      <input name="next" type="hidden" value={next} />

      {state.message ? (
        <p
          className="mb-6 rounded-lg border border-[#62342f] bg-[#261513] px-4 py-3 text-sm leading-6 text-[#ffb4ad]"
          role="alert"
        >
          {state.message}
        </p>
      ) : null}

      <section aria-labelledby="required-profile-title">
        <h2
          className="text-base font-extrabold text-white"
          id="required-profile-title"
        >
          Datos principales
        </h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <TextField
            autoCapitalize="none"
            autoComplete="username"
            defaultValue={profile.username ?? ""}
            description="3 a 20 caracteres: letras minúsculas, números, punto o guion bajo."
            error={fieldErrors?.username}
            id="onboarding-username"
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
            id="onboarding-display-name"
            label="Nombre visible"
            maxLength={80}
            name="displayName"
            required
            type="text"
          />
          <SelectField
            defaultValue={profile.training_level ?? ""}
            error={fieldErrors?.trainingLevel}
            id="onboarding-training-level"
            label="Nivel de entrenamiento"
            name="trainingLevel"
            required
          >
            <option disabled value="">
              Elegí tu nivel
            </option>
            {TRAINING_LEVEL_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </SelectField>
          <SelectField
            defaultValue={profile.primary_goal ?? ""}
            error={fieldErrors?.primaryGoal}
            id="onboarding-primary-goal"
            label="Objetivo principal"
            name="primaryGoal"
            required
          >
            <option disabled value="">
              Elegí tu objetivo
            </option>
            {TRAINING_GOAL_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </SelectField>
          <SelectField
            defaultValue={profile.preferred_weight_unit ?? "kg"}
            error={fieldErrors?.preferredWeightUnit}
            id="onboarding-weight-unit"
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
        </div>
      </section>

      <section
        aria-labelledby="optional-profile-title"
        className="mt-8 border-t border-[#2a2d29] pt-7"
      >
        <h2
          className="text-base font-extrabold text-white"
          id="optional-profile-title"
        >
          Datos opcionales
        </h2>
        <p className="mt-1 text-sm leading-6 text-[#8f948c]">
          Podés dejarlos vacíos y completarlos más adelante.
        </p>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <SelectField
            defaultValue={profile.biological_sex ?? ""}
            error={fieldErrors?.biologicalSex}
            id="onboarding-biological-sex"
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
            id="onboarding-birth-date"
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
            id="onboarding-height"
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
            id="onboarding-weight"
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
          idleLabel="Guardar y continuar"
          pendingLabel="Guardando perfil..."
        />
      </div>
    </form>
  );
}
