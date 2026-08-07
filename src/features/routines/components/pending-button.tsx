"use client";

import { useFormStatus } from "react-dom";

type PendingButtonProps = Readonly<{
  idleLabel: string;
  pendingLabel: string;
  variant?: "primary" | "secondary" | "danger" | "icon";
  disabled?: boolean;
  title?: string;
  visualLabel?: string;
}>;

const variantClasses = {
  primary:
    "min-h-12 bg-[#f4cf3a] px-4 text-[#11120f] hover:bg-[#ffdc4f] disabled:bg-[#91812f]",
  secondary:
    "min-h-11 border border-[#3a3d37] bg-[#171916] px-3 text-white hover:border-[#666b61] disabled:text-[#73776f]",
  danger:
    "min-h-11 border border-[#673a35] bg-[#241615] px-3 text-[#ffb4ad] hover:border-[#a05249] disabled:text-[#805f5b]",
  icon: "size-11 border border-[#3a3d37] bg-[#171916] text-white hover:border-[#f4cf3a] disabled:text-[#666b63]",
} as const;

export function PendingButton({
  idleLabel,
  pendingLabel,
  variant = "secondary",
  disabled = false,
  title,
  visualLabel,
}: PendingButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      aria-label={variant === "icon" ? idleLabel : undefined}
      className={`inline-flex shrink-0 items-center justify-center rounded-md text-sm font-extrabold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f4cf3a] disabled:cursor-not-allowed ${variantClasses[variant]}`}
      disabled={disabled || pending}
      title={title ?? (variant === "icon" ? idleLabel : undefined)}
      type="submit"
    >
      {pending ? pendingLabel : (visualLabel ?? idleLabel)}
    </button>
  );
}
