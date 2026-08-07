import Link from "next/link";
import type { ReactNode } from "react";

type AuthFrameProps = Readonly<{
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
}>;

export function AuthFrame({
  eyebrow,
  title,
  description,
  children,
  footer,
  wide = false,
}: AuthFrameProps) {
  return (
    <main className="min-h-dvh bg-[#0b0d0b] px-4 pt-[max(1.5rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:grid sm:place-items-center sm:py-10">
      <div className={`mx-auto w-full ${wide ? "max-w-2xl" : "max-w-md"}`}>
        <Link
          className="inline-flex min-h-11 items-center text-xl font-black text-white"
          href="/"
        >
          GYMBRO
        </Link>

        <section className="mt-8 rounded-lg border border-[#2a2d29] bg-[#111310] px-5 py-6 sm:px-8 sm:py-8">
          <p className="text-xs font-bold uppercase text-[#f4cf3a]">
            {eyebrow}
          </p>
          <h1 className="mt-2 text-3xl leading-tight font-black text-white">
            {title}
          </h1>
          <p className="mt-3 text-sm leading-6 text-[#a9ada6]">{description}</p>

          <div className="mt-7">{children}</div>

          {footer ? (
            <div className="mt-6 border-t border-[#2a2d29] pt-5 text-center text-sm text-[#a9ada6]">
              {footer}
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}
