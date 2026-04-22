import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import SponsoringList from "@/components/sections/SponsoringList";
import { buildPageMetadata } from "@/lib/pageMeta";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata(locale, "sponsoring", "sponsoring");
}

export default async function SponsoringPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <SponsoringList />;
}
