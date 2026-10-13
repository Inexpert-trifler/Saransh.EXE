"use client";

import React, { useState, useEffect } from "react";
import { portfolioData } from "@/data/portfolio";
import { Menu, X, ArrowUpRight } from "lucide-react";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("#work");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);

      // Simple active link highlight
      const sections = ["about", "work", "stack", "activity", "journey", "contact"];
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 200 && rect.bottom >= 150) {
            setActiveSection(`#${id}`);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [mobileMenuOpen]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? "border-b border-white/10 bg-[#080808]/90 py-3 backdrop-blur-md shadow-lg"
          : "bg-transparent py-5"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-12">
        {/* Brand Wordmark */}
        <a
          href="#"
          className="group flex items-center gap-2 text-base font-mono font-bold tracking-wider text-white"
        >
          <span className="flex h-2.5 w-2.5 rounded-sm bg-[#B9FF66] transition-transform group-hover:scale-125" />
          <span>
            SARANSH<span className="text-[#B9FF66]">.EXE</span>
          </span>
        </a>

        {/* Desktop Navigation Links */}
        <nav
          aria-label="Main Navigation"
          className="hidden md:flex items-center gap-1 rounded-full border border-white/10 bg-[#111111]/80 px-4 py-1.5 backdrop-blur-md"
        >
          {portfolioData.navigation.map((item) => {
            const isActive = activeSection === item.href;

            return (
              <a
                key={item.href}
                href={item.href}
                className={`relative px-3 py-1 text-xs font-mono transition-colors rounded-full ${
                  isActive
                    ? "text-[#B9FF66] font-semibold"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                {item.label}
                {item.badge && (
                  <span className="ml-1 rounded bg-[#B9FF66]/20 px-1 py-0.2 text-[9px] text-[#B9FF66]">
                    {item.badge}
                  </span>
                )}
              </a>
            );
          })}
        </nav>

        {/* Right CTA */}
        <div className="hidden sm:flex items-center gap-4">
          <a
            href="#contact"
            className="flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-mono text-white transition-all hover:border-[#B9FF66] hover:text-[#B9FF66]"
          >
            <span>GET IN TOUCH</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={mobileMenuOpen}
          className="rounded-lg border border-white/10 bg-[#111111] p-2 text-zinc-300 md:hidden hover:text-white focus:outline-none focus:ring-2 focus:ring-[#B9FF66]"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-[60px] z-50 flex flex-col bg-[#080808]/98 p-6 backdrop-blur-xl md:hidden border-t border-white/10 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-4">
            <span className="font-mono text-xs text-[#B9FF66] uppercase">
              {"// NAVIGATION PROTOCOL"}
            </span>
            <span className="font-mono text-xs text-zinc-500">
              {portfolioData.profile.availability.status}
            </span>
          </div>

          <div className="flex flex-col gap-3 font-mono text-lg">
            {portfolioData.navigation.map((item, idx) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between rounded-lg p-3 text-zinc-300 hover:bg-white/5 hover:text-[#B9FF66] transition-colors"
              >
                <span>{item.label}</span>
                <span className="text-xs text-zinc-600">0{idx + 1}</span>
              </a>
            ))}
          </div>

          <div className="mt-auto border-t border-white/10 pt-6">
            <a
              href="#contact"
              onClick={() => setMobileMenuOpen(false)}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#B9FF66] py-3 text-sm font-bold text-[#080808]"
            >
              <span>INITIATE CONTACT</span>
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
