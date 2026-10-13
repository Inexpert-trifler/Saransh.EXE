import { ImageResponse } from "next/og";

export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 20,
          background: "#080808",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#B9FF66",
          fontWeight: 900,
          fontFamily: "monospace",
          borderRadius: 6,
          border: "2px solid #B9FF66",
        }}
      >
        S
      </div>
    ),
    {
      ...size,
    }
  );
}
