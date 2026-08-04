"use client";

import { useMemo, useState } from "react";
import { formatMAD, formatPct } from "@/lib/format";
import { Field, NumberField, IntField, SelectField, Panel, Stat, Note, SimGrid } from "./ui";

/* Coefficients de réévaluation (approximatifs, fixés chaque année par arrêté).
   Portés à l'identique du code d'origine. */
const COEFFS: Record<number, number> = {
  2024: 1.0, 2023: 1.014, 2022: 1.035, 2021: 1.048,
  2020: 1.055, 2019: 1.063, 2018: 1.075, 2017: 1.087,
  2016: 1.104, 2015: 1.12, 2014: 1.125, 2013: 1.145,
  2012: 1.16, 2011: 1.17, 2010: 1.18, 2009: 1.19,
  2008: 1.205, 2007: 1.225, 2006: 1.26, 2005: 1.275,
  2004: 1.295, 2003: 1.31, 2002: 1.325, 2001: 1.345,
  2000: 1.36,
};

function getCoeff(annee: number): number {
  if (annee >= 2024) return 1.0;
  if (annee < 2000) return 1.36 + (2000 - annee) * 0.03;
  return COEFFS[annee] ?? 1.0;
}

export function PlusValueTpiCalc() {
  const [prixAchat, setPrixAchat] = useState(1000000);
  const [anneeAchat, setAnneeAchat] = useState(2019);
  const [prixVente, setPrixVente] = useState(1500000);
  const [travaux, setTravaux] = useState(0);
  const [interetsBancaires, setInteretsBancaires] = useState(0);
  const [fraisCession, setFraisCession] = useState(0);
  const [estResidencePrincipale, setEstResidencePrincipale] = useState("non");

  const dureeDetention = 2025 - anneeAchat;

  const res = useMemo(() => {
    const prixBase = prixAchat;

    // Forfait frais d'acquisition : 15% du prix d'achat
    const forfaitFraisAcquisition = prixBase * 0.15;
    const fraisAcquisitionRetenus = forfaitFraisAcquisition; // forfait (pas de frais réels supérieurs saisis)

    // Coefficient de réévaluation
    const coeff = getCoeff(anneeAchat);

    // Prix de revient (base + frais + travaux + intérêts) puis réévalué
    const prixRevientBase = prixBase + fraisAcquisitionRetenus + travaux + interetsBancaires;
    const prixRevientReevalue = prixRevientBase * coeff;

    // Plus-value brute
    const plusValueBrute = prixVente - fraisCession - prixRevientReevalue;

    // Abattement durée de détention : 3%/an au-delà de 5 ans, plafonné à 20%
    let tauxAbattement = 0;
    if (dureeDetention > 5) {
      tauxAbattement = Math.min((dureeDetention - 5) * 0.03, 0.2);
    }
    const abattement = Math.max(0, plusValueBrute) * tauxAbattement;
    const plusValueImposable = Math.max(0, plusValueBrute - abattement);

    // TPI = 20% de la plus-value imposable
    const tpiCalculee = plusValueImposable * 0.2;

    // Cotisation minimale : 3% du prix de vente (due même sans plus-value)
    const cotisationMinimale = prixVente * 0.03;

    // Exonération résidence principale (6+ ans)
    let exonere = false;
    let tpiExoneration = 0;
    let messageExoneration = "";
    if (estResidencePrincipale === "oui" && dureeDetention >= 6) {
      if (prixVente <= 4000000) {
        exonere = true;
        messageExoneration =
          "Exonération totale : résidence principale occupée 6 ans et plus, prix de vente ≤ 4 000 000 MAD.";
      } else {
        tpiExoneration = (prixVente - 4000000) * 0.03;
        messageExoneration = `Exonération partielle : 3 % sur la fraction du prix excédant 4 000 000 MAD (${formatMAD(
          prixVente - 4000000,
          0,
        )}).`;
      }
    }

    // Impôt final
    let impotFinal = 0;
    let estCotisationMinimale = false;
    if (exonere) {
      impotFinal = 0;
    } else if (tpiExoneration > 0) {
      impotFinal = tpiExoneration;
    } else if (tpiCalculee < cotisationMinimale) {
      impotFinal = cotisationMinimale;
      estCotisationMinimale = true;
    } else {
      impotFinal = tpiCalculee;
    }

    const netVendeur = prixVente - fraisCession - impotFinal;
    const tauxEffectif = prixVente > 0 ? (impotFinal / prixVente) * 100 : 0;

    return {
      coeff,
      forfaitFraisAcquisition,
      prixRevientReevalue,
      plusValueBrute,
      tauxAbattement,
      abattement,
      plusValueImposable,
      tpiCalculee,
      cotisationMinimale,
      impotFinal,
      estCotisationMinimale,
      exonere,
      tpiExoneration,
      messageExoneration,
      netVendeur,
      tauxEffectif,
    };
  }, [
    prixAchat,
    anneeAchat,
    prixVente,
    travaux,
    interetsBancaires,
    fraisCession,
    estResidencePrincipale,
    dureeDetention,
  ]);

  return (
    <SimGrid>
      {/* Formulaire */}
      <Panel title="Le bien à vendre">
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Prix d'achat">
              <NumberField
                value={prixAchat}
                onChange={setPrixAchat}
                step={50000}
                max={500000000}
                placeholder="1 000 000"
              />
            </Field>
            <Field label="Année d'achat" hint={`Détention : ${dureeDetention} an(s)`}>
              <IntField value={anneeAchat} onChange={setAnneeAchat} min={1970} max={2024} />
            </Field>
          </div>

          <Field label="Prix de vente">
            <NumberField
              value={prixVente}
              onChange={setPrixVente}
              step={50000}
              max={500000000}
              placeholder="1 500 000"
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Travaux / améliorations" hint="Justifiés par factures">
              <NumberField value={travaux} onChange={setTravaux} step={10000} />
            </Field>
            <Field label="Intérêts d'emprunt" hint="Sur la période de détention">
              <NumberField
                value={interetsBancaires}
                onChange={setInteretsBancaires}
                step={10000}
              />
            </Field>
          </div>

          <Field label="Frais de cession" hint="Commissions, frais liés à la vente">
            <NumberField value={fraisCession} onChange={setFraisCession} step={5000} />
          </Field>

          <Field
            label="Résidence principale ?"
            hint="Exonération si occupée 6 ans et plus et prix ≤ 4 M MAD"
          >
            <SelectField
              value={estResidencePrincipale}
              onChange={setEstResidencePrincipale}
              options={[
                { value: "non", label: "Non" },
                { value: "oui", label: "Oui (occupée 6 ans et plus)" },
              ]}
            />
          </Field>
        </div>
      </Panel>

      {/* Résultats */}
      <div className="space-y-6">
        <Panel title="Estimation de la TPI">
          {res.exonere ? (
            <div className="border border-success/30 bg-success/10 p-5 text-sm text-success">
              {res.messageExoneration}
            </div>
          ) : (
            <>
              <div className="border border-navy/20 bg-navy p-6 text-cream">
                <div className="text-xs uppercase tracking-[0.08em] text-cream/60">
                  TPI à payer
                </div>
                <div className="mt-1 font-display text-4xl text-gold-light">
                  {formatMAD(res.impotFinal, 0)}
                </div>
                <div className="mt-1 text-sm text-cream/70">
                  {res.estCotisationMinimale
                    ? "Cotisation minimale (3 % du prix de vente) appliquée"
                    : res.tpiExoneration > 0
                      ? "Exonération partielle appliquée"
                      : `Soit ${formatPct(res.tauxEffectif, false)} du prix de vente`}
                </div>
              </div>
              {res.messageExoneration && (
                <div className="mt-4">
                  <Note>{res.messageExoneration}</Note>
                </div>
              )}
            </>
          )}

          <div className="my-6 border-t border-slate" />

          <div className="space-y-3 text-sm">
            <Row
              label={`Coefficient de réévaluation (${anneeAchat})`}
              value={"× " + res.coeff.toFixed(3)}
            />
            <Row
              label="Forfait frais d'acquisition (15 %)"
              value={formatMAD(res.forfaitFraisAcquisition, 0)}
            />
            <Row
              label="Prix de revient réévalué"
              value={formatMAD(res.prixRevientReevalue, 0)}
            />
            <Row
              label="Plus-value brute"
              value={formatMAD(Math.max(0, res.plusValueBrute), 0)}
            />
            <Row
              label={`Abattement durée (${(res.tauxAbattement * 100).toFixed(0)} %)`}
              value={"-" + formatMAD(res.abattement, 0)}
            />
            <Row
              label="Plus-value imposable"
              value={formatMAD(res.plusValueImposable, 0)}
              strong
            />
            <Row label="TPI 20 %" value={formatMAD(res.tpiCalculee, 0)} />
            <Row
              label="Cotisation minimale 3 %"
              value={formatMAD(res.cotisationMinimale, 0)}
            />
          </div>

          <div className="my-6 border-t border-slate" />

          <Stat
            label="Net encaissé par le vendeur"
            value={formatMAD(res.netVendeur, 0)}
            accent="success"
          />
        </Panel>

        <Note>
          La TPI est le maximum entre 20 % de la plus-value imposable et 3 % du prix de vente
          (cotisation minimale). Coefficients de réévaluation indicatifs — les valeurs
          officielles sont fixées annuellement par arrêté.
        </Note>
      </div>
    </SimGrid>
  );
}

function Row({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span className="text-navy-soft">{label}</span>
      <span
        className={
          "tabular-nums " + (strong ? "font-semibold text-navy" : "text-navy-soft")
        }
      >
        {value}
      </span>
    </div>
  );
}
