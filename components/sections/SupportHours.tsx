import { useTranslations } from "next-intl";
import { COMPANY } from "@/lib/site";

export default function SupportHours() {
  const t = useTranslations("supportHours");
  const tc = useTranslations("common.cta");

  return (
    <section className="bg-[--color-surface] py-20">
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="grid gap-12 md:grid-cols-[1fr_1.4fr] md:items-start">
          <h2 className="max-w-[18ch] font-[var(--font-space-grotesk)] text-[28px] font-semibold leading-tight tracking-tight text-[--color-ink] md:text-[40px]">
            {t("title")}
          </h2>
          <div>
            <dl className="divide-y divide-[--color-line] border-y border-[--color-line]">
              <div className="flex flex-wrap items-baseline justify-between gap-4 py-5">
                <dt className="text-[14px] uppercase tracking-[0.16em] text-[--color-muted]">Vormittag</dt>
                <dd className="font-[var(--font-space-grotesk)] text-[18px] font-medium text-[--color-ink]">{t("morning")}</dd>
              </div>
              <div className="flex flex-wrap items-baseline justify-between gap-4 py-5">
                <dt className="text-[14px] uppercase tracking-[0.16em] text-[--color-muted]">Nachmittag</dt>
                <dd className="font-[var(--font-space-grotesk)] text-[18px] font-medium text-[--color-ink]">{t("afternoon")}</dd>
              </div>
            </dl>
            <p className="mt-6 text-[15px] leading-relaxed text-[--color-muted]">
              {t("note")}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href={`tel:${COMPANY.phoneTel}`}
                aria-label={tc("phoneAria")}
                className="font-[var(--font-space-grotesk)] text-[20px] font-medium text-[--color-ink] underline decoration-[--color-brand-red] decoration-2 underline-offset-[6px] transition-colors hover:text-[--color-brand-red]"
              >
                {COMPANY.phoneDisplay}
              </a>
              <a
                href={`mailto:${COMPANY.email}`}
                aria-label={tc("emailAria")}
                className="font-[var(--font-space-grotesk)] text-[20px] font-medium text-[--color-ink] underline decoration-[--color-brand-blue] decoration-2 underline-offset-[6px] transition-colors hover:text-[--color-brand-blue]"
              >
                {COMPANY.email}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
