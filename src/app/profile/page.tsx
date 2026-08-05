import type { Metadata } from "next";
import { EmptyState } from "@/components/ui/empty-state";
import { PageShell } from "@/components/ui/page-shell";

export const metadata: Metadata = {
  title: "Perfil",
};

export default function ProfilePage() {
  return (
    <PageShell
      description="La información básica de tu cuenta va a vivir acá."
      eyebrow="Cuenta"
      title="Perfil"
    >
      <EmptyState
        description="El perfil estará disponible cuando se implemente el acceso a la cuenta."
        icon="profile"
        title="Perfil sin configurar"
      />
    </PageShell>
  );
}
