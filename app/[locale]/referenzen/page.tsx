import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import ReferencesGrid from "@/components/sections/ReferencesGrid";
import { buildPageMetadata } from "@/lib/pageMeta";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata(locale, "referenzen", "references");
}

export default async function ReferencesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ReferencesGrid />;
}
