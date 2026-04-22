import { useTranslations } from "next-intl";

type Accent = "red" | "blue" | "gold";

const accentMap: Record<
  Accent,
  { bar: string; dot: string; glow: string; eyebrow: string }
> = {
  red: {
    bar: "bg-[--color-brand-red]",
    dot: "bg-[--color-brand-red]",
    glow: "bg-[--color-brand-red]/15",
    eyebrow: "text-[--color-brand-red]",
  },
  blue: {
    bar: "bg-[--color-brand-blue]",
    dot: "bg-[--color-brand-blue]",
    glow: "bg-[--color-brand-blue]/15",
    eyebrow: "text-[--color-brand-blue]",
  },
  gold: {
    bar: "bg-[--color-brand-gold]",
    dot: "bg-[--color-brand-gold]",
    glow: "bg-[--color-brand-gold]/20",
    eyebrow: "text-[--color-ink]",
  },
};

type Props = {
  anchor: string;
  productKey: "swissgarage" | "swissoffice" | "forrergastro";
  accent: Accent;
  index: number;
  total: number;
};

export default function ProductBlock({ anchor, productKey, accent, index, total }: Props) {
  const t = useTranslations(`software.${productKey}`);
  const colors = accentMap[accent];
  const features = t.raw("features") as string[];

  return (
    <section
      id={anchor}
      className="relative scroll-mt-24 border-t border-[--color-line] bg-white py-24"
    >
      <span
        aria-hidden="true"
        className={`absolute -right-20 top-20 h-[320px] w-[320px] rounded-full blur-3xl ${colors.glow}`}
      />

      <div className="relative mx-auto grid max-w-[1200px] gap-12 px-6 md:grid-cols-[1.3fr_1.7fr]">
        <div>
          <p className={`font-[var(--font-space-grotesk)] text-[12px] font-semibold uppercase tracking-[0.22em] ${colors.eyebrow}`}>
            {String(index).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </p>
          <h2 className="mt-4 font-[var(--font-space-grotesk)] text-[40px] font-semibold leading-[1.05] tracking-tight text-[--color-ink] md:text-[56px]">
            {t("title")}
          </h2>
          <p className={`mt-2 font-[var(--font-space-grotesk)] text-[18px] font-medium ${colors.eyebrow}`}>
            {t("tagline")}
          </p>
          <div className="mt-6 relative">
            <span aria-hidden="true" className={`absolute left-0 top-0 h-full w-[2px] ${colors.bar}`} />
            <p className="pl-6 text-[16px] leading-relaxed text-[--color-muted] md:text-[17px]">
              {t("description")}
            </p>
          </div>
        </div>

        <ul className="grid gap-px overflow-hidden rounded-2xl border border-[--color-line] bg-[--color-line] sm:grid-cols-2">
          {features.map((f) => (
            <li
              key={f}
              className="flex items-start gap-3 bg-white p-5 text-[14px] leading-relaxed text-[--color-ink] transition-colors hover:bg-[--color-surface]"
            >
              <span aria-hidden="true" className={`mt-[7px] h-[6px] w-[6px] shrink-0 rounded-full ${colors.dot}`} />
              <span>{f}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
