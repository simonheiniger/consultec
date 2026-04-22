import createIntlMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";
import { AUTH_COOKIE, authConfig, verifyToken } from "./lib/auth";

const intl = createIntlMiddleware(routing);

const STATIC_FILE = /\.[a-zA-Z0-9]+$/;
const BYPASS_PREFIXES = [
  "/login",
  "/api/login",
  "/_next",
  "/_vercel",
  "/favicon.ico",
  "/icon.png",
  "/apple-icon.png",
  "/logo.png",
  "/robots.txt",
  "/sitemap.xml",
];

function shouldBypass(pathname: string): boolean {
  if (STATIC_FILE.test(pathname)) return true;
  return BYPASS_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export default async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  if (shouldBypass(pathname)) {
    return NextResponse.next();
  }

  if (!authConfig()) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    return NextResponse.redirect(url);
  }

  const token = req.cookies.get(AUTH_COOKIE)?.value;
  const ok = await verifyToken(token);
  if (!ok) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("from", pathname + search);
    return NextResponse.redirect(url);
  }

  return intl(req);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
