import { useTranslations } from "next-intl";
import { COMPANY } from "@/lib/site";
import CTAButton from "../CTAButton";

export default function ReferencesGrid() {
  const t = useTranslations("references");
  const clients = t.raw("clients") as string[];

  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-[1200px] px-6">
        <p className="font-[var(--font-space-grotesk)] text-[12px] uppercase tracking-[0.2em] text-[--color-brand-blue]">
          {t("title")}
        </p>
        <h1 className="mt-4 max-w-[30ch] font-[var(--font-space-grotesk)] text-[36px] font-semibold leading-[1.08] tracking-tight text-[--color-ink] md:text-[52px]">
          {t("intro")}
        </h1>

        <ul className="mt-16 grid gap-px overflow-hidden rounded-2xl border border-[--color-line] bg-[--color-line] sm:grid-cols-2 md:grid-cols-3">
          {clients.map((name, idx) => (
            <li
              key={name}
              className="group relative flex min-h-[120px] items-center bg-white px-6 py-7 transition-colors hover:bg-[--color-surface]"
            >
              <span className="pointer-events-none absolute left-6 top-5 font-[var(--font-space-grotesk)] text-[11px] font-semibold tracking-[0.18em] text-[--color-muted]">
                {String(idx + 1).padStart(2, "0")}
              </span>
              <p className="font-[var(--font-space-grotesk)] text-[18px] font-medium leading-snug tracking-tight text-[--color-ink] transition-colors group-hover:text-[--color-brand-red] md:text-[20px]">
                {name}
              </p>
            </li>
          ))}
        </ul>

        <div className="mt-16 flex flex-wrap items-center justify-between gap-6 rounded-2xl border border-[--color-line] bg-[--color-surface] p-8 md:p-10">
          <p className="max-w-[40ch] text-[16px] text-[--color-ink] md:text-[18px]">
            {t("cta")}
          </p>
          <CTAButton href={`mailto:${COMPANY.email}`} variant="primary" size="md">
            E-Mail schreiben
          </CTAButton>
        </div>
      </div>
    </section>
  );
}
