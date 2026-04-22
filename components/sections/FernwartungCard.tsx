import { useTranslations } from "next-intl";

export default function FernwartungCard() {
  const t = useTranslations("kontakt.fernwartung");

  return (
    <aside className="relative overflow-hidden rounded-2xl border border-[--color-line] bg-gradient-to-br from-[--color-ink] to-[#111827] p-8 text-white md:p-10">
      <span
        aria-hidden="true"
        className="absolute -right-24 -top-16 h-64 w-64 rounded-full bg-[--color-brand-red]/25 blur-3xl"
      />
      <span className="font-[var(--font-space-grotesk)] text-[12px] font-semibold uppercase tracking-[0.2em] text-[#F5B800]">
        TeamViewer
      </span>
      <h2 className="mt-3 font-[var(--font-space-grotesk)] text-[28px] font-semibold tracking-tight">
        {t("title")}
      </h2>
      <p className="mt-4 max-w-[46ch] text-[15px] leading-relaxed text-white/80">
        {t("text")}
      </p>
      <a
        href={t("href")}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-8 inline-flex items-center gap-2 rounded-full bg-[--color-brand-red] px-6 py-3 text-[15px] font-medium transition-colors hover:bg-[--color-brand-red-dark]"
      >
        {t("cta")} <span aria-hidden="true">↓</span>
      </a>
    </aside>
  );
}
