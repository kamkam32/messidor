"use client";

import { useState, type ReactNode } from "react";

/* =========================================================================
   Briques UI partagées des simulateurs — style Messidor (crème / navy / or).
   Filets slate 1px, angles vifs, focus or. Aucune couleur en dur.
   ========================================================================= */

const inputCx =
  "w-full border border-slate bg-cream px-3 py-3 text-sm text-navy outline-none transition-colors focus:border-gold";

/** Ligne de formulaire : label + champ + aide optionnelle. */
export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.08em] text-navy-soft">
        {label}
      </span>
      {children}
      {hint && <span className="mt-1.5 block text-xs text-navy-mute">{hint}</span>}
    </label>
  );
}

/** Champ nombre avec formatage fr-MA (espaces) au repos, valeur brute au focus. */
export function NumberField({
  value,
  onChange,
  min = 0,
  max,
  step,
  placeholder,
  suffix = "MAD",
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  suffix?: string;
}) {
  const [focused, setFocused] = useState(false);
  const [raw, setRaw] = useState(String(value));

  const display = focused
    ? raw
    : new Intl.NumberFormat("fr-MA", { maximumFractionDigits: 2 })
        .format(value)
        .replace(/ |,/g, " ");

  return (
    <div className="relative">
      <input
        type="text"
        inputMode="decimal"
        className={inputCx + (suffix ? " pr-14" : "")}
        value={display}
        placeholder={placeholder}
        onFocus={() => {
          setFocused(true);
          setRaw(value > 0 ? String(value) : "");
        }}
        onBlur={() => {
          setFocused(false);
          setRaw(String(value));
        }}
        onChange={(e) => {
          const s = e.target.value;
          setRaw(s);
          const n = parseFloat(s.replace(/\s/g, "").replace(",", "."));
          if (!Number.isNaN(n)) {
            let v = n;
            if (min != null) v = Math.max(min, v);
            if (max != null) v = Math.min(max, v);
            onChange(v);
          } else if (s === "") {
            onChange(0);
          }
        }}
        // step est purement indicatif pour l'UX clavier
        data-step={step}
      />
      {suffix && (
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-navy-mute">
          {suffix}
        </span>
      )}
    </div>
  );
}

/** Champ entier simple (durée, nombre d'enfants...). */
export function IntField({
  value,
  onChange,
  min = 0,
  max,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <input
      type="number"
      className="w-full border border-slate bg-cream px-3 py-3 text-sm text-navy outline-none transition-colors focus:border-gold"
      value={Number.isNaN(value) ? "" : value}
      min={min}
      max={max}
      onChange={(e) => {
        const n = parseInt(e.target.value, 10);
        if (Number.isNaN(n)) return onChange(0);
        let v = n;
        if (min != null) v = Math.max(min, v);
        if (max != null) v = Math.min(max, v);
        onChange(v);
      }}
    />
  );
}

/** Select stylé. */
export function SelectField({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      className="w-full appearance-none border border-slate bg-cream px-3 py-3 text-sm text-navy outline-none transition-colors focus:border-gold"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

/** Carte / panneau bordé (colonne formulaire ou résultats). */
export function Panel({
  title,
  children,
  tone = "cream",
}: {
  title?: string;
  children: ReactNode;
  tone?: "cream" | "navy";
}) {
  const isNavy = tone === "navy";
  return (
    <div
      className={
        "border p-6 md:p-8 " +
        (isNavy ? "border-navy/20 bg-navy text-cream" : "border-slate bg-cream-light")
      }
    >
      {title && (
        <h3
          className={
            "mb-6 font-display text-xl " + (isNavy ? "text-cream" : "text-navy")
          }
        >
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}

/** Statistique label + valeur. */
export function Stat({
  label,
  value,
  accent = "navy",
  hint,
}: {
  label: string;
  value: string;
  accent?: "navy" | "gold" | "success" | "danger" | "cream";
  hint?: string;
}) {
  const color =
    accent === "gold"
      ? "text-gold-deep"
      : accent === "success"
        ? "text-success"
        : accent === "danger"
          ? "text-danger"
          : accent === "cream"
            ? "text-cream"
            : "text-navy";
  return (
    <div>
      <div className="text-xs uppercase tracking-[0.08em] text-navy-mute">{label}</div>
      <div className={"mt-1 font-display text-2xl " + color}>{value}</div>
      {hint && <div className="mt-0.5 text-xs text-navy-mute">{hint}</div>}
    </div>
  );
}

/** Encart de note / avertissement. */
export function Note({ children }: { children: ReactNode }) {
  return (
    <p className="border-l-2 border-gold bg-cream px-4 py-3 text-xs leading-relaxed text-navy-soft">
      {children}
    </p>
  );
}

/** Grille deux colonnes standard : formulaire | résultats. */
export function SimGrid({ children }: { children: ReactNode }) {
  return <div className="grid gap-8 lg:grid-cols-2">{children}</div>;
}
