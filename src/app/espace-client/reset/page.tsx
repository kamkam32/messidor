import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "../_components/AuthShell";
import { ResetForm } from "./ResetForm";

export const metadata: Metadata = {
  title: "Réinitialiser le mot de passe — Espace Client",
  robots: { index: false, follow: false },
};

export default function ResetPage() {
  return (
    <AuthShell
      eyebrow="Espace Client"
      title="Mot de passe oublié"
      intro="Entrez votre email pour recevoir un lien de réinitialisation."
      footer={
        <p>
          <Link href="/espace-client/connexion" className="font-semibold text-gold-deep underline underline-offset-2 hover:text-gold">
            Retour à la connexion
          </Link>
        </p>
      }
    >
      <ResetForm />
    </AuthShell>
  );
}
