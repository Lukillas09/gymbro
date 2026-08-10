"use client";

import { useFormStatus } from "react-dom";

type SubmitButtonProps = Readonly<{
  idleLabel: string;
  pendingLabel: string;
  disabled?: boolean;
}>;

export function SubmitButton({
  idleLabel,
  pendingLabel,
  disabled = false,
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      className="flex min-h-12 w-full items-center justify-center rounded-lg bg-[#f4cf3a] px-4 text-sm font-extrabold text-[#11120f] hover:bg-[#ffdc4f] disabled:cursor-wait disabled:bg-[#91812f]"
      disabled={pending || disabled}
      type="submit"
    >
      {pending ? pendingLabel : idleLabel}
    </button>
  );
}
