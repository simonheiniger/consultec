import { useTranslations } from "next-intl";
import { COMPANY } from "@/lib/site";

export default function ContactBlock() {
  const t = useTranslations("kontakt");

  return (
    <section className="bg-white pb-12 pt-24">
      <div className="mx-auto max-w-[1200px] px-6">
        <p className="font-[var(--font-space-grotesk)] text-[12px] uppercase tracking-[0.2em] text-[--color-brand-blue]">
          {t("title")}
        </p>
        <h1 className="mt-4 max-w-[30ch] font-[var(--font-space-grotesk)] text-[40px] font-semibold leading-[1.06] tracking-tight text-[--color-ink] md:text-[60px]">
          {t("intro")}
        </h1>

        <dl className="mt-14 grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[--color-muted]">
              {t("address.label")}
            </dt>
            <dd className="mt-3 font-[var(--font-space-grotesk)] text-[18px] leading-relaxed text-[--color-ink]">
              {t("address.line1")}
              <br />
              {t("address.line2")}
              <br />
              {t("address.country")}
            </dd>
          </div>

          <div>
            <dt className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[--color-muted]">
              {t("phone.label")}
            </dt>
            <dd className="mt-3 font-[var(--font-space-grotesk)] text-[18px] leading-relaxed text-[--color-ink]">
              <a href={`tel:${COMPANY.phoneTel}`} className="block transition-colors hover:text-[--color-brand-red]">
                {t("phone.primary")}
              </a>
              <a href={`tel:${COMPANY.phoneAltTel}`} className="block transition-colors hover:text-[--color-brand-red]">
                {t("phone.secondary")}
              </a>
            </dd>
          </div>

          <div>
            <dt className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[--color-muted]">
              {t("email.label")}
            </dt>
            <dd className="mt-3 font-[var(--font-space-grotesk)] text-[18px] leading-relaxed text-[--color-ink]">
              <a href={`mailto:${COMPANY.email}`} className="transition-colors hover:text-[--color-brand-red]">
                {t("email.value")}
              </a>
            </dd>
          </div>

          <div>
            <dt className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[--color-muted]">
              {t("hours.label")}
            </dt>
            <dd className="mt-3 font-[var(--font-space-grotesk)] text-[18px] leading-relaxed text-[--color-ink]">
              {t("hours.primary")}
              <br />
              {t("hours.secondary")}
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
