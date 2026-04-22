import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";

const display = Space_Grotesk({ subsets: ["latin"], weight: ["600", "700"], display: "swap" });
const body = Inter({ subsets: ["latin"], weight: ["400", "500"], display: "swap" });

export const metadata: Metadata = {
  title: "Login — Consultec Heiniger",
  robots: { index: false, follow: false },
};

type Search = { from?: string; error?: string };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const sp = await searchParams;
  const from = typeof sp.from === "string" ? sp.from : "/";
  const hasError = sp.error === "1";

  return (
    <html lang="de">
      <body
        className={body.className}
        style={{
          minHeight: "100vh",
          margin: 0,
          background:
            "radial-gradient(1200px 800px at 70% 20%, rgba(30,84,161,0.18), transparent 60%), radial-gradient(900px 600px at 20% 80%, rgba(217,32,39,0.16), transparent 60%), #0B0E14",
          color: "#F4F5F7",
          display: "grid",
          placeItems: "center",
          padding: "2rem",
        }}
      >
        <main
          style={{
            width: "100%",
            maxWidth: 420,
            background: "rgba(11,14,20,0.72)",
            border: "1px solid rgba(244,245,247,0.08)",
            borderRadius: 16,
            padding: "2rem 1.75rem",
            backdropFilter: "blur(12px)",
          }}
        >
          <div style={{ marginBottom: "1.25rem" }}>
            <p
              className={display.className}
              style={{
                letterSpacing: "0.18em",
                fontSize: 12,
                color: "#F5B800",
                margin: 0,
                textTransform: "uppercase",
              }}
            >
              Vorschau geschützt
            </p>
            <h1
              className={display.className}
              style={{ fontSize: 28, margin: "0.4rem 0 0", lineHeight: 1.15 }}
            >
              Consultec Heiniger
            </h1>
            <p style={{ color: "#9CA3AF", fontSize: 14, margin: "0.5rem 0 0" }}>
              Diese Seite ist während der Überarbeitung passwortgeschützt.
            </p>
          </div>

          <form method="post" action="/api/login" style={{ display: "grid", gap: 14 }}>
            <input type="hidden" name="from" value={from} />
            <label style={{ display: "grid", gap: 6 }}>
              <span style={{ fontSize: 13, color: "#D1D5DB" }}>Passwort</span>
              <input
                type="password"
                name="password"
                required
                autoFocus
                autoComplete="current-password"
                style={{
                  border: "1px solid rgba(244,245,247,0.14)",
                  background: "rgba(244,245,247,0.04)",
                  color: "#F4F5F7",
                  padding: "0.75rem 0.9rem",
                  borderRadius: 10,
                  fontSize: 15,
                  outline: "none",
                }}
              />
            </label>
            {hasError ? (
              <p style={{ color: "#FCA5A5", fontSize: 13, margin: 0 }}>
                Passwort falsch. Bitte erneut versuchen.
              </p>
            ) : null}
            <button
              type="submit"
              className={display.className}
              style={{
                background: "#D92027",
                color: "#fff",
                border: "none",
                padding: "0.85rem 1rem",
                fontSize: 15,
                fontWeight: 600,
                borderRadius: 10,
                cursor: "pointer",
                letterSpacing: "0.01em",
              }}
            >
              Anmelden
            </button>
          </form>
        </main>
      </body>
    </html>
  );
}
