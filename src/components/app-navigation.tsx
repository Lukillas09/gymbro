"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "@/components/ui/icon";

type NavigationItem = Readonly<{
  href: string;
  label: string;
  icon: IconName;
  primary?: boolean;
}>;

const navigationItems = [
  { href: "/", label: "Inicio", icon: "home" },
  { href: "/routines", label: "Rutinas", icon: "routines" },
  { href: "/workout", label: "Entrenar", icon: "workout", primary: true },
  { href: "/progress", label: "Progreso", icon: "progress" },
  { href: "/profile", label: "Perfil", icon: "profile" },
] satisfies readonly NavigationItem[];

function isCurrentPath(pathname: string, href: string) {
  if (href === "/progress" && pathname.startsWith("/history")) return true;
  return href === "/"
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);
}

export function AppNavigation() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navegación principal"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-[#2a2d29] bg-[#101210]/95 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur-sm lg:sticky lg:top-0 lg:h-dvh lg:border-t-0 lg:border-r lg:bg-[#101210] lg:pb-0"
    >
      <div className="hidden h-20 items-center border-b border-[#242623] px-6 lg:flex">
        <Link className="text-xl font-black text-white" href="/">
          GYMBRO
        </Link>
      </div>

      <div className="mx-auto grid h-[4.5rem] w-full max-w-lg grid-cols-5 px-2 pt-2 lg:mx-0 lg:flex lg:h-auto lg:max-w-none lg:flex-col lg:gap-1 lg:px-4 lg:py-5">
        {navigationItems.map((item) => {
          const isActive = isCurrentPath(pathname, item.href);
          const navigationStyles = isActive
            ? "bg-[#20221f] text-white"
            : "text-[#8f948c] hover:bg-[#1a1c19] hover:text-white";
          const iconStyles = item.primary
            ? "bg-[#f4cf3a] text-[#11120f] lg:bg-[#292b26] lg:text-[#f4cf3a] lg:ring-1 lg:ring-[#4a4731]"
            : isActive
              ? "text-[#f4cf3a]"
              : "";

          return (
            <Link
              aria-current={isActive ? "page" : undefined}
              className={`relative flex min-w-0 flex-col items-center justify-center gap-1 rounded-lg px-1 text-[0.6875rem] font-bold ${navigationStyles} lg:min-h-12 lg:flex-row lg:justify-start lg:gap-3 lg:px-3 lg:text-sm`}
              data-navigation-state={isActive ? "active" : "inactive"}
              data-primary-action={item.primary ? "true" : undefined}
              href={item.href}
              key={item.href}
            >
              {isActive ? (
                <span
                  aria-hidden="true"
                  className="absolute inset-x-3 top-0 h-0.5 rounded-full bg-[#f4cf3a] lg:inset-y-2 lg:left-0 lg:right-auto lg:h-auto lg:w-0.5"
                  data-active-indicator="true"
                />
              ) : null}
              <span
                className={`grid size-8 place-items-center rounded-md ${iconStyles}`}
              >
                <Icon className="size-5" name={item.icon} />
              </span>
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
