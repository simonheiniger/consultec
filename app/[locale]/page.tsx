import { setRequestLocale } from "next-intl/server";
import Hero from "@/components/Hero";
import PillarsGrid from "@/components/sections/PillarsGrid";
import SoftwareTeaser from "@/components/sections/SoftwareTeaser";
import ServicesTeaser from "@/components/sections/ServicesTeaser";
import ReferencesPreview from "@/components/sections/ReferencesPreview";
import SupportHours from "@/components/sections/SupportHours";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Hero locale={locale} />
      <PillarsGrid />
      <SoftwareTeaser locale={locale} />
      <ServicesTeaser locale={locale} />
      <ReferencesPreview locale={locale} />
      <SupportHours />
    </>
  );
}
