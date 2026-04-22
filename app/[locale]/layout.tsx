import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { Inter, Space_Grotesk } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";
import { routing } from "@/i18n/routing";
import { COMPANY, SITE_URL, absoluteUrl, localizedPath, LOCALES } from "@/lib/site";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import "../globals.css";

const display = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});
const body = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  themeColor: "#0B0E14",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "meta.home" });

  const languages: Record<string, string> = {};
  for (const l of LOCALES) languages[l] = absoluteUrl(localizedPath("", l));
  languages["x-default"] = absoluteUrl(localizedPath("", routing.defaultLocale));

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: t("title"),
      template: `%s — ${COMPANY.name}`,
    },
    description: t("description"),
    applicationName: COMPANY.name,
    alternates: {
      canonical: absoluteUrl(localizedPath("", locale as (typeof LOCALES)[number])),
      languages,
    },
    openGraph: {
      type: "website",
      siteName: COMPANY.name,
      locale: locale === "de" ? "de_CH" : "en_US",
      title: t("title"),
      description: t("description"),
      url: absoluteUrl(localizedPath("", locale as (typeof LOCALES)[number])),
    },
    robots: { index: false, follow: false },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const messages = await getMessages();

  const localBusiness = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: COMPANY.name,
    url: SITE_URL,
    email: COMPANY.email,
    telephone: COMPANY.phoneTel,
    image: absoluteUrl("/logo.png"),
    address: {
      "@type": "PostalAddress",
      streetAddress: COMPANY.address.street,
      postalCode: COMPANY.address.postalCode,
      addressLocality: COMPANY.address.city,
      addressCountry: COMPANY.address.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: COMPANY.geo.lat,
      longitude: COMPANY.geo.lng,
    },
    openingHours: ["Mo-Fr 08:30-11:30", "Mo-Fr 13:30-17:00"],
    founder: { "@type": "Person", name: COMPANY.owner },
  };

  return (
    <html lang={locale} className={`${display.variable} ${body.variable}`}>
      <body className="bg-white text-[--color-ink] antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-[--color-brand-red] focus:px-4 focus:py-2 focus:text-white"
          >
            Skip to content
          </a>
          <Nav locale={locale} />
          <main id="main">{children}</main>
          <Footer locale={locale} />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusiness) }}
          />
        </NextIntlClientProvider>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
