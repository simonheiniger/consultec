import { useTranslations } from "next-intl";
import { COMPANY, localizedPath, type Locale } from "@/lib/site";
import CTAButton from "./CTAButton";
import HeroCanvas from "./HeroCanvas";

export default function Hero({ locale }: { locale: string }) {
  const t = useTranslations("hero");
  const l = locale as Locale;

  return (
    <section className="relative isolate overflow-hidden text-white">
      <div className="absolute inset-0 -z-10">
        <HeroCanvas />
      </div>

      <div className="mx-auto flex max-w-[1200px] flex-col justify-end gap-10 px-6 pb-20 pt-28 md:min-h-[78vh] md:pb-24 md:pt-36">
        <p className="font-[var(--font-space-grotesk)] text-[12px] uppercase tracking-[0.24em] text-[#F5B800]">
          {t("eyebrow")}
        </p>
        <h1 className="max-w-[20ch] font-[var(--font-space-grotesk)] text-[44px] font-semibold leading-[1.05] tracking-tight md:text-[68px]">
          {t("title")}
        </h1>
        <p className="max-w-[58ch] text-[17px] leading-relaxed text-white/80 md:text-[19px]">
          {t("subtitle")}
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <CTAButton
            href={`mailto:${COMPANY.email}`}
            variant="primary"
            size="lg"
            ariaLabel={t("ctaPrimary")}
          >
            {t("ctaPrimary")}
          </CTAButton>
          <CTAButton
            href={localizedPath("software", l)}
            variant="ghost"
            size="lg"
            className="text-white/90 hover:text-white"
          >
            {t("ctaSecondary")} <span aria-hidden="true">→</span>
          </CTAButton>
        </div>

        <div className="mt-6 hidden items-center gap-3 text-[12px] uppercase tracking-[0.2em] text-white/60 md:flex">
          <span className="h-px w-10 bg-white/40" />
          <span>{t("scrollHint")}</span>
        </div>
      </div>
    </section>
  );
}
