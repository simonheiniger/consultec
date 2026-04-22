import { useTranslations } from "next-intl";
import { localizedPath, type Locale } from "@/lib/site";
import CTAButton from "../CTAButton";

export default function ServicesTeaser({ locale }: { locale: string }) {
  const t = useTranslations("servicesTeaser");
  const l = locale as Locale;

  return (
    <section className="relative overflow-hidden bg-[--color-ink] py-24 text-white">
      <span
        aria-hidden="true"
        className="absolute -left-24 top-1/2 h-[420px] w-[420px] -translate-y-1/2 rounded-full bg-[--color-brand-red]/20 blur-3xl"
      />
      <span
        aria-hidden="true"
        className="absolute -right-32 bottom-0 h-[380px] w-[380px] rounded-full bg-[--color-brand-blue]/25 blur-3xl"
      />

      <div className="relative mx-auto grid max-w-[1200px] gap-10 px-6 md:grid-cols-[1.2fr_1fr] md:items-end">
        <h2 className="max-w-[22ch] font-[var(--font-space-grotesk)] text-[32px] font-semibold leading-[1.1] tracking-tight md:text-[52px]">
          {t("title")}
        </h2>
        <div>
          <p className="text-[16px] leading-relaxed text-white/80 md:text-[18px]">
            {t("text")}
          </p>
          <div className="mt-8">
            <CTAButton
              href={localizedPath("dienstleistungen", l)}
              variant="primary"
              size="lg"
            >
              {t("cta")} <span aria-hidden="true">→</span>
            </CTAButton>
          </div>
        </div>
      </div>
    </section>
  );
}
