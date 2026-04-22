import Link from "next/link";
import { useTranslations } from "next-intl";
import { COMPANY, localizedPath, type Locale } from "@/lib/site";
import CTAButton from "./CTAButton";
import LocaleSwitch from "./LocaleSwitch";
import MobileMenu from "./MobileMenu";

type Props = { locale: string };

export default function Nav({ locale }: Props) {
  const t = useTranslations("nav");
  const tc = useTranslations("common");
  const l = locale as Locale;

  const items = [
    { href: localizedPath("dienstleistungen", l), label: t("services") },
    { href: localizedPath("software", l), label: t("software") },
    { href: localizedPath("referenzen", l), label: t("references") },
    { href: localizedPath("sponsoring", l), label: t("sponsoring") },
    { href: localizedPath("kontakt", l), label: t("contact") },
  ];

  const emailHref = `mailto:${COMPANY.email}`;
  const phoneHref = `tel:${COMPANY.phoneTel}`;

  return (
    <header className="sticky top-0 z-40 border-b border-[--color-line] bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-4 px-6 py-4">
        <Link
          href={localizedPath("", l)}
          className="group inline-flex items-center gap-2"
          aria-label={tc("companyName")}
        >
          <span className="font-[var(--font-space-grotesk)] text-[17px] font-semibold tracking-tight text-[--color-ink]">
            {tc("companyShort")}
          </span>
          <span
            aria-hidden="true"
            className="h-2 w-2 rounded-full bg-[--color-brand-red] transition-transform duration-300 group-hover:scale-125"
          />
          <span className="hidden text-[12px] uppercase tracking-[0.16em] text-[--color-muted] sm:inline">
            Heiniger
          </span>
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-7 md:flex">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-[14px] text-[--color-ink] transition-colors hover:text-[--color-brand-red]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <LocaleSwitch locale={locale} currentRoute="" />
          <CTAButton href={emailHref} variant="primary" size="md" ariaLabel={t("contact")}>
            {t("contact")}
          </CTAButton>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <LocaleSwitch locale={locale} currentRoute="" />
          <MobileMenu items={items} emailHref={emailHref} phoneHref={phoneHref} />
        </div>
      </div>
    </header>
  );
}
