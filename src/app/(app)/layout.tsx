import type { ReactNode } from "react";
import { AppShell } from "@/components/app-shell";
import { requireCompletedProfile } from "@/features/auth/server";

type PrivateLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default async function PrivateLayout({ children }: PrivateLayoutProps) {
  await requireCompletedProfile();

  return <AppShell>{children}</AppShell>;
}
