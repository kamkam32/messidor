import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "../_components/AuthShell";
import { SignupForm } from "./SignupForm";

export const metadata: Metadata = {
  title: "Inscription — Espace Client",
  robots: { index: false, follow: false },
};

export default function InscriptionPage() {
  return (
    <AuthShell
      eyebrow="Espace Client"
      title="Créer un compte"
      intro="Ouvrez votre espace pour suivre vos analyses et vos simulations."
      footer={
        <p>
          Déjà inscrit ?{" "}
          <Link href="/espace-client/connexion" className="font-semibold text-gold-deep underline underline-offset-2 hover:text-gold">
            Se connecter
          </Link>
        </p>
      }
    >
      <SignupForm />
    </AuthShell>
  );
}
