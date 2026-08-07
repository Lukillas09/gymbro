import type { Metadata } from "next";
import Link from "next/link";
import { AuthFrame } from "@/features/auth/components/auth-frame";
import { RegisterForm } from "@/features/auth/components/register-form";

export const metadata: Metadata = {
  title: "Crear cuenta",
};

export default function RegisterPage() {
  return (
    <AuthFrame
      description="Creá tu acceso para guardar rutinas y entrenamientos de forma privada."
      eyebrow="Empezar"
      footer={
        <p>
          ¿Ya tenés una cuenta?{" "}
          <Link
            className="font-bold text-[#f4cf3a] hover:text-[#ffdc4f]"
            href="/login"
          >
            Iniciar sesión
          </Link>
        </p>
      }
      title="Tu cuenta GymBro"
    >
      <RegisterForm />
    </AuthFrame>
  );
}
