import Link from "next/link";
import { Icon, type IconName } from "./icon";

type EmptyStateProps = Readonly<{
  icon: IconName;
  title: string;
  description: string;
  action?: Readonly<{
    href: string;
    label: string;
  }>;
}>;

export function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <section className="rounded-lg border border-[#2a2d29] bg-[#151714] px-5 py-8 sm:px-8 sm:py-10">
      <div className="grid size-12 place-items-center rounded-lg border border-[#333630] bg-[#1d1f1c] text-[#d4d7d1]">
        <Icon name={icon} />
      </div>
      <h2 className="mt-6 text-xl font-extrabold text-white sm:text-2xl">
        {title}
      </h2>
      <p className="mt-2 max-w-lg text-sm leading-6 text-[#a9ada6] sm:text-base">
        {description}
      </p>
      {action ? (
        <Link
          className="mt-7 flex min-h-12 w-full items-center justify-between rounded-lg bg-[#f4cf3a] px-4 text-sm font-extrabold text-[#11120f] hover:bg-[#ffdc4f] sm:w-fit sm:min-w-52"
          href={action.href}
        >
          {action.label}
          <Icon className="size-5" name="arrow-right" />
        </Link>
      ) : null}
    </section>
  );
}
