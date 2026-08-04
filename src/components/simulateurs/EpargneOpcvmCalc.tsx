"use client";

import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { formatMAD, formatPct } from "@/lib/format";
import { Field, NumberField, IntField, SelectField, Panel, Stat, Note, SimGrid } from "./ui";

/* Fiscalité Maroc 2025 */
const FISCALITE = {
  plusValuesBoursieres: 0.15,
  interetsBancaires: 0.2,
};

type TypeInvest = "livret" | "obligations" | "opcvm" | "actions" | "mixte";

const PLACEMENTS: Record<TypeInvest, { taux: number; fiscal: number; label: string }> = {
  livret: { taux: 2.5, fiscal: FISCALITE.interetsBancaires, label: "Compte sur livret (2,5 %)" },
  obligations: { taux: 4.5, fiscal: FISCALITE.interetsBancaires, label: "Obligations (4,5 %)" },
  opcvm: { taux: 6.5, fiscal: FISCALITE.plusValuesBoursieres, label: "OPCVM équilibré (6,5 %)" },
  actions: { taux: 8.5, fiscal: FISCALITE.plusValuesBoursieres, label: "Actions (8,5 %)" },
  mixte: { taux: 5.5, fiscal: FISCALITE.plusValuesBoursieres, label: "Portefeuille mixte (5,5 %)" },
};

export function EpargneOpcvmCalc() {
  const [montantInitial, setMontantInitial] = useState(100000);
  const [epargneMensuelle, setEpargneMensuelle] = useState(2000);
  const [duree, setDuree] = useState(10);
  const [type, setType] = useState<TypeInvest>("mixte");

  const res = useMemo(() => {
    const { taux: tauxAnnuel, fiscal } = PLACEMENTS[type];
    const taux = tauxAnnuel / 100;

    const evolution: { annee: number; capital: number; impot: number }[] = [];
    let capital = montantInitial;
    let impotsCumules = 0;

    for (let annee = 1; annee <= duree; annee++) {
      capital += epargneMensuelle * 12;
      const interetBrut = capital * taux;
      const impot = interetBrut * fiscal;
      const interetNet = interetBrut - impot;
      capital += interetNet;
      impotsCumules += impot;
      evolution.push({ annee, capital: Math.round(capital), impot: Math.round(impot) });
    }

    const capitalFinal = capital;
    const totalVerse = montantInitial + epargneMensuelle * 12 * duree;
    const gainNet = capitalFinal - totalVerse;
    const rendementGlobal = totalVerse > 0 ? (capitalFinal / totalVerse - 1) * 100 : 0;

    return {
      evolution,
      capitalFinal,
      totalVerse,
      gainNet,
      impots: impotsCumules,
      rendementGlobal,
      fiscal,
    };
  }, [montantInitial, epargneMensuelle, duree, type]);

  return (
    <SimGrid>
      {/* Formulaire */}
      <Panel title="Votre projet d'épargne">
        <div className="space-y-5">
          <Field
            label="Type de placement"
            hint={
              res.fiscal === FISCALITE.plusValuesBoursieres
                ? "Fiscalité : 15 % sur les plus-values"
                : "Fiscalité : 20 % sur les intérêts"
            }
          >
            <SelectField
              value={type}
              onChange={(v) => setType(v as TypeInvest)}
              options={(Object.keys(PLACEMENTS) as TypeInvest[]).map((k) => ({
                value: k,
                label: PLACEMENTS[k].label,
              }))}
            />
          </Field>
          <Field label="Montant initial">
            <NumberField
              value={montantInitial}
              onChange={setMontantInitial}
              step={10000}
              max={10000000}
              placeholder="100 000"
            />
          </Field>
          <Field label="Épargne mensuelle">
            <NumberField
              value={epargneMensuelle}
              onChange={setEpargneMensuelle}
              step={500}
              max={100000}
              placeholder="2 000"
            />
          </Field>
          <Field label="Durée (années)">
            <IntField value={duree} onChange={setDuree} min={1} max={40} />
          </Field>
        </div>

        <div className="mt-6">
          <Note>
            Intérêts composés annuels, fiscalité appliquée chaque année sur les gains. Les
            rendements affichés sont des moyennes indicatives — les performances passées ne
            préjugent pas des performances futures.
          </Note>
        </div>
      </Panel>

      {/* Résultats */}
      <div className="space-y-6">
        <Panel title="Projection">
          <div className="grid grid-cols-2 gap-6">
            <Stat label="Capital versé" value={formatMAD(res.totalVerse, 0)} />
            <Stat label="Capital final" value={formatMAD(res.capitalFinal, 0)} accent="navy" />
            <Stat label="Gain net" value={"+" + formatMAD(res.gainNet, 0)} accent="success" />
            <Stat label="Impôts payés" value={"-" + formatMAD(res.impots, 0)} accent="danger" />
          </div>

          <div className="my-6 border-t border-slate" />

          <div className="border border-navy/20 bg-navy p-6 text-cream">
            <div className="text-xs uppercase tracking-[0.08em] text-cream/60">
              Rendement global net
            </div>
            <div className="mt-1 font-display text-4xl text-gold-light">
              {formatPct(res.rendementGlobal)}
            </div>
            <div className="mt-1 text-sm text-cream/70">
              sur {duree} an{duree > 1 ? "s" : ""}
            </div>
          </div>
        </Panel>

        <Panel title="Évolution du capital">
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={res.evolution} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="capGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#B08A3E" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#B08A3E" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#C3C9D2" strokeOpacity={0.5} />
                <XAxis
                  dataKey="annee"
                  stroke="#C3C9D2"
                  tick={{ fill: "#6B7789", fontSize: 12 }}
                  tickLine={false}
                />
                <YAxis
                  stroke="#C3C9D2"
                  tick={{ fill: "#6B7789", fontSize: 12 }}
                  tickLine={false}
                  tickFormatter={(v: number) => `${Math.round(v / 1000)}k`}
                  width={44}
                />
                <Tooltip
                  formatter={(v: number) => [formatMAD(v, 0), "Capital"]}
                  labelFormatter={(l: number) => `Année ${l}`}
                  contentStyle={{
                    background: "#FBF9F3",
                    border: "1px solid #C3C9D2",
                    borderRadius: 0,
                    fontSize: 12,
                    color: "#0E1A2B",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="capital"
                  stroke="#B08A3E"
                  strokeWidth={2}
                  fill="url(#capGradient)"
                  name="Capital"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>
    </SimGrid>
  );
}
