export const AUTH_COOKIE = "site_auth";
export const AUTH_MAX_AGE = 60 * 60 * 24 * 30;

export function authConfig() {
  const password = process.env.SITE_PASSWORD;
  const secret = process.env.SITE_AUTH_SECRET;
  if (!password || !secret) return null;
  return { password, secret };
}

function toHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let out = "";
  for (let i = 0; i < bytes.length; i++) {
    out += bytes[i].toString(16).padStart(2, "0");
  }
  return out;
}

export async function signToken(password: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(password));
  return toHex(sig);
}

export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

export function verifyPassword(candidate: string): boolean {
  const cfg = authConfig();
  if (!cfg) return false;
  return safeEqual(candidate, cfg.password);
}

export async function verifyToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const cfg = authConfig();
  if (!cfg) return false;
  const expected = await signToken(cfg.password, cfg.secret);
  return safeEqual(token, expected);
}

export async function issueToken(): Promise<string | null> {
  const cfg = authConfig();
  if (!cfg) return null;
  return signToken(cfg.password, cfg.secret);
}
