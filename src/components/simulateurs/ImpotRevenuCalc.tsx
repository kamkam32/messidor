"use client";

import { useMemo, useState } from "react";
import { formatMAD, formatPct } from "@/lib/format";
import { Field, NumberField, Panel, Stat, Note, SimGrid } from "./ui";

/* Barème IR Maroc 2025 (marginal par tranches).
   0% ≤ 40 000 · 10% 40 001–60 000 · 20% 60 001–80 000 · 34% 80 001–180 000 · 37% > 180 000 */
function calculerIR(revenuImposable: number): number {
  const r = revenuImposable;
  if (r <= 40000) return 0;
  if (r <= 60000) return (r - 40000) * 0.1;
  if (r <= 80000) return 20000 * 0.1 + (r - 60000) * 0.2;
  if (r <= 180000) return 20000 * 0.1 + 20000 * 0.2 + (r - 80000) * 0.34;
  return 20000 * 0.1 + 20000 * 0.2 + 100000 * 0.34 + (r - 180000) * 0.37;
}

function tauxMarginal(r: number): string {
  if (r <= 40000) return "0 %";
  if (r <= 60000) return "10 %";
  if (r <= 80000) return "20 %";
  if (r <= 180000) return "34 %";
  return "37 %";
}

export function ImpotRevenuCalc() {
  const [revenuAnnuel, setRevenuAnnuel] = useState(200000);
  const [deductionsFamiliales, setDeductionsFamiliales] = useState(0);
  const [deductionsProfessionnelles, setDeductionsProfessionnelles] = useState(0);
  const [autresDeductions, setAutresDeductions] = useState(0);

  const res = useMemo(() => {
    const totalDeductions =
      deductionsFamiliales + deductionsProfessionnelles + autresDeductions;
    const revenuImposable = Math.max(0, revenuAnnuel - totalDeductions);
    const impotDu = calculerIR(revenuImposable);
    const impotSansDeductions = calculerIR(revenuAnnuel);
    const economie = impotSansDeductions - impotDu;
    const tauxEffectif = revenuAnnuel > 0 ? (impotDu / revenuAnnuel) * 100 : 0;
    const revenuNet = revenuAnnuel - impotDu;
    return {
      totalDeductions,
      revenuImposable,
      impotDu,
      economie,
      tauxEffectif,
      revenuNet,
    };
  }, [revenuAnnuel, deductionsFamiliales, deductionsProfessionnelles, autresDeductions]);

  return (
    <SimGrid>
      {/* Formulaire */}
      <Panel title="Votre situation">
        <div className="space-y-5">
          <Field label="Revenu annuel brut">
            <NumberField
              value={revenuAnnuel}
              onChange={setRevenuAnnuel}
              step={10000}
              max={10000000}
              placeholder="200 000"
            />
          </Field>
          <Field
            label="Déductions familiales"
            hint="360 MAD/an par personne à charge (plafond 2 160 MAD)"
          >
            <NumberField
              value={deductionsFamiliales}
              onChange={setDeductionsFamiliales}
              step={360}
              max={revenuAnnuel}
            />
          </Field>
          <Field
            label="Déductions professionnelles"
            hint="Frais réels justifiés ou forfait de 20% (plafond 30 000 MAD)"
          >
            <NumberField
              value={deductionsProfessionnelles}
              onChange={setDeductionsProfessionnelles}
              step={1000}
              max={revenuAnnuel}
            />
          </Field>
          <Field
            label="Autres déductions"
            hint="Cotisations CNSS, retraite complémentaire, intérêts de prêt logement…"
          >
            <NumberField
              value={autresDeductions}
              onChange={setAutresDeductions}
              step={1000}
              max={revenuAnnuel}
            />
          </Field>
        </div>

        <div className="mt-6">
          <Note>
            Barème IR Maroc 2025 : 0 % jusqu&apos;à 40 000 MAD, 10 % de 40 001 à 60 000, 20 %
            de 60 001 à 80 000, 34 % de 80 001 à 180 000, 37 % au-delà de 180 000 MAD.
          </Note>
        </div>
      </Panel>

      {/* Résultats */}
      <div className="space-y-6">
        <Panel title="Votre impôt sur le revenu">
          <div className="grid grid-cols-2 gap-6">
            <Stat label="Revenu brut" value={formatMAD(revenuAnnuel, 0)} />
            <Stat
              label="Déductions"
              value={"-" + formatMAD(res.totalDeductions, 0)}
              accent="gold"
            />
          </div>

          <div className="my-6 border-t border-slate" />

          <div className="grid grid-cols-2 gap-6">
            <Stat label="Revenu imposable" value={formatMAD(res.revenuImposable, 0)} />
            <Stat
              label="Taux marginal"
              value={tauxMarginal(res.revenuImposable)}
              accent="navy"
            />
          </div>

          <div className="my-6 border-t border-slate" />

          <div className="border border-navy/20 bg-navy p-6 text-cream">
            <div className="text-xs uppercase tracking-[0.08em] text-cream/60">
              Impôt dû (IR)
            </div>
            <div className="mt-1 font-display text-4xl text-gold-light">
              {formatMAD(res.impotDu, 0)}
            </div>
            <div className="mt-1 text-sm text-cream/70">
              Taux effectif : {formatPct(res.tauxEffectif, false)}
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-6">
            <Stat
              label="Revenu net annuel"
              value={formatMAD(res.revenuNet, 0)}
              accent="success"
              hint={`Soit ${formatMAD(res.revenuNet / 12, 0)} / mois`}
            />
            {res.economie > 0 && (
              <Stat
                label="Économie fiscale"
                value={formatMAD(res.economie, 0)}
                accent="success"
                hint="Grâce aux déductions"
              />
            )}
          </div>
        </Panel>

        <Note>
          Estimation indicative fondée sur le barème 2025. Le calcul réel peut varier selon
          votre situation (retenue à la source, régime professionnel, revenus fonciers…).
        </Note>
      </div>
    </SimGrid>
  );
}
