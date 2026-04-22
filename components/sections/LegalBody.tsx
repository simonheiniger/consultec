import { useTranslations } from "next-intl";

type Section = { heading: string; paragraphs: string[] };

type Props = { namespace: "legal.impressum" | "legal.datenschutz" };

export default function LegalBody({ namespace }: Props) {
  const t = useTranslations(namespace);
  const body = t.raw("body") as Section[];

  return (
    <section className="bg-white pb-24 pt-24">
      <div className="mx-auto max-w-[820px] px-6">
        <h1 className="font-[var(--font-space-grotesk)] text-[40px] font-semibold leading-[1.1] tracking-tight text-[--color-ink] md:text-[52px]">
          {t("title")}
        </h1>

        <div className="mt-12 space-y-12">
          {body.map((s) => (
            <section key={s.heading}>
              <h2 className="font-[var(--font-space-grotesk)] text-[22px] font-semibold tracking-tight text-[--color-ink] md:text-[26px]">
                {s.heading}
              </h2>
              <div className="mt-4 space-y-3 text-[15px] leading-relaxed text-[--color-muted] md:text-[16px]">
                {s.paragraphs.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </section>
  );
}
