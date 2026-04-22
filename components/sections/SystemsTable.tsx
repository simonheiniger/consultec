import { useTranslations } from "next-intl";

type Row = { label: string; value: string };

export default function SystemsTable() {
  const t = useTranslations("software.systems");
  const rows = t.raw("rows") as Row[];

  return (
    <section className="border-t border-[--color-line] bg-[--color-surface] py-20">
      <div className="mx-auto max-w-[1200px] px-6">
        <h2 className="font-[var(--font-space-grotesk)] text-[28px] font-semibold tracking-tight text-[--color-ink] md:text-[36px]">
          {t("title")}
        </h2>
        <dl className="mt-10 divide-y divide-[--color-line] overflow-hidden rounded-2xl border border-[--color-line] bg-white">
          {rows.map((r) => (
            <div key={r.label} className="grid gap-2 p-6 md:grid-cols-[1fr_2fr] md:items-baseline md:gap-8 md:p-8">
              <dt className="font-[var(--font-space-grotesk)] text-[17px] font-semibold text-[--color-ink]">
                {r.label}
              </dt>
              <dd className="text-[15px] leading-relaxed text-[--color-muted]">
                {r.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
