import { useTranslations } from "next-intl";

type Item = { label: string; text: string };

export default function PillarsGrid() {
  const t = useTranslations("pillars");
  const items = t.raw("items") as Item[];

  return (
    <section className="border-t border-[--color-line] bg-white py-20">
      <div className="mx-auto max-w-[1200px] px-6">
        <h2 className="max-w-[20ch] font-[var(--font-space-grotesk)] text-[28px] font-semibold leading-tight tracking-tight text-[--color-ink] md:text-[40px]">
          {t("title")}
        </h2>

        <ul className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-[--color-line] bg-[--color-line] sm:grid-cols-2 lg:grid-cols-4">
          {items.map((i, idx) => (
            <li key={i.label} className="group relative bg-white p-8 transition-colors hover:bg-[--color-surface]">
              <span className="font-[var(--font-space-grotesk)] text-[12px] font-semibold uppercase tracking-[0.2em] text-[--color-brand-blue]">
                {String(idx + 1).padStart(2, "0")}
              </span>
              <p className="mt-4 font-[var(--font-space-grotesk)] text-[24px] font-semibold tracking-tight text-[--color-ink]">
                {i.label}
              </p>
              <p className="mt-3 text-[15px] leading-relaxed text-[--color-muted]">
                {i.text}
              </p>
              <span
                aria-hidden="true"
                className="absolute left-8 right-8 top-0 h-[2px] origin-left scale-x-0 bg-[--color-brand-red] transition-transform duration-500 group-hover:scale-x-100"
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
