export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
  "https://consultec-rebuild.vercel.app";

export const LOCALES = ["de", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "de";

export const ROUTES = [
  "",
  "dienstleistungen",
  "software",
  "referenzen",
  "sponsoring",
  "kontakt",
  "impressum",
  "datenschutz",
] as const;

export type RouteKey = (typeof ROUTES)[number];

export function localizedPath(route: RouteKey, locale: Locale): string {
  const base = route ? `/${route}` : "/";
  return locale === DEFAULT_LOCALE ? base : `/en${base === "/" ? "" : base}`;
}

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export const BRAND = {
  red: "#D92027",
  redDark: "#B81B20",
  blue: "#1E54A1",
  blueDark: "#173F7A",
  gold: "#F5B800",
  ink: "#0B0E14",
  muted: "#6B7280",
  surface: "#F4F5F7",
};

export const COMPANY = {
  name: "Consultec Heiniger",
  legalName: "Consultec Heiniger",
  owner: "Beat Heiniger",
  email: "info@consultec.swiss",
  phoneDisplay: "052 317 00 33",
  phoneTel: "+41523170033",
  phoneAltDisplay: "077 500 50 23",
  phoneAltTel: "+41775005023",
  address: {
    street: "Poststrasse 3",
    postalCode: "8406",
    city: "Winterthur",
    country: "CH",
  },
  geo: { lat: 47.4904718, lng: 8.7062249 },
  hours: [
    "Mo-Fr 08:30-11:30",
    "Mo-Fr 13:30-17:00",
  ],
  googleMapsDirections:
    "https://www.google.com/maps/dir/?api=1&destination=Poststrasse+3%2C+8406+Winterthur%2C+Schweiz",
  quicksupportUrl:
    "https://consultec.swiss/wp-content/uploads/downloads/Software/Quicksupport.zip",
};
