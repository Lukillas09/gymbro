import type { Metadata } from "next";
import { ProfileIdentity } from "@/features/profile/components/profile-identity";
import { getProfileIdentity } from "@/features/profile/queries";

export const metadata: Metadata = {
  title: "Perfil",
};

export default async function ProfilePage() {
  const model = await getProfileIdentity();
  return <ProfileIdentity model={model} />;
}
