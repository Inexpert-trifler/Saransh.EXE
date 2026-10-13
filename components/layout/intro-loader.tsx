"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

export function IntroLoader() {
  const [loading, setLoading] = useState(true);
  const [bootText, setBootText] = useState("INITIALIZING SARANSH.EXE...");

  useEffect(() => {
    // Check if user already saw the boot sequence in this session
    const hasLoaded = sessionStorage.getItem("saransh_booted");
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (hasLoaded || prefersReducedMotion) {
      const fastTimer = setTimeout(() => setLoading(false), 0);
      return () => clearTimeout(fastTimer);
    }

    const t1 = setTimeout(() => setBootText("MOUNTING AGENT RUNTIME & SHADERS..."), 350);
    const t2 = setTimeout(() => setBootText("SYSTEM READY. BOOTING WORKSPACE."), 750);
    const t3 = setTimeout(() => {
      setLoading(false);
      sessionStorage.setItem("saransh_booted", "true");
    }, 1150);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          key="loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#080808] text-white font-mono"
        >
          {/* Subtle scanline */}
          <div className="pointer-events-none absolute inset-0 bg-grid-subtle opacity-20" />

          <div className="relative z-10 flex flex-col items-center px-6 max-w-md text-center">
            {/* Wordmark logo */}
            <div className="flex items-center gap-2 mb-6">
              <span className="h-3 w-3 rounded-sm bg-[#B9FF66] animate-pulse" />
              <span className="text-xl sm:text-2xl font-black tracking-widest text-white">
                SARANSH<span className="text-[#B9FF66]">.EXE</span>
              </span>
            </div>

            {/* Status text */}
            <p className="text-xs sm:text-sm text-zinc-400 mb-6 h-5 tracking-wide">
              {bootText}
            </p>

            {/* Fast progress bar */}
            <div className="w-48 sm:w-64 h-1 rounded-full bg-white/10 overflow-hidden">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 1.1, ease: "easeInOut" }}
                className="h-full bg-[#B9FF66] shadow-[0_0_12px_#B9FF66]"
              />
            </div>

            <span className="mt-4 text-[10px] text-zinc-600 uppercase tracking-widest">
              PORTFOLIO PROTOCOL V2.6
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
