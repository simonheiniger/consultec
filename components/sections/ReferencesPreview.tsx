import { useTranslations } from "next-intl";
import { localizedPath, type Locale } from "@/lib/site";
import CTAButton from "../CTAButton";

export default function ReferencesPreview({ locale }: { locale: string }) {
  const t = useTranslations("referencesPreview");
  const tr = useTranslations("references");
  const l = locale as Locale;
  const clients = tr.raw("clients") as string[];
  const preview = clients.slice(0, 8);

  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h2 className="max-w-[22ch] font-[var(--font-space-grotesk)] text-[28px] font-semibold leading-tight tracking-tight text-[--color-ink] md:text-[40px]">
            {t("title")}
          </h2>
          <CTAButton href={localizedPath("referenzen", l)} variant="secondary" size="md">
            {t("cta")} <span aria-hidden="true">→</span>
          </CTAButton>
        </div>

        <ul className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-[--color-line] bg-[--color-line] sm:grid-cols-2 md:grid-cols-4">
          {preview.map((name) => (
            <li
              key={name}
              className="bg-white px-6 py-8 font-[var(--font-space-grotesk)] text-[17px] font-medium text-[--color-ink] transition-colors hover:bg-[--color-surface] hover:text-[--color-brand-red]"
            >
              {name}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
