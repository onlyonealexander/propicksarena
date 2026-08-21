import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #4DE3D1 0%, #1E6E8C 100%)",
        }}
      >
        <span
          style={{
            color: "#0B1220",
            fontSize: 110,
            fontWeight: 800,
            fontFamily: "sans-serif",
            lineHeight: 1,
            transform: "translateY(-3px)",
          }}
        >
          P
        </span>
      </div>
    ),
    { ...size }
  );
}
