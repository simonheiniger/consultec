# Consultec Heiniger — Rebuild

Modern, bilingual (DE / EN) Next.js rebuild of consultec.swiss, hosted on Vercel.

## Stack

- **Next.js 16** (App Router, React 19, TypeScript)
- **Tailwind CSS 4** (via `@theme` tokens — no `tailwind.config.*`)
- **next-intl 4** — DE at `/`, EN at `/en`, `localePrefix: 'as-needed'`
- **next/font** — Space Grotesk (display) + Inter (body)
- **Canvas-based hero animation** with pointer parallax and `prefers-reduced-motion` fallback
- **Leaflet + OpenStreetMap** for the contact map (no API key, dynamic import)
- **Vercel Speed Insights + Analytics** — zero config once Vercel project is connected

## Local development

```bash
npm install
cp .env.example .env.local   # fill in the three values (see below)
npm run dev
```

Then open http://localhost:3000 — the password gate will bounce you to `/login`.

## Environment variables

| Key | Required | Purpose |
| --- | --- | --- |
| `SITE_PASSWORD` | yes | Plain-text password for the preview gate. Share with the client separately (never commit). |
| `SITE_AUTH_SECRET` | yes | HMAC key for the auth cookie. Generate with `openssl rand -hex 32`. Rotating it invalidates all sessions. |
| `NEXT_PUBLIC_SITE_URL` | recommended | Canonical base URL for sitemap + metadata. Defaults to the Vercel preview URL. No trailing slash. |

Set all three in the Vercel project (Production **and** Preview environments) before deploying.

## Deployment (Vercel)

1. Push the repo to GitHub.
2. Import into Vercel — framework auto-detects as Next.js.
3. Add the three env vars above in **Settings → Environment Variables**, for both `Production` and `Preview`.
4. Turn on **Speed Insights** + **Analytics** in the Vercel dashboard.
5. First deploy → Vercel preview URL. Share URL + password with the client.

## Password gate — how it works

- Middleware (`middleware.ts`) wraps `next-intl` and intercepts every non-static request.
- Unauthenticated requests redirect to `/login?from=<path>`.
- `/api/login` (POST) verifies the password in constant time, signs an HMAC-SHA256 token, and sets an HttpOnly cookie (30-day TTL, `secure` in prod).
- The cookie is validated on every request via Web Crypto (edge-compatible, no `node:crypto`).
- Logging out: clear the `site_auth` cookie in the browser — there is no UI log-out (preview tool, not a product).

## Removing the gate (after client sign-off)

When it's time to ship publicly:

1. Delete `middleware.ts` **or** remove the auth wrapping (keep only the `createIntlMiddleware(routing)` export).
2. Delete `app/login/`, `app/api/login/`, `lib/auth.ts`.
3. Update `app/robots.ts` to allow crawling (`{ userAgent: '*', allow: '/' }`) and set `robots: { index: true, follow: true }` in `app/[locale]/layout.tsx` + `lib/pageMeta.ts`.

## Routes

```
/                  Home         (DE)    /en                Home (EN)
/dienstleistungen  Services     (DE)    /en/dienstleistungen
/software          Software     (DE)    /en/software
/referenzen        References   (DE)    /en/referenzen
/sponsoring        Sponsoring   (DE)    /en/sponsoring
/kontakt           Contact+map  (DE)    /en/kontakt
/impressum         Legal        (DE)    /en/impressum
/datenschutz       Privacy      (DE)    /en/datenschutz
```

Software anchors: `/software#swissgarage`, `/software#swissoffice`, `/software#forrergastro`.

## Project layout

```
app/
├── [locale]/           real pages + locale layout (html/body, fonts, providers, JSON-LD)
├── api/login/          POST handler for the password gate
├── login/              the lock-screen
├── globals.css         Tailwind 4 theme tokens
├── layout.tsx          minimal pass-through (required by App Router)
├── robots.ts           disallow-all while gated
├── sitemap.ts          all routes × locales with hreflang alternates
└── opengraph-image.tsx generated OG image (1200×630)

components/             UI + sections (Nav, Footer, Hero + HeroCanvas, ContactMap, sections/*)
i18n/                   next-intl routing + request config
lib/                    auth, site constants, per-page metadata helper
messages/               de.json + en.json — all copy
public/                 logo.png + static assets
```

## Content

Company facts (address, phone, hours, geo, TeamViewer download) live in `lib/site.ts`. All user-facing copy lives in `messages/de.json` + `messages/en.json` — keep both in sync.

## Credits

Site design + build: [briangantner.ch](https://briangantner.ch).
