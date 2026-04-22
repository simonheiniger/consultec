import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { LOCALES, type Locale, type RouteKey, absoluteUrl, localizedPath } from "./site";

type MetaKey =
  | "home"
  | "services"
  | "software"
  | "references"
  | "sponsoring"
  | "kontakt"
  | "impressum"
  | "datenschutz";

export async function buildPageMetadata(
  locale: string,
  route: RouteKey,
  metaKey: MetaKey,
): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: `meta.${metaKey}` });
  const languages: Record<string, string> = {};
  for (const l of LOCALES) languages[l] = absoluteUrl(localizedPath(route, l));
  languages["x-default"] = absoluteUrl(localizedPath(route, "de"));

  const canonical = absoluteUrl(localizedPath(route, locale as Locale));

  return {
    title: t("title"),
    description: t("description"),
    alternates: { canonical, languages },
    openGraph: {
      title: t("title"),
      description: t("description"),
      url: canonical,
      type: "website",
      locale: locale === "de" ? "de_CH" : "en_US",
    },
    robots: { index: false, follow: false },
  };
}
