import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "gold" | "dark" | "cream" | "outline" | "outline-light";

const base =
  "inline-flex items-center justify-center gap-2 px-8 py-4 text-[11px] font-semibold uppercase tracking-[0.16em] transition-colors duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";

const variants: Record<Variant, string> = {
  gold: "bg-gold text-navy hover:bg-gold-light",
  dark: "bg-navy text-cream hover:bg-navy-deep",
  cream: "bg-cream text-navy hover:bg-cream-dark",
  outline: "border border-navy/30 text-navy hover:bg-navy hover:text-cream",
  "outline-light": "border border-cream/40 text-cream hover:bg-cream/10",
};

export function cx(...parts: (string | false | undefined)[]) {
  return parts.filter(Boolean).join(" ");
}

export function Button({
  variant = "gold",
  className,
  children,
  ...props
}: { variant?: Variant; className?: string; children: ReactNode } & ComponentProps<"button">) {
  return (
    <button className={cx(base, variants[variant], className)} {...props}>
      {children}
    </button>
  );
}

export function ButtonLink({
  variant = "gold",
  className,
  children,
  href,
  external,
  ...props
}: {
  variant?: Variant;
  className?: string;
  children: ReactNode;
  href: string;
  external?: boolean;
} & Omit<ComponentProps<typeof Link>, "href">) {
  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={cx(base, variants[variant], className)}
      >
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cx(base, variants[variant], className)} {...props}>
      {children}
    </Link>
  );
}
