export type IconName =
  "home" | "routines" | "workout" | "progress" | "profile" | "arrow-right";

type IconProps = Readonly<{
  name: IconName;
  className?: string;
}>;

function IconPaths({ name }: Readonly<{ name: IconName }>) {
  switch (name) {
    case "home":
      return (
        <>
          <path d="m3 10 9-7 9 7" />
          <path d="M5 9v11h14V9" />
          <path d="M9 20v-6h6v6" />
        </>
      );
    case "routines":
      return (
        <>
          <rect width="14" height="18" x="5" y="3" rx="2" />
          <path d="M9 7h6" />
          <path d="M9 11h6" />
          <path d="M9 15h4" />
        </>
      );
    case "workout":
      return (
        <>
          <path d="m6.5 6.5 11 11" />
          <path d="m21 21-1.5-1.5" />
          <path d="M4.5 4.5 3 3" />
          <path d="m18 22 4-4" />
          <path d="m2 6 4-4" />
          <path d="m3 10 7-7" />
          <path d="m14 21 7-7" />
        </>
      );
    case "progress":
      return (
        <>
          <path d="M4 19V9" />
          <path d="M10 19V5" />
          <path d="M16 19v-7" />
          <path d="M22 19V3" />
          <path d="M2 19h22" />
        </>
      );
    case "profile":
      return (
        <>
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21a8 8 0 0 1 16 0" />
        </>
      );
    case "arrow-right":
      return (
        <>
          <path d="M5 12h14" />
          <path d="m13 6 6 6-6 6" />
        </>
      );
  }
}

export function Icon({ name, className = "size-6" }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      focusable="false"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      <IconPaths name={name} />
    </svg>
  );
}
