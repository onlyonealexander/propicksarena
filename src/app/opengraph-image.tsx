import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 28,
          background: "linear-gradient(135deg, #0B1220 0%, #0F1B2C 60%, #10222B 100%)",
        }}
      >
        <div
          style={{
            display: "flex",
            width: 140,
            height: 140,
            borderRadius: 32,
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg, #4DE3D1 0%, #1E6E8C 100%)",
          }}
        >
          <span style={{ color: "#0B1220", fontSize: 88, fontWeight: 800, fontFamily: "sans-serif" }}>P</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
          <div style={{ display: "flex", fontSize: 64, fontWeight: 800, color: "#F3F6F8", fontFamily: "sans-serif", letterSpacing: -1 }}>
            PROPICKS <span style={{ color: "#4DE3D1", marginLeft: 16 }}>ARENA</span>
          </div>
          <div style={{ display: "flex", fontSize: 26, color: "#8FA3AE", fontFamily: "sans-serif" }}>
            Real fixtures. Real settlement. Bet with confidence.
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
