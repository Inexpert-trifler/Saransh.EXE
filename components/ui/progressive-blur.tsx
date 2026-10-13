"use client";

import React from "react";

interface ProgressiveBlurProps {
  className?: string;
  direction?: "left" | "right" | "top" | "bottom";
  backgroundColor?: string;
}

export function ProgressiveBlur({
  className = "",
  direction = "right",
  backgroundColor = "#080808",
}: ProgressiveBlurProps) {
  const getGradient = () => {
    switch (direction) {
      case "left":
        return `linear-gradient(to right, ${backgroundColor} 0%, transparent 100%)`;
      case "right":
        return `linear-gradient(to left, ${backgroundColor} 0%, transparent 100%)`;
      case "top":
        return `linear-gradient(to bottom, ${backgroundColor} 0%, transparent 100%)`;
      case "bottom":
        return `linear-gradient(to top, ${backgroundColor} 0%, transparent 100%)`;
    }
  };

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute z-10 ${className}`}
      style={{
        background: getGradient(),
      }}
    />
  );
}
