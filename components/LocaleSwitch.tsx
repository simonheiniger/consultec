import Link from "next/link";
import { useTranslations } from "next-intl";
import { LOCALES, type Locale } from "@/lib/site";

type Props = {
  locale: string;
  currentRoute: "" | "dienstleistungen" | "software" | "referenzen" | "sponsoring" | "kontakt" | "impressum" | "datenschutz";
};

function pathFor(route: Props["currentRoute"], target: Locale): string {
  const base = route ? `/${route}` : "/";
  return target === "de" ? base : `/en${base === "/" ? "" : base}`;
}

export default function LocaleSwitch({ locale, currentRoute }: Props) {
  const t = useTranslations("locale");

  return (
    <div
      role="group"
      aria-label={t("ariaLabel")}
      className="inline-flex items-center overflow-hidden rounded-full border border-[--color-line] text-[12px] tracking-wider"
    >
      {LOCALES.map((l, idx) => {
        const active = l === locale;
        const borderClass = idx > 0 ? "border-l border-[--color-line]" : "";
        return (
          <Link
            key={l}
            href={pathFor(currentRoute, l)}
            hrefLang={l}
            aria-current={active ? "true" : undefined}
            className={`${borderClass} px-3 py-1.5 uppercase transition-colors ${
              active
                ? "bg-[--color-ink] text-white"
                : "text-[--color-muted] hover:text-[--color-ink]"
            }`}
          >
            {t(l as "de" | "en")}
          </Link>
        );
      })}
    </div>
  );
}
