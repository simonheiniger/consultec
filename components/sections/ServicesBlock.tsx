import { useTranslations } from "next-intl";
import { COMPANY } from "@/lib/site";
import CTAButton from "../CTAButton";

function ServiceCard({
  title,
  tagline,
  bullets,
  accent,
}: {
  title: string;
  tagline: string;
  bullets: string[];
  accent: "red" | "blue";
}) {
  return (
    <article className="relative overflow-hidden rounded-2xl border border-[--color-line] bg-white p-8 md:p-10">
      <span
        aria-hidden="true"
        className={`absolute left-0 top-0 h-full w-[3px] ${
          accent === "red" ? "bg-[--color-brand-red]" : "bg-[--color-brand-blue]"
        }`}
      />
      <h3 className="font-[var(--font-space-grotesk)] text-[26px] font-semibold tracking-tight text-[--color-ink] md:text-[30px]">
        {title}
      </h3>
      <p className="mt-3 max-w-[52ch] text-[16px] leading-relaxed text-[--color-muted]">
        {tagline}
      </p>
      <ul className="mt-8 grid gap-3 sm:grid-cols-2">
        {bullets.map((b) => (
          <li key={b} className="flex items-start gap-3 text-[15px] leading-relaxed text-[--color-ink]">
            <span
              aria-hidden="true"
              className={`mt-[8px] h-[6px] w-[6px] shrink-0 rounded-full ${
                accent === "red" ? "bg-[--color-brand-red]" : "bg-[--color-brand-blue]"
              }`}
            />
            <span>{b}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}

export default function ServicesBlock() {
  const t = useTranslations("services");
  const sg = {
    title: t("swissgarage.title"),
    tagline: t("swissgarage.tagline"),
    bullets: t.raw("swissgarage.bullets") as string[],
  };
  const ad = {
    title: t("admin.title"),
    tagline: t("admin.tagline"),
    bullets: t.raw("admin.bullets") as string[],
  };

  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-[1200px] px-6">
        <p className="font-[var(--font-space-grotesk)] text-[12px] uppercase tracking-[0.2em] text-[--color-brand-blue]">
          {t("title")}
        </p>
        <h1 className="mt-4 max-w-[26ch] font-[var(--font-space-grotesk)] text-[40px] font-semibold leading-[1.08] tracking-tight text-[--color-ink] md:text-[60px]">
          {t("intro")}
        </h1>

        <div className="mt-16 grid gap-6 lg:grid-cols-2">
          <ServiceCard {...sg} accent="red" />
          <ServiceCard {...ad} accent="blue" />
        </div>

        <div className="mt-16 flex flex-wrap items-center gap-3">
          <CTAButton href={`mailto:${COMPANY.email}`} variant="primary" size="lg">
            E-Mail schreiben
          </CTAButton>
          <CTAButton href={`tel:${COMPANY.phoneTel}`} variant="secondary" size="lg">
            {COMPANY.phoneDisplay}
          </CTAButton>
        </div>
      </div>
    </section>
  );
}
