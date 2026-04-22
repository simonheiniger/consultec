import Link from "next/link";
import { useTranslations } from "next-intl";
import { COMPANY, localizedPath, type Locale } from "@/lib/site";

export default function Footer({ locale }: { locale: string }) {
  const t = useTranslations("footer");
  const tNav = useTranslations("nav");
  const l = locale as Locale;
  const year = new Date().getFullYear();

  const nav = [
    { href: localizedPath("dienstleistungen", l), label: tNav("services") },
    { href: localizedPath("software", l), label: tNav("software") },
    { href: localizedPath("referenzen", l), label: tNav("references") },
    { href: localizedPath("sponsoring", l), label: tNav("sponsoring") },
    { href: localizedPath("kontakt", l), label: tNav("contact") },
  ];

  return (
    <footer className="mt-24 border-t border-[--color-line] bg-[--color-surface]">
      <div className="mx-auto grid max-w-[1200px] gap-10 px-6 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <p className="font-[var(--font-space-grotesk)] text-[20px] font-semibold tracking-tight text-[--color-ink]">
            {COMPANY.name}
          </p>
          <p className="mt-3 max-w-sm text-[14px] leading-relaxed text-[--color-muted]">
            {t("description")}
          </p>
          <address className="mt-6 not-italic text-[14px] text-[--color-ink]">
            {COMPANY.address.street}
            <br />
            {COMPANY.address.postalCode} {COMPANY.address.city}
            <br />
            <a
              href={`tel:${COMPANY.phoneTel}`}
              className="mt-2 inline-block hover:text-[--color-brand-red]"
            >
              {COMPANY.phoneDisplay}
            </a>
            <br />
            <a
              href={`mailto:${COMPANY.email}`}
              className="hover:text-[--color-brand-red]"
            >
              {COMPANY.email}
            </a>
          </address>
        </div>

        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[--color-muted]">
            {t("explore")}
          </p>
          <ul className="mt-4 space-y-2 text-[14px]">
            {nav.map((i) => (
              <li key={i.href}>
                <Link
                  href={i.href}
                  className="text-[--color-ink] transition-colors hover:text-[--color-brand-red]"
                >
                  {i.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[--color-muted]">
            {t("legal.title")}
          </p>
          <ul className="mt-4 space-y-2 text-[14px]">
            <li>
              <Link
                href={localizedPath("impressum", l)}
                className="text-[--color-ink] transition-colors hover:text-[--color-brand-red]"
              >
                {t("legal.impressum")}
              </Link>
            </li>
            <li>
              <Link
                href={localizedPath("datenschutz", l)}
                className="text-[--color-ink] transition-colors hover:text-[--color-brand-red]"
              >
                {t("legal.datenschutz")}
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-[--color-line]">
        <div className="mx-auto flex max-w-[1200px] flex-col items-start justify-between gap-2 px-6 py-5 text-[12px] text-[--color-muted] sm:flex-row sm:items-center">
          <p>{t("copyright", { year })}</p>
          <p>
            {t("credit")}{" "}
            <a
              href="https://briangantner.ch"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-[--color-ink] transition-colors hover:text-[--color-brand-red]"
            >
              briangantner.ch
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
