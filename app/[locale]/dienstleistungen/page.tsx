import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import ServicesBlock from "@/components/sections/ServicesBlock";
import SupportHours from "@/components/sections/SupportHours";
import { buildPageMetadata } from "@/lib/pageMeta";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata(locale, "dienstleistungen", "services");
}

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <ServicesBlock />
      <SupportHours />
    </>
  );
}
