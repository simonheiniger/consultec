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
  return buildPageMetadata(locale, "datenschutz", "datenschutz");
}

export default async function DatenschutzPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <LegalBody namespace="legal.datenschutz" />;
}
