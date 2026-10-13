"use client";

import React, { useState, useEffect, useMemo, useTransition } from "react";
import {
  NormalizedRepository,
  RepositoriesApiResponse,
  RepositoryDetailApiResponse,
} from "@/lib/github-types";
import {
  ArrowUpRight,
  ExternalLink,
  X,
  CheckCircle2,
  Search,
  Star,
  GitFork,
  BookOpen,
  RefreshCw,
  AlertCircle,
  FileText,
  SlidersHorizontal,
} from "lucide-react";
import { GithubIcon } from "@/components/ui/icons";
import { SafeMarkdown } from "@/components/ui/safe-markdown";

interface ProjectsSectionProps {
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

export function ProjectsSection({ username = "Inexpert-trifler" }: ProjectsSectionProps) {
  const [data, setData] = useState<RepositoriesApiResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Controls
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("All");
  const [selectedFilter, setSelectedFilter] = useState<"All" | "Original" | "Forks">("All");
  const [sortBy, setSortBy] = useState<"updated" | "stars" | "name">("updated");

  // Modal State
  const [activeModalRepo, setActiveModalRepo] = useState<NormalizedRepository | null>(null);
  const [modalDetail, setModalDetail] = useState<RepositoryDetailApiResponse | null>(null);
  const [modalLoading, setModalLoading] = useState<boolean>(false);
  const [modalTab, setModalTab] = useState<"overview" | "readme">("overview");

  const [, startTransition] = useTransition();

  const fetchRepositories = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/github-repositories?username=${encodeURIComponent(username)}`);
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `HTTP ${res.status}: Failed to fetch repositories.`);
      }
      const json: RepositoriesApiResponse = await res.json();
      startTransition(() => {
        setData(json);
        setLoading(false);
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to connect to GitHub repositories API.");
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const res = await fetch(`/api/github-repositories?username=${encodeURIComponent(username)}`);
        if (!res.ok) {
          const errJson = await res.json().catch(() => ({}));
          throw new Error(errJson.error || `HTTP ${res.status}: Failed to fetch repositories.`);
        }
        const json: RepositoriesApiResponse = await res.json();
        if (!ignore) {
          setData(json);
          setLoading(false);
        }
      } catch (err: unknown) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : "Failed to connect to GitHub API.");
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      ignore = true;
    };
  }, [username]);

  // Load single repo detail and README on modal open
  const openModal = async (repo: NormalizedRepository) => {
    setActiveModalRepo(repo);
    setModalDetail(null);
    setModalLoading(true);
    setModalTab("overview");

    try {
      const res = await fetch(
        `/api/github-repositories/${encodeURIComponent(repo.name)}?owner=${encodeURIComponent(username)}`
      );
      if (res.ok) {
        const detail: RepositoryDetailApiResponse = await res.json();
        setModalDetail(detail);
      }
    } catch {
      // Graceful fallback to repo metadata if detail route fails
    } finally {
      setModalLoading(false);
    }
  };

  const closeModal = () => {
    setActiveModalRepo(null);
    setModalDetail(null);
  };

  // Available Languages list for filter bar
  const availableLanguages = useMemo(() => {
    if (!data) return ["All"];
    const langs = Array.from(
      new Set(data.repositories.map((r) => r.language).filter(Boolean) as string[])
    );
    return ["All", ...langs];
  }, [data]);

  // Filtered and Sorted repositories
  const filteredRepositories = useMemo(() => {
    if (!data) return [];
    let list = [...data.repositories];

    // 1. Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          (r.description && r.description.toLowerCase().includes(q)) ||
          r.topics.some((t) => t.toLowerCase().includes(q))
      );
    }

    // 2. Language Filter
    if (selectedLanguage !== "All") {
      list = list.filter((r) => r.language === selectedLanguage);
    }

    // 3. Forks / Original Filter
    if (selectedFilter === "Original") {
      list = list.filter((r) => !r.isFork);
    } else if (selectedFilter === "Forks") {
      list = list.filter((r) => r.isFork);
    }

    // 4. Sorting
    list.sort((a, b) => {
      if (sortBy === "stars") {
        return b.stars - a.stars;
      }
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      }
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

    return list;
  }, [data, searchQuery, selectedLanguage, selectedFilter, sortBy]);

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return isoString;
    }
  };

  return (
    <section id="work" className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-12 border-b border-white/10 scroll-mt-24">
      <div className="mx-auto max-w-7xl">
        {/* Header & Stats Banner */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#B9FF66]">
                {"// 02 · REPOSITORIES & SHIPPED SYSTEMS"}
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-[#B9FF66] animate-pulse" />
            </div>
            <h2 className="mt-2 text-3xl sm:text-5xl font-black tracking-tight text-white uppercase">
              SELECTED PROJECTS
            </h2>
            <div className="mt-2 h-1 w-12 bg-[#B9FF66]" />
          </div>

          {/* Quick Metrics from Real GitHub API */}
          {data && (
            <div className="flex flex-wrap items-center gap-4 font-mono text-xs">
              <div className="rounded-xl border border-white/10 bg-[#111111] px-4 py-2">
                <span className="text-zinc-500 block text-[10px] uppercase">PUBLIC REPOSITORIES</span>
                <span className="text-white font-bold text-sm">{data.totalRepositories}</span>
              </div>
              <div className="rounded-xl border border-white/10 bg-[#111111] px-4 py-2">
                <span className="text-zinc-500 block text-[10px] uppercase">TOTAL STARS</span>
                <span className="text-[#B9FF66] font-bold text-sm">{data.totalStars}</span>
              </div>
              <div className="rounded-xl border border-white/10 bg-[#111111] px-4 py-2">
                <span className="text-zinc-500 block text-[10px] uppercase">TOTAL FORKS</span>
                <span className="text-[#38BDF8] font-bold text-sm">{data.totalForks}</span>
              </div>
            </div>
          )}
        </div>

        {/* Filter & Search Bar */}
        <div className="mb-8 space-y-4 rounded-2xl border border-white/10 bg-[#111111] p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search real repositories by name, topic, or description..."
                className="w-full rounded-xl border border-white/10 bg-[#171717] pl-10 pr-4 py-2 text-xs sm:text-sm text-white placeholder-zinc-500 focus:border-[#B9FF66] focus:outline-none focus:ring-1 focus:ring-[#B9FF66] font-mono"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <SlidersHorizontal className="h-4 w-4 text-zinc-500 hidden sm:block" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "updated" | "stars" | "name")}
                aria-label="Sort repositories"
                className="w-full sm:w-auto rounded-xl border border-white/10 bg-[#171717] px-3.5 py-2 text-xs font-mono text-zinc-300 focus:border-[#B9FF66] focus:outline-none"
              >
                <option value="updated">Recently Updated</option>
                <option value="stars">Most Stars</option>
                <option value="name">Alphabetical (A-Z)</option>
              </select>

              <button
                onClick={fetchRepositories}
                disabled={loading}
                title="Refresh GitHub repositories"
                aria-label="Refresh GitHub repositories"
                className="rounded-xl border border-white/10 bg-[#171717] p-2 text-zinc-400 hover:border-[#B9FF66] hover:text-[#B9FF66] transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-[#B9FF66]" : ""}`} />
              </button>
            </div>
          </div>

          {/* Language and Category Badges */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/5">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-mono text-zinc-500 mr-1">LANG:</span>
              {availableLanguages.map((lang) => (
                <button
                  key={lang}
                  onClick={() => setSelectedLanguage(lang)}
                  className={`rounded-lg px-2.5 py-1 font-mono text-[11px] transition-all ${
                    selectedLanguage === lang
                      ? "bg-[#B9FF66] text-[#080808] font-bold shadow-[0_0_10px_rgba(185,255,102,0.3)]"
                      : "border border-white/10 bg-[#171717] text-zinc-400 hover:border-white/20 hover:text-white"
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5">
              {(["All", "Original", "Forks"] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setSelectedFilter(filter)}
                  className={`rounded-lg px-2.5 py-1 font-mono text-[11px] transition-all ${
                    selectedFilter === filter
                      ? "bg-white/20 text-white font-bold"
                      : "border border-white/10 bg-[#171717] text-zinc-400 hover:text-white"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Loading State: Skeletons */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="animate-pulse rounded-2xl border border-white/10 bg-[#111111] p-6 space-y-4"
              >
                <div className="flex justify-between items-center">
                  <div className="h-5 w-20 rounded bg-white/10" />
                  <div className="h-4 w-16 rounded bg-white/10" />
                </div>
                <div className="h-6 w-3/4 rounded bg-white/10" />
                <div className="h-12 w-full rounded bg-white/5" />
                <div className="flex gap-2">
                  <div className="h-5 w-16 rounded bg-white/10" />
                  <div className="h-5 w-16 rounded bg-white/10" />
                </div>
                <div className="h-8 w-full rounded bg-white/5 mt-4" />
              </div>
            ))}
          </div>
        )}

        {/* Error State: Honest Recovery Card */}
        {!loading && error && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-8 text-center space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/20 text-red-400">
              <AlertCircle className="h-6 w-6" />
            </div>
            <h3 className="font-mono text-lg font-bold text-white uppercase">
              Unable to Load GitHub Repositories
            </h3>
            <p className="mx-auto max-w-lg text-sm text-zinc-300 font-sans">{error}</p>
            <div className="pt-2">
              <button
                onClick={fetchRepositories}
                className="inline-flex items-center gap-2 rounded-xl bg-[#B9FF66] px-5 py-2.5 font-mono text-xs font-bold text-[#080808] hover:bg-[#a3e635] transition-all"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>RETRY GITHUB CONNECTION</span>
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredRepositories.length === 0 && (
          <div className="rounded-2xl border border-white/10 bg-[#111111] p-12 text-center space-y-3 font-mono">
            <BookOpen className="mx-auto h-8 w-8 text-zinc-600" />
            <h3 className="text-base font-bold text-white uppercase">No Repositories Match Filters</h3>
            <p className="text-xs text-zinc-400">
              Try adjusting your search query, language selection, or filter mode.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedLanguage("All");
                setSelectedFilter("All");
              }}
              className="mt-2 text-xs font-semibold text-[#B9FF66] underline hover:text-[#a3e635]"
            >
              Reset all filters
            </button>
          </div>
        )}

        {/* Real Projects Grid */}
        {!loading && !error && filteredRepositories.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRepositories.map((repo, index) => {
              const langColor =
                (repo.language && LANGUAGE_COLORS[repo.language]) || "#B9FF66";
              const isWide = index === 0 && selectedLanguage === "All" && !searchQuery;

              return (
                <div
                  key={repo.id}
                  className={`group relative flex flex-col rounded-2xl border border-white/10 bg-[#111111] p-6 transition-all duration-300 hover:border-[#B9FF66]/50 hover:bg-[#141414] hover:shadow-2xl ${
                    isWide ? "md:col-span-2 lg:col-span-2" : ""
                  }`}
                >
                  {/* Top Badges */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      {repo.language ? (
                        <span
                          className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-mono font-semibold"
                          style={{
                            backgroundColor: `${langColor}18`,
                            color: langColor,
                            border: `1px solid ${langColor}40`,
                          }}
                        >
                          <span
                            className="h-1.5 w-1.5 rounded-full"
                            style={{ backgroundColor: langColor }}
                          />
                          {repo.language}
                        </span>
                      ) : (
                        <span className="rounded-full bg-white/5 border border-white/10 px-2.5 py-1 text-[11px] font-mono text-zinc-400">
                          General
                        </span>
                      )}

                      {repo.isFork && (
                        <span className="rounded-full bg-white/5 border border-white/10 px-2 py-0.5 text-[10px] font-mono text-zinc-400">
                          Fork
                        </span>
                      )}

                      {repo.isArchived && (
                        <span className="rounded-full bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 text-[10px] font-mono text-amber-300">
                          Archived
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 font-mono text-xs text-zinc-500">
                      {repo.stars > 0 && (
                        <span className="flex items-center gap-1 text-amber-300">
                          <Star className="h-3 w-3 fill-amber-300" />
                          {repo.stars}
                        </span>
                      )}
                      {repo.forks > 0 && (
                        <span className="flex items-center gap-1 text-sky-300">
                          <GitFork className="h-3 w-3" />
                          {repo.forks}
                        </span>
                      )}
                      <span>{formatDate(repo.updatedAt)}</span>
                    </div>
                  </div>

                  {/* Title */}
                  <div className="mb-3">
                    <h3 className="text-2xl font-bold tracking-tight text-white group-hover:text-[#B9FF66] transition-colors break-words">
                      {repo.name}
                    </h3>
                    <p className="mt-1 text-xs font-mono text-zinc-500 truncate">
                      {repo.fullName}
                    </p>
                  </div>

                  {/* Description: Truthful or README overview excerpt */}
                  <p className="text-sm text-[#A1A1AA] leading-relaxed mb-6 flex-1 font-sans line-clamp-3">
                    {repo.description ||
                      repo.readmeSummary?.overview ||
                      "Public repository authored on GitHub. Explore repository specs and source code."}
                  </p>

                  {/* Topics or Tech Badges */}
                  {repo.topics.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-6">
                      {repo.topics.map((topic, tIdx) => (
                        <span
                          key={tIdx}
                          className="rounded bg-white/5 px-2 py-0.5 font-mono text-[11px] text-zinc-300 border border-white/5"
                        >
                          #{topic}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Card Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <button
                      onClick={() => openModal(repo)}
                      className="flex items-center gap-1.5 font-mono text-xs font-semibold text-[#B9FF66] hover:underline"
                    >
                      <span>DEEP DIVE & SPECS</span>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </button>

                    <div className="flex items-center gap-2">
                      <a
                        href={repo.htmlUrl}
                        target="_blank"
                        rel="noreferrer noopener"
                        aria-label={`View ${repo.name} on GitHub`}
                        className="rounded-lg border border-white/10 bg-[#171717] p-2 text-zinc-400 hover:border-white/30 hover:text-white transition-colors"
                      >
                        <GithubIcon className="h-4 w-4" />
                      </a>
                      {repo.homepage && (
                        <a
                          href={repo.homepage}
                          target="_blank"
                          rel="noreferrer noopener"
                          aria-label={`Live demo for ${repo.name}`}
                          className="rounded-lg border border-white/10 bg-[#171717] p-2 text-[#B9FF66] hover:border-[#B9FF66] hover:bg-[#B9FF66]/10 transition-colors"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Project Deep Dive Modal */}
      {activeModalRepo && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Repository specification: ${activeModalRepo.name}`}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div
            className="flex max-h-[90vh] w-full max-w-3xl flex-col rounded-2xl border border-white/15 bg-[#111111] shadow-2xl overflow-hidden font-sans"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Titlebar */}
            <div className="flex items-center justify-between border-b border-white/10 bg-[#171717] px-6 py-4">
              <div className="flex items-center gap-2 font-mono text-xs">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{
                    backgroundColor:
                      (activeModalRepo.language &&
                        LANGUAGE_COLORS[activeModalRepo.language]) ||
                      "#B9FF66",
                  }}
                />
                <span className="font-bold text-white uppercase truncate max-w-[280px] sm:max-w-md">
                  {activeModalRepo.name}
                  {" // SYSTEM SPECIFICATION"}
                </span>
              </div>
              <button
                onClick={closeModal}
                aria-label="Close modal"
                className="rounded-lg p-1 text-zinc-400 hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Navigation Tabs in Modal Header */}
            <div className="flex items-center gap-2 border-b border-white/10 bg-[#141414] px-6 py-2.5 font-mono text-xs">
              <button
                onClick={() => setModalTab("overview")}
                className={`rounded-lg px-3 py-1.5 transition-colors ${
                  modalTab === "overview"
                    ? "bg-[#B9FF66] text-[#080808] font-bold"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                System Overview
              </button>
              {modalDetail?.readme && (
                <button
                  onClick={() => setModalTab("readme")}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-colors ${
                    modalTab === "readme"
                      ? "bg-[#B9FF66] text-[#080808] font-bold"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span>Full README</span>
                </button>
              )}
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {modalLoading ? (
                <div className="py-16 text-center space-y-3 font-mono">
                  <RefreshCw className="mx-auto h-6 w-6 animate-spin text-[#B9FF66]" />
                  <p className="text-xs text-zinc-400">
                    Inspecting repository tree & extracting README...
                  </p>
                </div>
              ) : modalTab === "overview" ? (
                <>
                  {/* Repo Title & Meta */}
                  <div>
                    <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-[#B9FF66] uppercase mb-1">
                      <span>{activeModalRepo.language || "Multi-Language"}</span>
                      <span>·</span>
                      <span>Branch: {activeModalRepo.defaultBranch}</span>
                      <span>·</span>
                      <span>Updated {formatDate(activeModalRepo.updatedAt)}</span>
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-black text-white">
                      {activeModalRepo.name}
                    </h3>
                    <p className="text-sm font-mono text-zinc-400 mt-1">
                      {activeModalRepo.fullName}
                    </p>
                  </div>

                  {/* Architecture / Overview */}
                  <div>
                    <h4 className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-2">
                      ARCHITECTURAL OVERVIEW
                    </h4>
                    <p className="text-sm text-zinc-300 leading-relaxed font-sans">
                      {modalDetail?.readme?.overview ||
                        activeModalRepo.description ||
                        "No structured overview declared in repository. Source code is actively hosted on GitHub."}
                    </p>
                  </div>

                  {/* Features if extracted from README */}
                  {modalDetail?.readme?.features && modalDetail.readme.features.length > 0 && (
                    <div>
                      <h4 className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-3">
                        EXTRACTED CAPABILITIES & FEATURES
                      </h4>
                      <div className="space-y-2">
                        {modalDetail.readme.features.map((feat, fIdx) => (
                          <div
                            key={fIdx}
                            className="flex items-start gap-2.5 text-xs sm:text-sm text-zinc-300"
                          >
                            <CheckCircle2 className="h-4 w-4 shrink-0 text-[#B9FF66] mt-0.5" />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Architecture section if present */}
                  {modalDetail?.readme?.architecture && (
                    <div>
                      <h4 className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-2">
                        SYSTEM ARCHITECTURE & WORKFLOW
                      </h4>
                      <div className="rounded-xl border border-white/10 bg-[#171717] p-4 text-xs sm:text-sm text-zinc-300 font-sans leading-relaxed">
                        {modalDetail.readme.architecture}
                      </div>
                    </div>
                  )}

                  {/* Installation / Getting Started if present */}
                  {modalDetail?.readme?.installation && (
                    <div>
                      <h4 className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-2">
                        GETTING STARTED & INSTALLATION
                      </h4>
                      <SafeMarkdown content={modalDetail.readme.installation} />
                    </div>
                  )}

                  {/* Screenshots gallery if found in README */}
                  {modalDetail?.readme?.screenshots &&
                    modalDetail.readme.screenshots.length > 0 && (
                      <div>
                        <h4 className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-3">
                          SCREENSHOTS & ASSETS
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {modalDetail.readme.screenshots.map((s, sIdx) => (
                            <div
                              key={sIdx}
                              className="overflow-hidden rounded-xl border border-white/10 bg-[#171717]"
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={s.url}
                                alt={s.alt}
                                loading="lazy"
                                className="w-full max-h-48 object-cover"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = "none";
                                }}
                              />
                              <div className="p-2 text-[11px] font-mono text-zinc-400 truncate">
                                {s.alt}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Topics and Technologies */}
                  <div>
                    <h4 className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-2">
                      DISCOVERED TECHNOLOGIES & TOPICS
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {activeModalRepo.language && (
                        <span className="rounded-md border border-[#B9FF66]/30 bg-[#B9FF66]/10 px-2.5 py-1 text-xs font-mono text-[#B9FF66]">
                          {activeModalRepo.language}
                        </span>
                      )}
                      {activeModalRepo.topics.map((t, idx) => (
                        <span
                          key={`topic-${idx}`}
                          className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-mono text-white"
                        >
                          #{t}
                        </span>
                      ))}
                      {modalDetail?.readme?.technologies.map((t, idx) => (
                        <span
                          key={`tech-${idx}`}
                          className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-mono text-zinc-300"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Missing README Notice */}
                  {!modalDetail?.readmeAvailable && (
                    <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-xs font-mono text-zinc-400">
                      ℹ No README.md file detected in this repository. Repository metadata is shown directly from GitHub API.
                    </div>
                  )}
                </>
              ) : (
                /* Full Markdown View */
                <div>
                  {modalDetail?.readme ? (
                    <SafeMarkdown content={modalDetail.readme.rawMarkdown} />
                  ) : (
                    <p className="font-mono text-xs text-zinc-400">
                      No README available for this repository.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Links strip */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 bg-[#171717] px-6 py-4">
              <div className="flex items-center gap-3">
                <a
                  href={activeModalRepo.htmlUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-mono text-white hover:border-white/30 transition-colors"
                >
                  <GithubIcon className="h-4 w-4" />
                  <span>VIEW ON GITHUB</span>
                </a>

                {(activeModalRepo.homepage || modalDetail?.readme?.demoUrl) && (
                  <a
                    href={activeModalRepo.homepage || modalDetail?.readme?.demoUrl || "#"}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="flex items-center gap-2 rounded-xl bg-[#B9FF66] px-4 py-2 text-xs font-mono font-bold text-[#080808] hover:bg-[#a3e635] transition-colors"
                  >
                    <span>LAUNCH LIVE DEPLOYMENT</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>

              <span className="font-mono text-[11px] text-zinc-500">
                Source: Live GitHub API ({username})
              </span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
