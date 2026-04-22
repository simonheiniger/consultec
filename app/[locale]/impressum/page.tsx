import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import LegalBody from "@/components/sections/LegalBody";
import { buildPageMetadata } from "@/lib/pageMeta";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata(locale, "impressum", "impressum");
}

export default async function ImpressumPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <LegalBody namespace="legal.impressum" />;
}
