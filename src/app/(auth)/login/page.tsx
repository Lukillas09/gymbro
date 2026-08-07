import type { Metadata } from "next";
import Link from "next/link";
import { AuthFrame } from "@/features/auth/components/auth-frame";
import { LoginForm } from "@/features/auth/components/login-form";
import { resolveSafeRedirect } from "@/features/auth/redirects";

export const metadata: Metadata = {
  title: "Iniciar sesión",
};

type LoginPageProps = Readonly<{
  searchParams: Promise<{
    next?: string | string[];
    authError?: string | string[];
  }>;
}>;

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const nextValue = Array.isArray(params.next) ? params.next[0] : params.next;
  const authError = Array.isArray(params.authError)
    ? params.authError[0]
    : params.authError;
  const message =
    authError === "confirmation"
      ? "El enlace de confirmación no es válido o ya venció."
      : undefined;

  return (
    <AuthFrame
      description="Entrá para continuar con tu rutina y tus entrenamientos."
      eyebrow="Tu cuenta"
      footer={
        <p>
          ¿Todavía no tenés cuenta?{" "}
          <Link
            className="font-bold text-[#f4cf3a] hover:text-[#ffdc4f]"
            href="/register"
          >
            Crear cuenta
          </Link>
        </p>
      }
      title="Volvé a entrenar"
    >
      <LoginForm message={message} next={resolveSafeRedirect(nextValue)} />
    </AuthFrame>
  );
}
