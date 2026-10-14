"use client";

import React, { useState, useEffect } from "react";
import {
  NormalizedRepository,
  RepositoryDetailApiResponse,
} from "@/lib/github-types";
import {
  X,
  ExternalLink,
  Star,
  GitFork,
  BookOpen,
  RefreshCw,
  FileText,
  Copy,
  Check,
  Calendar,
  Code2,
} from "lucide-react";
import { GithubIcon } from "@/components/ui/icons";
import { SafeMarkdown } from "@/components/ui/safe-markdown";

interface RepositoryDetailModalProps {
  repo: NormalizedRepository | null;
  displayName?: string;
  isOpen: boolean;
  onClose: () => void;
  username?: string;
}

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "#3178C6",
  JavaScript: "#F7DF1E",
  Python: "#3776AB",
  HTML: "#E34F26",
  CSS: "#1572B6",
  Shell: "#89E051",
  C: "#555555",
  "C++": "#F34B7D",
};

interface ModalContentProps {
  repo: NormalizedRepository;
  displayName?: string;
  onClose: () => void;
  username: string;
}

function RepositoryDetailModalContent({
  repo,
  displayName,
  onClose,
  username,
}: ModalContentProps) {
  const [detail, setDetail] = useState<RepositoryDetailApiResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [tab, setTab] = useState<"overview" | "readme">("overview");
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    let active = true;

    fetch(
      `/api/github-repositories/${encodeURIComponent(repo.name)}?owner=${encodeURIComponent(username)}`
    )
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch detail");
        return res.json();
      })
      .then((data: RepositoryDetailApiResponse) => {
        if (active) {
          setDetail(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [repo.name, username]);

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Prevent body scroll when modal open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const title = displayName || repo.name;
  const langColor = (repo.language && LANGUAGE_COLORS[repo.language]) || "#B9FF66";

  const formatDate = (isoString?: string) => {
    if (!isoString) return "N/A";
    try {
      return new Date(isoString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return isoString;
    }
  };

  const handleCopyClone = () => {
    navigator.clipboard.writeText(`git clone ${repo.htmlUrl}.git`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Repository specification: ${title}`}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 sm:p-5 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="flex max-h-[92vh] w-full max-w-3xl flex-col rounded-2xl border border-white/15 bg-[#0f0f12] shadow-[0_24px_80px_rgba(0,0,0,0.9)] overflow-hidden font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title Bar */}
        <div className="flex items-center justify-between border-b border-white/10 bg-[#141418] px-5 sm:px-6 py-4">
          <div className="flex items-center gap-2.5 min-w-0">
            <span
              className="h-2.5 w-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: langColor }}
            />
            <div className="min-w-0">
              <h3 className="font-mono text-sm sm:text-base font-bold text-white uppercase truncate">
                {title}
                <span className="text-[#B9FF66] font-normal ml-2 text-xs">
                  {"// REPO SPEC"}
                </span>
              </h3>
              <p className="text-[11px] font-mono text-zinc-400 truncate">
                {repo.fullName || `Inexpert-trifler/${repo.name}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0 ml-3">
            <a
              href={repo.htmlUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="flex items-center gap-1.5 rounded-lg border border-white/15 bg-[#1b1b22] px-3 py-1.5 text-xs font-mono text-white hover:border-[#B9FF66] hover:text-[#B9FF66] transition-colors"
            >
              <GithubIcon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">GitHub</span>
              <ExternalLink className="h-3 w-3" />
            </a>

            <button
              onClick={onClose}
              aria-label="Close dialog"
              className="rounded-lg border border-white/10 bg-[#1b1b22] p-1.5 text-zinc-400 hover:text-white hover:border-white/30 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center justify-between border-b border-white/10 bg-[#111115] px-5 sm:px-6 py-2.5 font-mono text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTab("overview")}
              className={`rounded-lg px-3 py-1.5 transition-all ${
                tab === "overview"
                  ? "bg-[#B9FF66] text-[#080808] font-bold shadow-[0_0_12px_rgba(185,255,102,0.35)]"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              System Overview
            </button>

            <button
              onClick={() => setTab("readme")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-all ${
                tab === "readme"
                  ? "bg-[#B9FF66] text-[#080808] font-bold shadow-[0_0_12px_rgba(185,255,102,0.35)]"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Full README</span>
              {loading && <RefreshCw className="h-3 w-3 animate-spin text-[#B9FF66]" />}
            </button>
          </div>

          <button
            onClick={handleCopyClone}
            className="hidden sm:flex items-center gap-1.5 text-[11px] text-zinc-400 hover:text-[#B9FF66] transition-colors"
            title="Copy git clone command"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3 text-[#B9FF66]" />
                <span className="text-[#B9FF66]">COPIED</span>
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                <span>CLONE CMD</span>
              </>
            )}
          </button>
        </div>

        {/* Modal Scroll Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 text-zinc-200">
          {tab === "overview" ? (
            <>
              {/* Description & Demo Banner */}
              <div className="rounded-xl border border-white/10 bg-[#141418] p-4 sm:p-5">
                <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider block mb-1">
                  {"// DESCRIPTION"}
                </span>
                <p className="text-sm sm:text-base leading-relaxed text-zinc-100 font-sans">
                  {repo.description ||
                    detail?.readme?.overview ||
                    "Public GitHub repository by Inexpert-trifler. Explore system specs, source code, and architecture on GitHub."}
                </p>

                {repo.homepage && (
                  <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                    <span className="font-mono text-xs text-zinc-400">Live Deployment:</span>
                    <a
                      href={repo.homepage}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="flex items-center gap-1 text-xs font-mono font-bold text-[#B9FF66] hover:underline"
                    >
                      <span>{repo.homepage.replace(/^https?:\/\//, "")}</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                )}
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
                <div className="rounded-xl border border-white/10 bg-[#141418] p-3">
                  <span className="text-zinc-500 text-[10px] block uppercase">PRIMARY LANGUAGE</span>
                  <div className="flex items-center gap-1.5 mt-1 font-semibold text-white">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: langColor }}
                    />
                    <span>{repo.language || "Not specified"}</span>
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-[#141418] p-3">
                  <span className="text-zinc-500 text-[10px] block uppercase">STARS & FORKS</span>
                  <div className="flex items-center gap-3 mt-1 font-semibold text-white">
                    <span className="flex items-center gap-1 text-[#B9FF66]">
                      <Star className="h-3 w-3" />
                      {repo.stars}
                    </span>
                    <span className="flex items-center gap-1 text-sky-400">
                      <GitFork className="h-3 w-3" />
                      {repo.forks}
                    </span>
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-[#141418] p-3">
                  <span className="text-zinc-500 text-[10px] block uppercase">LAST PUSHED</span>
                  <div className="flex items-center gap-1 mt-1 font-semibold text-white truncate">
                    <Calendar className="h-3 w-3 text-zinc-400 flex-shrink-0" />
                    <span className="truncate">{formatDate(repo.pushedAt || repo.updatedAt)}</span>
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-[#141418] p-3">
                  <span className="text-zinc-500 text-[10px] block uppercase">DEFAULT BRANCH</span>
                  <div className="flex items-center gap-1 mt-1 font-semibold text-white truncate">
                    <Code2 className="h-3 w-3 text-zinc-400 flex-shrink-0" />
                    <span>{repo.defaultBranch || "main"}</span>
                  </div>
                </div>
              </div>

              {/* Topics / Tags */}
              {repo.topics && repo.topics.length > 0 && (
                <div>
                  <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider block mb-2">
                    {"// TOPICS & STACK TAGS"}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {repo.topics.map((topic, i) => (
                      <span
                        key={i}
                        className="rounded-lg border border-white/10 bg-[#17171d] px-2.5 py-1 font-mono text-[11px] text-zinc-300"
                      >
                        #{topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* README Highlights / Features if parsed */}
              {detail?.readme?.features && detail.readme.features.length > 0 && (
                <div className="rounded-xl border border-white/10 bg-[#141418] p-4 sm:p-5">
                  <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider block mb-3">
                    {"// EXTRACTED FEATURES & HIGHLIGHTS"}
                  </span>
                  <ul className="space-y-2 text-xs sm:text-sm font-sans text-zinc-300">
                    {detail.readme.features.slice(0, 5).map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-[#B9FF66] mt-0.5">•</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Direct Link Action */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-white/10">
                <span className="font-mono text-xs text-zinc-400">
                  Ready to inspect the complete commit history and source code?
                </span>
                <a
                  href={repo.htmlUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-[#B9FF66] px-5 py-2.5 font-mono text-xs font-bold text-[#080808] hover:bg-[#a6ec54] transition-all shadow-[0_0_16px_rgba(185,255,102,0.3)]"
                >
                  <GithubIcon className="h-4 w-4" />
                  <span>OPEN ON GITHUB</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              {loading ? (
                <div className="py-16 text-center space-y-3 font-mono">
                  <RefreshCw className="mx-auto h-6 w-6 animate-spin text-[#B9FF66]" />
                  <p className="text-xs text-zinc-400">FETCHING REPOSITORY README FROM GITHUB...</p>
                </div>
              ) : detail?.readme?.rawMarkdown ? (
                <div className="prose prose-invert max-w-none text-sm font-sans">
                  <SafeMarkdown content={detail.readme.rawMarkdown} />
                </div>
              ) : (
                <div className="py-12 text-center space-y-2 font-mono">
                  <BookOpen className="mx-auto h-8 w-8 text-zinc-600" />
                  <p className="text-sm font-semibold text-zinc-300">No README file detected</p>
                  <p className="text-xs text-zinc-500">
                    This repository has not published a top-level README.md yet.
                  </p>
                  <div className="pt-4">
                    <a
                      href={repo.htmlUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-4 py-2 font-mono text-xs text-white hover:border-[#B9FF66] hover:text-[#B9FF66]"
                    >
                      <span>Explore files on GitHub</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function RepositoryDetailModal({
  repo,
  displayName,
  isOpen,
  onClose,
  username = "Inexpert-trifler",
}: RepositoryDetailModalProps) {
  if (!isOpen || !repo) return null;

  return (
    <RepositoryDetailModalContent
      key={repo.id}
      repo={repo}
      displayName={displayName}
      onClose={onClose}
      username={username}
    />
  );
}
