import { ImageResponse } from "next/og";
import { SITE } from "@/lib/site";

export const alt = `${SITE.author} — AI & Data Science`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background: "#0E0E10",
          color: "#F2EDE4",
          fontFamily: "Georgia, 'Times New Roman', serif",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 18,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: "#E5DED1",
            fontFamily: "'Courier New', Courier, monospace",
          }}
        >
          <span>Portfolio</span>
          <span>2026</span>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <div
            style={{
              fontSize: 96,
              lineHeight: 0.95,
              letterSpacing: -3,
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontWeight: 400,
            }}
          >
            Selected work,
          </div>
          <div
            style={{
              fontSize: 96,
              lineHeight: 0.95,
              letterSpacing: -3,
              fontFamily: "Georgia, 'Times New Roman', serif",
              color: "#E85A2B",
              fontStyle: "italic",
              fontWeight: 400,
            }}
          >
            told with receipts.
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 18,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: "#E5DED1",
            fontFamily: "'Courier New', Courier, monospace",
          }}
        >
          <span>Four projects · 2026</span>
          <span>vagi.dev</span>
        </div>
      </div>
    ),
    { ...size }
  );
}