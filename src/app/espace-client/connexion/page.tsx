import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { AuthShell } from "../_components/AuthShell";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Connexion — Espace Client",
  robots: { index: false, follow: false },
};

export default function ConnexionPage() {
  return (
    <AuthShell
      eyebrow="Espace Client"
      title="Bienvenue"
      intro="Connectez-vous pour accéder à votre espace Messidor Patrimoine."
      footer={
        <p>
          Pas encore de compte ?{" "}
          <Link href="/espace-client/inscription" className="font-semibold text-gold-deep underline underline-offset-2 hover:text-gold">
            Créer un compte
          </Link>
        </p>
      }
    >
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
