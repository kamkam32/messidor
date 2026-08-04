"use client";

import { useMemo, useState } from "react";
import { formatMAD } from "@/lib/format";
import { Field, NumberField, IntField, SelectField, Panel, Note, SimGrid } from "./ui";

export function SuccessionCalc() {
  const [patrimoine, setPatrimoine] = useState(2000000);
  const [conjoint, setConjoint] = useState("oui");
  const [nbEnfants, setNbEnfants] = useState(2);
  const [nbGarcons, setNbGarcons] = useState(1);
  const [parents, setParents] = useState("non");

  const nbFilles = Math.max(0, nbEnfants - nbGarcons);

  const res = useMemo(() => {
    let partConjoint = 0;
    let partParents = 0;

    if (conjoint === "oui") {
      partConjoint = nbEnfants > 0 ? patrimoine * (1 / 8) : patrimoine * (1 / 4);
    }
    if (parents === "oui") {
      partParents = nbEnfants === 0 ? patrimoine * (1 / 3) : patrimoine * (1 / 6);
    }

    const reste = patrimoine - partConjoint - partParents;
    const partEnfants = nbEnfants > 0 ? reste : 0;

    // 2 parts par garçon, 1 part par fille (règle de la Moudawana)
    const totalParts = nbGarcons * 2 + nbFilles * 1;
    const partFille = totalParts > 0 ? partEnfants / totalParts : 0;
    const partGarcon = partFille * 2;

    return { partConjoint, partParents, partGarcon, partFille };
  }, [patrimoine, conjoint, nbEnfants, nbGarcons, parents, nbFilles]);

  const rows: { label: string; part: string; montant: number }[] = [];
  if (conjoint === "oui" && res.partConjoint > 0)
    rows.push({ label: "Conjoint", part: nbEnfants > 0 ? "1/8" : "1/4", montant: res.partConjoint });
  if (parents === "oui" && res.partParents > 0)
    rows.push({ label: "Parents", part: nbEnfants > 0 ? "1/6" : "1/3", montant: res.partParents });
  if (nbGarcons > 0)
    rows.push({ label: `Chaque garçon (${nbGarcons})`, part: "2 parts", montant: res.partGarcon });
  if (nbFilles > 0)
    rows.push({ label: `Chaque fille (${nbFilles})`, part: "1 part", montant: res.partFille });

  return (
    <SimGrid>
      {/* Formulaire */}
      <Panel title="La succession">
        <div className="space-y-5">
          <Field label="Patrimoine total à transmettre">
            <NumberField
              value={patrimoine}
              onChange={setPatrimoine}
              step={100000}
              max={500000000}
              placeholder="2 000 000"
            />
          </Field>
          <Field label="Conjoint survivant">
            <SelectField
              value={conjoint}
              onChange={setConjoint}
              options={[
                { value: "oui", label: "Oui" },
                { value: "non", label: "Non" },
              ]}
            />
          </Field>
          <Field label="Nombre total d'enfants">
            <IntField
              value={nbEnfants}
              onChange={(v) => {
                setNbEnfants(v);
                if (nbGarcons > v) setNbGarcons(v);
              }}
              min={0}
              max={20}
            />
          </Field>
          {nbEnfants > 0 && (
            <Field label="Nombre de garçons" hint={`Nombre de filles : ${nbFilles}`}>
              <IntField value={nbGarcons} onChange={setNbGarcons} min={0} max={nbEnfants} />
            </Field>
          )}
          <Field label="Parents vivants">
            <SelectField
              value={parents}
              onChange={setParents}
              options={[
                { value: "non", label: "Non" },
                { value: "oui", label: "Oui (au moins un)" },
              ]}
            />
          </Field>
        </div>
      </Panel>

      {/* Résultats */}
      <div className="space-y-6">
        <Panel title="Répartition selon la Moudawana">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate text-left text-xs uppercase tracking-[0.08em] text-navy-mute">
                <th className="pb-2 font-semibold">Héritier</th>
                <th className="pb-2 text-right font-semibold">Part</th>
                <th className="pb-2 text-right font-semibold">Montant</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.label} className="border-b border-slate/60">
                  <td className="py-3 text-navy-soft">{r.label}</td>
                  <td className="py-3 text-right tabular-nums text-navy-mute">{r.part}</td>
                  <td className="py-3 text-right font-semibold tabular-nums text-navy">
                    {formatMAD(r.montant, 0)}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-6 text-center text-sm text-navy-mute">
                    Renseignez au moins un héritier.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Panel>

        <Note>
          Calcul simplifié fondé sur les règles usuelles de dévolution (Moudawana) : conjoint
          1/8 en présence d&apos;enfants (1/4 sinon), parents 1/6 (1/3 sans enfant), puis
          partage du reste entre enfants à raison de 2 parts par garçon et 1 part par fille.
          Pour une situation réelle, consultez un notaire ou un adoul.
        </Note>
      </div>
    </SimGrid>
  );
}
