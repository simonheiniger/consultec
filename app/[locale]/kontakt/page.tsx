import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import ContactBlock from "@/components/sections/ContactBlock";
import ContactMap from "@/components/ContactMap";
import FernwartungCard from "@/components/sections/FernwartungCard";
import SupportHours from "@/components/sections/SupportHours";
import { buildPageMetadata } from "@/lib/pageMeta";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata(locale, "kontakt", "kontakt");
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <ContactBlock />
      <section className="bg-white py-10">
        <div className="mx-auto grid max-w-[1200px] gap-10 px-6 lg:grid-cols-[1.5fr_1fr] lg:items-start">
          <ContactMap />
          <FernwartungCard />
        </div>
      </section>
      <SupportHours />
    </>
  );
}
