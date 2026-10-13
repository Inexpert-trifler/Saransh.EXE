"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, CornerDownLeft } from "lucide-react";
import confetti from "canvas-confetti";
import { portfolioData } from "@/data/portfolio";

export function TerminalEasterEgg() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputVal, setInputVal] = useState("");
  const [history, setHistory] = useState<Array<{ cmd?: string; text: string; color?: string }>>([
    { text: "SARANSH.EXE [Version 2.6.0-prod]" },
    { text: "Type 'help' to view available system commands or 'exit' to quit." },
  ]);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Global listener for Ctrl+K, Cmd+K, or Backquote
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === "`" && !["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputVal.trim();
    if (!trimmed) return;

    const lower = trimmed.toLowerCase();
    const newHistory = [...history, { cmd: trimmed, text: "" }];

    switch (lower) {
      case "help":
        newHistory.push(
          { text: "AVAILABLE COMMANDS:" },
          { text: "  whoami     - Display developer identity and core specs" },
          { text: "  projects   - List flagship systems and status" },
          { text: "  skills     - View primary technology stack" },
          { text: "  contact    - Retrieve contact credentials" },
          { text: "  vibecoding - Trigger neural developer synthesis" },
          { text: "  matrix     - Toggle green matrix reality mode" },
          { text: "  clear      - Clear terminal history" },
          { text: "  exit       - Close terminal console" }
        );
        break;

      case "whoami":
        newHistory.push(
          { text: `IDENTITY: ${portfolioData.profile.name} (${portfolioData.profile.handle})` },
          { text: `ROLE: ${portfolioData.profile.tagline}` },
          { text: `LOCATION: ${portfolioData.profile.location}` },
          { text: `STATUS: ${portfolioData.profile.availability.status} [${portfolioData.profile.availability.details}]` }
        );
        break;

      case "projects": {
        newHistory.push({ text: "SYNCING LIVE REPOSITORIES FROM @Inexpert-trifler..." });
        fetch("/api/github-repositories?username=Inexpert-trifler")
          .then((r) => r.json())
          .then((data) => {
            if (data?.repositories && Array.isArray(data.repositories)) {
              const lines = data.repositories.slice(0, 10).map((r: { name: string; language: string | null; defaultBranch: string; description: string | null; fullName: string }) => ({
                text: `* ${r.name} (${r.language || "General"}) [${r.defaultBranch}] - ${r.description || r.fullName}`,
                color: "#B9FF66",
              }));
              setHistory((h) => [...h, ...lines, { text: `Total Public Repositories: ${data.totalRepositories}` }]);
            }
          })
          .catch(() => {
            setHistory((h) => [...h, { text: "Error fetching live repositories. View #work section." }]);
          });
        break;
      }

      case "skills":
        newHistory.push({
          text: `CORE TECH: ${portfolioData.technologiesMarquee.map((t) => t.name).join(", ")}`,
        });
        break;

      case "contact":
        newHistory.push(
          { text: `EMAIL: ${portfolioData.contact.email}` },
          { text: `GITHUB: https://github.com/Inexpert-trifler (@Inexpert-trifler)` },
          { text: `RESPONSE TIME: ${portfolioData.contact.responseTime}` }
        );
        break;

      case "vibecoding":
      case "easteregg":
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#B9FF66", "#38BDF8", "#F5F5F5"],
        });
        newHistory.push({
          text: ">>> VIBECODING OVERDRIVE ACTIVATED: 100% Flow State achieved! 🚀",
          color: "#B9FF66",
        });
        break;

      case "matrix":
        newHistory.push({
          text: "[SYS]: Wake up, Neo... The Matrix has you. Follow the acid-lime rabbit.",
          color: "#B9FF66",
        });
        break;

      case "clear":
        setHistory([]);
        setInputVal("");
        return;

      case "exit":
      case "quit":
        setIsOpen(false);
        setInputVal("");
        return;

      default:
        newHistory.push({
          text: `Command not recognized: '${trimmed}'. Type 'help' for available commands.`,
          color: "#F87171",
        });
    }

    setHistory(newHistory);
    setInputVal("");
  };

  return (
    <>
      {/* Terminal Modal Dialog */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Interactive Terminal Console"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
        >
          <div
            className="flex h-[480px] w-full max-w-2xl flex-col rounded-xl border border-white/15 bg-[#0c0c0c] shadow-2xl overflow-hidden font-mono text-sm"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Terminal Titlebar */}
            <div className="flex items-center justify-between border-b border-white/10 bg-[#141414] px-4 py-2.5 select-none">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500/80" />
                <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                <div className="h-3 w-3 rounded-full bg-green-500/80" />
                <span className="ml-2 text-xs text-zinc-400 font-semibold tracking-wide">
                  saransh@workspace:~ (zsh)
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[11px] text-zinc-500 hidden sm:inline">Press ESC to exit</span>
                <button
                  onClick={() => setIsOpen(false)}
                  aria-label="Close terminal"
                  className="rounded p-1 text-zinc-400 hover:bg-white/10 hover:text-white transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Terminal Body */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-2 text-zinc-300 text-xs sm:text-sm"
            >
              {history.map((item, idx) => (
                <div key={idx} className="space-y-0.5">
                  {item.cmd && (
                    <div className="flex items-center gap-2 text-[#B9FF66]">
                      <span className="text-zinc-500">saransh.exe &gt;</span>
                      <span className="font-semibold">{item.cmd}</span>
                    </div>
                  )}
                  {item.text && (
                    <p
                      className="whitespace-pre-wrap leading-relaxed"
                      style={{ color: item.color || undefined }}
                    >
                      {item.text}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Input Line */}
            <form
              onSubmit={handleCommand}
              className="flex items-center gap-2 border-t border-white/10 bg-[#111111] px-4 py-3"
            >
              <span className="text-[#B9FF66] font-bold text-sm">$&gt;</span>
              <input
                ref={inputRef}
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="type 'help', 'whoami', 'projects', 'vibecoding'..."
                className="flex-1 bg-transparent text-[#F5F5F5] placeholder-zinc-600 outline-none text-xs sm:text-sm"
                autoComplete="off"
                spellCheck="false"
              />
              <button
                type="submit"
                aria-label="Execute command"
                className="rounded p-1 text-zinc-400 hover:text-[#B9FF66] transition-colors"
              >
                <CornerDownLeft className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
