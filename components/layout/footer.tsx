"use client";

import React from "react";
import { portfolioData } from "@/data/portfolio";
import { ArrowUp, Mail, Terminal } from "lucide-react";
import { GithubIcon, LinkedinIcon, TwitterIcon } from "@/components/ui/icons";

export function Footer() {
  const currentYear = 2026;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="border-t border-white/10 bg-[#080808] px-4 sm:px-6 lg:px-12 pt-16 pb-12 font-mono">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start justify-between border-b border-white/10 pb-12">
          {/* Col 1: Wordmark & Statement */}
          <div className="md:col-span-6 space-y-4">
            <div className="flex items-center gap-2 text-xl font-bold text-white tracking-wider">
              <span className="h-3 w-3 rounded-sm bg-[#B9FF66]" />
              <span>
                SARANSH<span className="text-[#B9FF66]">.EXE</span>
              </span>
            </div>
            <p className="text-xs text-[#A1A1AA] max-w-md leading-relaxed font-sans">
              An experimental personal engineering laboratory exploring the intersection of creative web interfaces, agentic AI pipelines, and products that deliver immediate value.
            </p>
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <span className="h-2 w-2 rounded-full bg-[#B9FF66] animate-pulse" />
              <span>{portfolioData.profile.availability.status}</span>
              <span className="text-zinc-600">·</span>
              <span className="text-zinc-500">{portfolioData.profile.location}</span>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="md:col-span-3 space-y-3">
            <span className="text-xs text-zinc-500 uppercase tracking-wider">{"// DIRECTORY"}</span>
            <div className="flex flex-col space-y-2 text-xs text-zinc-400">
              {portfolioData.navigation.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="hover:text-[#B9FF66] transition-colors w-max"
                >
                  &gt; {item.label}
                </a>
              ))}
            </div>
          </div>

          {/* Col 3: Social Connections & Back to Top */}
          <div className="md:col-span-3 space-y-4">
            <span className="text-xs text-zinc-500 uppercase tracking-wider">{"// TRANSMISSION"}</span>
            <div className="flex items-center gap-2">
              <a
                href="https://github.com/Inexpert-trifler"
                target="_blank"
                rel="noreferrer noopener"
                aria-label="GitHub profile"
                className="rounded-lg border border-white/10 bg-[#111111] p-2.5 text-zinc-400 hover:border-[#B9FF66] hover:text-[#B9FF66] transition-all"
              >
                <GithubIcon className="h-4 w-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer noopener"
                aria-label="LinkedIn profile"
                className="rounded-lg border border-white/10 bg-[#111111] p-2.5 text-zinc-400 hover:border-[#B9FF66] hover:text-[#B9FF66] transition-all"
              >
                <LinkedinIcon className="h-4 w-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer noopener"
                aria-label="Twitter / X profile"
                className="rounded-lg border border-white/10 bg-[#111111] p-2.5 text-zinc-400 hover:border-[#B9FF66] hover:text-[#B9FF66] transition-all"
              >
                <TwitterIcon className="h-4 w-4" />
              </a>
              <a
                href={`mailto:${portfolioData.contact.email}`}
                aria-label="Direct email link"
                className="rounded-lg border border-white/10 bg-[#111111] p-2.5 text-zinc-400 hover:border-[#B9FF66] hover:text-[#B9FF66] transition-all"
              >
                <Mail className="h-4 w-4" />
              </a>
            </div>

            <button
              onClick={scrollToTop}
              className="group mt-4 flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-zinc-400 hover:border-[#B9FF66] hover:text-[#B9FF66] transition-all"
            >
              <span>RETURN TO TOP</span>
              <ArrowUp className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-1" />
            </button>
          </div>
        </div>

        {/* Bottom signoff strip */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <Terminal className="h-3.5 w-3.5 text-[#B9FF66]" />
            <span>BUILT WITH INTENT & NEXT.JS 16 · ALL SYSTEMS NOMINAL</span>
          </div>

          <div>
            <span>&copy; {currentYear} {portfolioData.profile.name}. ALL RIGHTS RESERVED.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
