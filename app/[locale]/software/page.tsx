import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import ProductBlock from "@/components/sections/ProductBlock";
import SystemsTable from "@/components/sections/SystemsTable";
import { buildPageMetadata } from "@/lib/pageMeta";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata(locale, "software", "software");
}

export default async function SoftwarePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("software");

  return (
    <>
      <section className="bg-white pb-6 pt-24">
        <div className="mx-auto max-w-[1200px] px-6">
          <p className="font-[var(--font-space-grotesk)] text-[12px] uppercase tracking-[0.2em] text-[--color-brand-blue]">
            {t("title")}
          </p>
          <h1 className="mt-4 max-w-[30ch] font-[var(--font-space-grotesk)] text-[40px] font-semibold leading-[1.05] tracking-tight text-[--color-ink] md:text-[60px]">
            {t("intro")}
          </h1>
        </div>
      </section>

      <ProductBlock anchor="swissgarage" productKey="swissgarage" accent="red" index={1} total={3} />
      <ProductBlock anchor="swissoffice" productKey="swissoffice" accent="blue" index={2} total={3} />
      <ProductBlock anchor="forrergastro" productKey="forrergastro" accent="gold" index={3} total={3} />
      <SystemsTable />
    </>
  );
}
