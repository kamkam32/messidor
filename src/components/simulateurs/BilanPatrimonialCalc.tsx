"use client";

import { useMemo, useState } from "react";
import { formatMAD } from "@/lib/format";
import { Field, NumberField, Panel, Stat, Note, SimGrid } from "./ui";

export function BilanPatrimonialCalc() {
  const [liquidites, setLiquidites] = useState(50000);
  const [placements, setPlacements] = useState(200000);
  const [immobilier, setImmobilier] = useState(1500000);
  const [autresActifs, setAutresActifs] = useState(100000);
  const [creditImmo, setCreditImmo] = useState(800000);
  const [autresCredit, setAutresCredit] = useState(50000);

  const res = useMemo(() => {
    const totalActifs = liquidites + placements + immobilier + autresActifs;
    const totalPassifs = creditImmo + autresCredit;
    const patrimoineNet = totalActifs - totalPassifs;
    const ratioEndettement = totalActifs > 0 ? (totalPassifs / totalActifs) * 100 : 0;
    const repartition = [
      { label: "Liquidités", value: liquidites },
      { label: "Placements financiers", value: placements },
      { label: "Immobilier", value: immobilier },
      { label: "Autres actifs", value: autresActifs },
    ];
    return { totalActifs, totalPassifs, patrimoineNet, ratioEndettement, repartition };
  }, [liquidites, placements, immobilier, autresActifs, creditImmo, autresCredit]);

  return (
    <SimGrid>
      {/* Formulaire */}
      <div className="space-y-6">
        <Panel title="Actifs">
          <div className="space-y-5">
            <Field label="Liquidités (comptes, livrets)">
              <NumberField value={liquidites} onChange={setLiquidites} step={5000} />
            </Field>
            <Field label="Placements financiers (OPCVM, actions…)">
              <NumberField value={placements} onChange={setPlacements} step={10000} />
            </Field>
            <Field label="Immobilier (valeur actuelle)">
              <NumberField value={immobilier} onChange={setImmobilier} step={50000} />
            </Field>
            <Field label="Autres actifs">
              <NumberField value={autresActifs} onChange={setAutresActifs} step={10000} />
            </Field>
          </div>
        </Panel>

        <Panel title="Passifs">
          <div className="space-y-5">
            <Field label="Crédit immobilier (capital restant dû)">
              <NumberField value={creditImmo} onChange={setCreditImmo} step={10000} />
            </Field>
            <Field label="Autres crédits">
              <NumberField value={autresCredit} onChange={setAutresCredit} step={5000} />
            </Field>
          </div>
        </Panel>
      </div>

      {/* Résultats */}
      <div className="space-y-6">
        <Panel title="Synthèse patrimoniale">
          <div className="border border-navy/20 bg-navy p-6 text-cream">
            <div className="text-xs uppercase tracking-[0.08em] text-cream/60">
              Patrimoine net
            </div>
            <div className="mt-1 font-display text-4xl text-gold-light">
              {formatMAD(res.patrimoineNet, 0)}
            </div>
          </div>

          <div className="my-6 grid grid-cols-2 gap-6">
            <Stat label="Total actifs" value={formatMAD(res.totalActifs, 0)} accent="navy" />
            <Stat label="Total passifs" value={formatMAD(res.totalPassifs, 0)} accent="danger" />
          </div>

          <div className="border-t border-slate pt-6">
            <Stat
              label="Ratio d'endettement"
              value={res.ratioEndettement.toFixed(1) + " %"}
              accent={res.ratioEndettement > 50 ? "danger" : "success"}
              hint={
                res.ratioEndettement > 50
                  ? "Niveau d'endettement élevé"
                  : "Niveau d'endettement sain"
              }
            />
          </div>
        </Panel>

        <Panel title="Répartition des actifs">
          <div className="space-y-3">
            {res.repartition.map((r) => {
              const pct = res.totalActifs > 0 ? (r.value / res.totalActifs) * 100 : 0;
              return (
                <div key={r.label}>
                  <div className="flex items-baseline justify-between text-sm">
                    <span className="text-navy-soft">{r.label}</span>
                    <span className="tabular-nums text-navy">
                      {formatMAD(r.value, 0)}{" "}
                      <span className="text-navy-mute">({pct.toFixed(1)} %)</span>
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 w-full bg-cream-dark">
                    <div className="h-full bg-gold" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>

        <Note>
          Un bilan patrimonial complet intègre aussi la fiscalité latente, la prévoyance et la
          transmission. Ces chiffres constituent un point de départ pour bâtir votre stratégie.
        </Note>
      </div>
    </SimGrid>
  );
}
