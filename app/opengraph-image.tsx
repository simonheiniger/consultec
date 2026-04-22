import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Consultec Heiniger — Software, Schulung, Support";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          color: "#F4F5F7",
          fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif",
          backgroundColor: "#0B0E14",
          backgroundImage:
            "radial-gradient(1200px 800px at 85% 20%, rgba(30,84,161,0.45), transparent 60%), radial-gradient(900px 600px at 10% 90%, rgba(217,32,39,0.55), transparent 60%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 20,
              height: 20,
              borderRadius: 999,
              backgroundColor: "#D92027",
            }}
          />
          <div
            style={{
              display: "flex",
              fontSize: 22,
              letterSpacing: 6,
              textTransform: "uppercase",
              color: "#F5B800",
            }}
          >
            Consultec · Winterthur
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div
            style={{
              display: "flex",
              fontSize: 76,
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: -1.2,
            }}
          >
            Software, Schulung und Support für Werkstatt, Handwerk, Gastro.
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 26,
              color: "rgba(244,245,247,0.78)",
            }}
          >
            SwissGarage · SwissOffice · ForrerGastro
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 20,
            color: "rgba(244,245,247,0.6)",
          }}
        >
          <div style={{ display: "flex" }}>consultec.swiss</div>
          <div style={{ display: "flex" }}>052 317 00 33 · info@consultec.swiss</div>
        </div>
      </div>
    ),
    size,
  );
}
