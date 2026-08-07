import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
} from "react";

type FieldChromeProps = Readonly<{
  id: string;
  label: string;
  description?: string;
  error?: string;
  children: ReactNode;
}>;

function FieldChrome({
  id,
  label,
  description,
  error,
  children,
}: FieldChromeProps) {
  const descriptionId = description ? `${id}-description` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div>
      <label className="block text-sm font-bold text-[#e7e9e4]" htmlFor={id}>
        {label}
      </label>
      {description ? (
        <p className="mt-1 text-xs leading-5 text-[#8f948c]" id={descriptionId}>
          {description}
        </p>
      ) : null}
      <div className="mt-2">{children}</div>
      {error ? (
        <p
          className="mt-2 text-sm leading-5 text-[#ff9b91]"
          id={errorId}
          role="alert"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}

type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "id"> &
  Readonly<{
    id: string;
    label: string;
    description?: string;
    error?: string;
  }>;

export function TextField({
  id,
  label,
  description,
  error,
  className,
  ...props
}: TextFieldProps) {
  const describedBy = [
    description ? `${id}-description` : null,
    error ? `${id}-error` : null,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <FieldChrome description={description} error={error} id={id} label={label}>
      <input
        {...props}
        aria-describedby={describedBy || undefined}
        aria-invalid={Boolean(error)}
        className={`min-h-12 w-full rounded-lg border bg-[#0d0f0d] px-3.5 text-base text-white placeholder:text-[#686d65] ${
          error ? "border-[#b94c43]" : "border-[#353832]"
        } focus:border-[#f4cf3a] ${className ?? ""}`}
        id={id}
      />
    </FieldChrome>
  );
}

type SelectFieldProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "id"> &
  Readonly<{
    id: string;
    label: string;
    description?: string;
    error?: string;
    children: ReactNode;
  }>;

export function SelectField({
  id,
  label,
  description,
  error,
  className,
  children,
  ...props
}: SelectFieldProps) {
  const describedBy = [
    description ? `${id}-description` : null,
    error ? `${id}-error` : null,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <FieldChrome description={description} error={error} id={id} label={label}>
      <select
        {...props}
        aria-describedby={describedBy || undefined}
        aria-invalid={Boolean(error)}
        className={`min-h-12 w-full rounded-lg border bg-[#0d0f0d] px-3.5 text-base text-white ${
          error ? "border-[#b94c43]" : "border-[#353832]"
        } focus:border-[#f4cf3a] ${className ?? ""}`}
        id={id}
      >
        {children}
      </select>
    </FieldChrome>
  );
}
