import type { ReactNode } from "react";

type PageShellProps = Readonly<{
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}>;

export function PageShell({
  eyebrow,
  title,
  description,
  children,
}: PageShellProps) {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-7 sm:px-6 sm:py-9 lg:px-10 lg:py-12">
      <header className="max-w-2xl">
        <p className="text-xs font-bold uppercase text-[#8f948c]">{eyebrow}</p>
        <h1 className="mt-2 text-3xl leading-tight font-black text-white sm:text-4xl">
          {title}
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-[#a9ada6] sm:text-base">
          {description}
        </p>
      </header>

      <div className="mt-8 sm:mt-10">{children}</div>
    </div>
  );
}
