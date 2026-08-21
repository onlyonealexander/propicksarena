import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
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
          borderRadius: 14,
        }}
      >
        <span
          style={{
            color: "#0B1220",
            fontSize: 40,
            fontWeight: 800,
            fontFamily: "sans-serif",
            lineHeight: 1,
            transform: "translateY(-1px)",
          }}
        >
          P
        </span>
      </div>
    ),
    { ...size }
  );
}
