"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { COMPANY } from "@/lib/site";

const ContactMapInner = dynamic(() => import("./ContactMapInner"), {
  ssr: false,
  loading: () => (
    <div className="h-[380px] w-full animate-pulse rounded-2xl border border-[--color-line] bg-[--color-surface] md:h-[460px]" />
  ),
});

export default function ContactMap() {
  const t = useTranslations("kontakt.map");

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-[var(--font-space-grotesk)] text-[24px] font-semibold tracking-tight text-[--color-ink] md:text-[32px]">
          {t("title")}
        </h2>
        <a
          href={COMPANY.googleMapsDirections}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-[--color-line] bg-white px-5 py-2.5 text-[14px] font-medium text-[--color-ink] transition-colors hover:border-[--color-brand-red] hover:text-[--color-brand-red]"
        >
          {t("directions")} <span aria-hidden="true">↗</span>
        </a>
      </div>
      <div className="mt-6">
        <ContactMapInner ariaLabel={t("ariaLabel")} directionsLabel={t("directions")} />
      </div>
    </div>
  );
}
