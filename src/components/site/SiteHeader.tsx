"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { NAV, SITE } from "@/lib/site";
import { cx } from "@/components/ui/Button";

export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  // Home = hero sombre plein écran -> header transparent au départ
  const overHero = pathname === "/";
  const solid = scrolled || !overHero || open;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header
        className={cx(
          "fixed inset-x-0 top-0 z-50 transition-colors duration-500",
          solid
            ? "bg-cream/85 backdrop-blur-md border-b border-slate/40"
            : "bg-transparent border-b border-transparent"
        )}
      >
        <div className="shell flex h-20 items-center justify-between">
          <Link
            href="/"
            className={cx(
              "font-display text-lg tracking-[0.22em] uppercase transition-colors",
              solid ? "text-navy" : "text-cream"
            )}
          >
            Messidor
          </Link>

          <nav className="hidden items-center gap-8 lg:flex">
            {NAV.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cx(
                    "text-[11px] font-medium uppercase tracking-[0.16em] transition-opacity hover:opacity-60",
                    solid ? "text-navy-soft" : "text-cream/85",
                    active && "opacity-100"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <Link
              href="/espace-client"
              className={cx(
                "text-[11px] font-medium uppercase tracking-[0.16em] transition-opacity hover:opacity-60",
                solid ? "text-navy-soft" : "text-cream/85"
              )}
            >
              Espace client
            </Link>
            <a
              href={SITE.calendly}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gold px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-navy transition-colors hover:bg-gold-light"
            >
              Prendre RDV
            </a>
          </div>

          <button
            aria-label="Menu"
            onClick={() => setOpen((v) => !v)}
            className={cx("lg:hidden", solid ? "text-navy" : "text-cream")}
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Menu mobile plein écran (hors <header> pour éviter le containing block du blur) */}
      {open && (
        <div className="fixed inset-0 z-40 flex flex-col bg-navy-deep px-6 pt-24 lg:hidden">
          <nav className="flex flex-col gap-6">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="font-display text-2xl text-cream"
              >
                {item.label}
              </Link>
            ))}
            <Link href="/espace-client" className="font-display text-2xl text-cream/70">
              Espace client
            </Link>
            <a
              href={SITE.calendly}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 bg-gold px-6 py-4 text-center text-[11px] font-semibold uppercase tracking-[0.16em] text-navy"
            >
              Prendre RDV
            </a>
          </nav>
        </div>
      )}
    </>
  );
}
