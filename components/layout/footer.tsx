"use client";

import React from "react";
import HalftoneWordmarkFooter from "@/components/ui/halftone-wordmark-footer";

export function Footer() {
  return (
    <HalftoneWordmarkFooter
      wordmark="saransh.exe"
      label="SARANSH.EXE"
      meta="CS STUDENT · DEVELOPER · VIBECODER · HACKATHON ENTHUSIAST"
      bio="An experimental engineering lab turning late-night ideas into working systems. Exploring agentic AI, creative interfaces, and full-stack software."
      preset="night"
      palette={{
        background: "#080808",
        ink: "#e4e4e7",
        warm: "#B9FF66",
      }}
      dotGap={6}
      radius={80}
      crop={0.16}
      grain={0.45}
      interactive={true}
      className="border-t border-white/10"
    />
  );
}

