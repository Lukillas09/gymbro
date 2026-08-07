import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { isProfileComplete } from "@/features/auth/profile";
import { getAuthContext } from "@/features/auth/server";

type AuthLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default async function AuthLayout({ children }: AuthLayoutProps) {
  const context = await getAuthContext();

  if (context) {
    redirect(isProfileComplete(context.profile) ? "/" : "/onboarding");
  }

  return children;
}
