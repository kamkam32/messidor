import { getManagementCompanyLogo, companyInitials } from "@/lib/management-company-logos";

/** Logo de la société de gestion, ou pastille d'initiales si inconnu. */
export function CompanyLogo({
  company,
  size = 40,
}: {
  company: string | null | undefined;
  size?: number;
}) {
  const logo = getManagementCompanyLogo(company);
  if (logo) {
    return (
      <span
        className="flex shrink-0 items-center justify-center overflow-hidden border border-slate/50 bg-cream-light"
        style={{ width: size, height: size }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logo}
          alt={company ? `Logo ${company}` : "Logo société de gestion"}
          className="max-h-[80%] max-w-[80%] object-contain"
          loading="lazy"
        />
      </span>
    );
  }
  return (
    <span
      className="flex shrink-0 items-center justify-center border border-slate/50 bg-navy text-[11px] font-semibold text-cream"
      style={{ width: size, height: size }}
      aria-hidden
    >
      {companyInitials(company)}
    </span>
  );
}
