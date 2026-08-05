import Link from "next/link";
import type { ReactNode } from "react";
import { AppNavigation } from "./app-navigation";

type AppShellProps = Readonly<{
  children: ReactNode;
}>;

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-dvh bg-[#0b0d0b] lg:grid lg:grid-cols-[15rem_minmax(0,1fr)]">
      <a
        className="fixed top-3 left-3 z-[60] -translate-y-20 rounded-md bg-[#f4cf3a] px-4 py-3 text-sm font-bold text-[#11120f] focus:translate-y-0"
        href="#main-content"
      >
        Saltar al contenido
      </a>

      <AppNavigation />

      <div className="min-w-0">
        <header className="sticky top-0 z-40 border-b border-[#242623] bg-[#0b0d0b]/95 pt-[env(safe-area-inset-top)] backdrop-blur-sm lg:hidden">
          <div className="flex h-16 items-center px-4">
            <Link className="text-lg font-black text-white" href="/">
              GYMBRO
            </Link>
          </div>
        </header>

        <main
          className="min-h-dvh min-w-0 pb-[calc(5rem+env(safe-area-inset-bottom))] lg:pb-0"
          id="main-content"
          tabIndex={-1}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
