import { ImageResponse } from "next/og";
export const alt =
  "Tape — Read the market. Connect the dots. AI-powered stock research and portfolio analysis.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "#0A0D12",
        color: "#EDF3F6",
        padding: "58px 66px",
        display: "flex",
        flexDirection: "column",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{ display: "flex", alignItems: "center", gap: 13, fontSize: 32 }}
      >
        <span
          style={{
            width: 44,
            height: 44,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#1FD18A",
            color: "#0A0D12",
            borderRadius: 10,
            fontWeight: 800,
          }}
        >
          T
        </span>
        <span>Tape</span>
        <span style={{ marginLeft: "auto", fontSize: 18, color: "#9CAEBE" }}>
          AI-powered investment research
        </span>
      </div>
      <div
        style={{
          display: "flex",
          marginTop: 65,
          fontSize: 82,
          lineHeight: 1.06,
          letterSpacing: "-4px",
          flexDirection: "column",
        }}
      >
        <span>Read the market.</span>
        <span>Connect the dots.</span>
      </div>
      <div
        style={{
          display: "flex",
          marginTop: 48,
          paddingTop: 27,
          borderTop: "1px solid #35434C",
          fontSize: 21,
          color: "#BDD0C5",
          gap: 34,
        }}
      >
        {[
          "Smart money",
          "Options flow",
          "News & catalysts",
          "Portfolio risk",
        ].map((t) => (
          <span key={t}>{t}</span>
        ))}
      </div>
      <div
        style={{
          display: "flex",
          marginTop: "auto",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: 16,
          color: "#98AABA",
        }}
      >
        <span>One connected research workspace.</span>
        <span style={{ color: "#1FD18A" }}>Explore the interactive demo</span>
      </div>
    </div>,
    size,
  );
}
