import { NextResponse } from "next/server";
import { AUTH_COOKIE, AUTH_MAX_AGE, issueToken, verifyPassword } from "@/lib/auth";

export async function POST(req: Request) {
  const form = await req.formData();
  const password = String(form.get("password") ?? "");
  const from = String(form.get("from") ?? "/");

  if (!verifyPassword(password)) {
    const url = new URL("/login", req.url);
    url.searchParams.set("error", "1");
    if (from && from !== "/") url.searchParams.set("from", from);
    return NextResponse.redirect(url, { status: 303 });
  }

  const token = await issueToken();
  if (!token) {
    const url = new URL("/login", req.url);
    url.searchParams.set("error", "config");
    return NextResponse.redirect(url, { status: 303 });
  }

  const target = from.startsWith("/") ? from : "/";
  const res = NextResponse.redirect(new URL(target, req.url), { status: 303 });
  res.cookies.set({
    name: AUTH_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: AUTH_MAX_AGE,
  });
  return res;
}
