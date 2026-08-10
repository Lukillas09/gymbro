"use client";

import { useFormStatus } from "react-dom";

type ConfirmActionButtonProps = Readonly<{
  confirmation: string;
  idleLabel: string;
  pendingLabel: string;
}>;

export function ConfirmActionButton({
  confirmation,
  idleLabel,
  pendingLabel,
}: ConfirmActionButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      className="inline-flex min-h-11 items-center justify-center rounded-md border border-[#673a35] bg-[#241615] px-3 text-sm font-extrabold text-[#ffb4ad] hover:border-[#a05249] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f4cf3a] disabled:cursor-wait disabled:text-[#805f5b]"
      disabled={pending}
      onClick={(event) => {
        if (!window.confirm(confirmation)) event.preventDefault();
      }}
      type="submit"
    >
      {pending ? pendingLabel : idleLabel}
    </button>
  );
}
