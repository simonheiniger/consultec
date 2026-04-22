import { useTranslations } from "next-intl";

type Item = { name: string; role: string; url: string };

export default function SponsoringList() {
  const t = useTranslations("sponsoring");
  const items = t.raw("items") as Item[];

  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-[1200px] px-6">
        <p className="font-[var(--font-space-grotesk)] text-[12px] uppercase tracking-[0.2em] text-[--color-brand-blue]">
          {t("title")}
        </p>
        <h1 className="mt-4 max-w-[30ch] font-[var(--font-space-grotesk)] text-[36px] font-semibold leading-[1.08] tracking-tight text-[--color-ink] md:text-[52px]">
          {t("intro")}
        </h1>

        <ul className="mt-16 grid gap-6 md:grid-cols-2">
          {items.map((it, idx) => (
            <li key={it.name}>
              <a
                href={it.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block rounded-2xl border border-[--color-line] bg-white p-8 transition-all duration-300 hover:-translate-y-1 hover:border-[--color-brand-gold] hover:shadow-[0_16px_40px_-26px_rgba(245,184,0,0.6)]"
              >
                <span className="font-[var(--font-space-grotesk)] text-[12px] font-semibold uppercase tracking-[0.2em] text-[--color-brand-gold]">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <h2 className="mt-4 font-[var(--font-space-grotesk)] text-[28px] font-semibold tracking-tight text-[--color-ink] transition-colors group-hover:text-[--color-brand-red]">
                  {it.name}
                </h2>
                <p className="mt-3 text-[15px] leading-relaxed text-[--color-muted]">
                  {it.role}
                </p>
                <span className="mt-6 inline-flex items-center gap-2 text-[14px] font-medium text-[--color-brand-red]">
                  {new URL(it.url).hostname.replace(/^www\./, "")}
                  <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">
                    ↗
                  </span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
