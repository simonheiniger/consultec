import Link from "next/link";
import { useTranslations } from "next-intl";
import { localizedPath, type Locale } from "@/lib/site";

type Item = { slug: string; title: string; tagline: string; cta: string };

export default function SoftwareTeaser({ locale }: { locale: string }) {
  const t = useTranslations("softwareTeaser");
  const items = t.raw("items") as Item[];
  const l = locale as Locale;

  return (
    <section className="bg-[--color-surface] py-24">
      <div className="mx-auto max-w-[1200px] px-6">
        <h2 className="max-w-[24ch] font-[var(--font-space-grotesk)] text-[28px] font-semibold leading-tight tracking-tight text-[--color-ink] md:text-[40px]">
          {t("title")}
        </h2>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {items.map((item, idx) => (
            <Link
              key={item.slug}
              href={`${localizedPath("software", l)}#${item.slug}`}
              className="group relative overflow-hidden rounded-2xl border border-[--color-line] bg-white p-8 transition-all duration-300 hover:-translate-y-1 hover:border-[--color-brand-red] hover:shadow-[0_20px_60px_-30px_rgba(217,32,39,0.35)]"
            >
              <span
                aria-hidden="true"
                className={`absolute -right-12 -top-12 h-40 w-40 rounded-full blur-2xl transition-opacity duration-500 ${
                  idx === 0
                    ? "bg-[--color-brand-red]/15"
                    : idx === 1
                    ? "bg-[--color-brand-blue]/15"
                    : "bg-[--color-brand-gold]/20"
                }`}
              />
              <span className="font-[var(--font-space-grotesk)] text-[12px] font-semibold uppercase tracking-[0.2em] text-[--color-brand-blue]">
                {String(idx + 1).padStart(2, "0")} / 03
              </span>
              <h3 className="mt-5 font-[var(--font-space-grotesk)] text-[28px] font-semibold tracking-tight text-[--color-ink]">
                {item.title}
              </h3>
              <p className="mt-3 text-[15px] leading-relaxed text-[--color-muted]">
                {item.tagline}
              </p>
              <span className="mt-8 inline-flex items-center gap-2 text-[14px] font-medium text-[--color-brand-red]">
                {item.cta}
                <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">→</span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
