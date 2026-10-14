"use client";

import React, { useState, useEffect, useMemo, useTransition } from "react";
import Link from "next/link";
import {
  NormalizedRepository,
  RepositoriesApiResponse,
} from "@/lib/github-types";
import {
  matchFeaturedRepositories,
  getVaultRepositories,
  generateVaultRepoFiles,
} from "@/lib/featured-repositories";
import { GlassFolder, ArtPresetName } from "@/components/ui/glass-folder-cards";
import { RepositoryDetailModal } from "@/components/ui/repository-detail-modal";
import {
  ArrowLeft,
  ArrowUpRight,
  Search,
  X,
  SlidersHorizontal,
  RefreshCw,
  AlertCircle,
  BookOpen,
  Filter,
} from "lucide-react";

const ART_CYCLE: ArtPresetName[] = [
  "cyber",
  "lime",
  "dusk",
  "ember",
  "aurora",
  "glacier",
  "verdant",
  "vault",
];

function getArtForRepo(repo: NormalizedRepository, index: number): ArtPresetName {
  if (repo.language === "TypeScript") return "cyber";
  if (repo.language === "Python") return "lime";
  if (repo.language === "JavaScript") return "dusk";
  if (repo.language === "HTML") return "glacier";
  if (repo.language === "CSS") return "aurora";
  return ART_CYCLE[index % ART_CYCLE.length];
}

const PAGE_SIZE = 9;

export default function RepositoriesVaultPage() {
  const [data, setData] = useState<RepositoriesApiResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("All");
  const [selectedFilter, setSelectedFilter] = useState<"All" | "Original" | "Forks">("All");
  const [sortBy, setSortBy] = useState<"updated" | "stars" | "name">("updated");

  // Pagination
  const [visibleCount, setVisibleCount] = useState<number>(PAGE_SIZE);

  // Modal
  const [modalRepo, setModalRepo] = useState<NormalizedRepository | null>(null);

  // Responsive folder width
  const [folderWidth, setFolderWidth] = useState<number>(340);
  const [openFolderId, setOpenFolderId] = useState<number | null>(null);

  const [, startTransition] = useTransition();

  useEffect(() => {
    const handleResize = () => {
      if (typeof window === "undefined") return;
      const maxAvailable = window.innerWidth - 40;
      setFolderWidth(Math.min(340, Math.max(280, maxAvailable)));
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchRepositories = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/github-repositories?username=Inexpert-trifler");
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
        const res = await fetch("/api/github-repositories?username=Inexpert-trifler");
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
          setError(err instanceof Error ? err.message : "Failed to connect to GitHub repositories API.");
          setLoading(false);
        }
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, []);

  // Filter out the 5 featured repos to prevent duplicates
  const vaultRepositories = useMemo(() => {
    if (!data) return [];
    const { featuredRepoIds, featuredNames } = matchFeaturedRepositories(data.repositories);
    return getVaultRepositories(data.repositories, featuredRepoIds, featuredNames);
  }, [data]);

  // Available languages from vault repos
  const availableLanguages = useMemo(() => {
    const langs = Array.from(
      new Set(vaultRepositories.map((r) => r.language).filter(Boolean) as string[])
    );
    return ["All", ...langs];
  }, [vaultRepositories]);

  // Search, filter, and sort
  const filteredRepositories = useMemo(() => {
    let list = [...vaultRepositories];

    // 1. Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          (r.description && r.description.toLowerCase().includes(q)) ||
          (r.language && r.language.toLowerCase().includes(q)) ||
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
      if (sortBy === "stars") return b.stars - a.stars;
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

    return list;
  }, [vaultRepositories, searchQuery, selectedLanguage, selectedFilter, sortBy]);

  // Total metrics of vault
  const vaultMetrics = useMemo(() => {
    const totalRepos = vaultRepositories.length;
    const totalStars = vaultRepositories.reduce((acc, r) => acc + (r.stars || 0), 0);
    const totalForks = vaultRepositories.reduce((acc, r) => acc + (r.forks || 0), 0);
    return { totalRepos, totalStars, totalForks };
  }, [vaultRepositories]);

  const displayedList = filteredRepositories.slice(0, visibleCount);
  const hasMore = visibleCount < filteredRepositories.length;

  const formatDate = (isoString?: string) => {
    if (!isoString) return "";
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

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedLanguage("All");
    setSelectedFilter("All");
    setSortBy("updated");
    setVisibleCount(PAGE_SIZE);
  };

  return (
    <div className="min-h-screen bg-[#080808] text-white selection:bg-[#B9FF66] selection:text-[#080808] font-sans">
      {/* Background Subtle Noise & Grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Navigation Top Header */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#080808]/90 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-12">
          <Link
            href="/#work"
            className="group flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3.5 py-1.5 font-mono text-xs text-white hover:border-[#B9FF66] hover:text-[#B9FF66] transition-all"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            <span>BACK TO WORK</span>
          </Link>

          <Link
            href="/"
            className="flex items-center gap-2 font-mono text-sm font-bold tracking-wider text-white"
          >
            <span className="flex h-2.5 w-2.5 rounded-sm bg-[#B9FF66]" />
            <span>
              SARANSH<span className="text-[#B9FF66]">.EXE</span>
            </span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-12 py-12 sm:py-16 relative z-10">
        {/* Title & Stats */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#B9FF66]">
                {"// REPOSITORY VAULT · PUBLIC ARCHIVE"}
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-[#B9FF66] animate-pulse" />
            </div>
            <h1 className="mt-2 text-3xl sm:text-5xl font-black tracking-tight text-white uppercase">
              REPOSITORY VAULT
            </h1>
            <div className="mt-2 h-1 w-12 bg-[#B9FF66]" />
            <p className="mt-3 text-xs sm:text-sm text-zinc-400 font-mono max-w-2xl">
              All remaining open-source projects, tools, hackathon solutions, and experimental
              codebases authored on GitHub. Rendered with interactive animated folders.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 font-mono text-xs">
            <div className="rounded-xl border border-white/10 bg-[#111111] px-4 py-2">
              <span className="text-zinc-500 block text-[10px] uppercase">VAULT REPOSITORIES</span>
              <span className="text-white font-bold text-sm">{vaultMetrics.totalRepos}</span>
            </div>
            <div className="rounded-xl border border-white/10 bg-[#111111] px-4 py-2">
              <span className="text-zinc-500 block text-[10px] uppercase">TOTAL STARS</span>
              <span className="text-[#B9FF66] font-bold text-sm">{vaultMetrics.totalStars}</span>
            </div>
            <div className="rounded-xl border border-white/10 bg-[#111111] px-4 py-2">
              <span className="text-zinc-500 block text-[10px] uppercase">TOTAL FORKS</span>
              <span className="text-[#38BDF8] font-bold text-sm">{vaultMetrics.totalForks}</span>
            </div>
            <button
              onClick={fetchRepositories}
              disabled={loading}
              title="Refresh GitHub repositories"
              aria-label="Refresh GitHub repositories"
              className="rounded-xl border border-white/10 bg-[#111111] p-3 text-zinc-400 hover:border-[#B9FF66] hover:text-[#B9FF66] transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-[#B9FF66]" : ""}`} />
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="mb-12 space-y-4 rounded-2xl border border-white/10 bg-[#111115] p-4 sm:p-5 shadow-xl">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search vault by repository name, topic, language, or description..."
                className="w-full rounded-xl border border-white/10 bg-[#17171d] pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-500 focus:border-[#B9FF66] focus:outline-none focus:ring-1 focus:ring-[#B9FF66] font-mono"
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

            {/* Type Filter Buttons */}
            <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-[#17171d] p-1 font-mono text-xs w-full sm:w-auto">
              {(["All", "Original", "Forks"] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setSelectedFilter(filter)}
                  className={`flex-1 sm:flex-none rounded-lg px-3 py-1.5 transition-colors ${
                    selectedFilter === filter
                      ? "bg-[#B9FF66] text-[#080808] font-bold"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <SlidersHorizontal className="h-4 w-4 text-zinc-500 hidden sm:block" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "updated" | "stars" | "name")}
                aria-label="Sort repositories"
                className="w-full sm:w-auto rounded-xl border border-white/10 bg-[#17171d] px-3.5 py-2.5 text-xs font-mono text-zinc-300 focus:border-[#B9FF66] focus:outline-none"
              >
                <option value="updated">Recently Updated</option>
                <option value="stars">Most Stars</option>
                <option value="name">Alphabetical (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Language Filter Pills */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/5">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-mono text-zinc-500 mr-1 flex items-center gap-1">
                <Filter className="h-3 w-3" />
                <span>LANG:</span>
              </span>
              {availableLanguages.map((lang) => (
                <button
                  key={lang}
                  onClick={() => setSelectedLanguage(lang)}
                  className={`rounded-lg px-2.5 py-1 font-mono text-[11px] transition-all ${
                    selectedLanguage === lang
                      ? "bg-[#B9FF66] text-[#080808] font-bold shadow-[0_0_10px_rgba(185,255,102,0.3)]"
                      : "border border-white/10 bg-[#17171d] text-zinc-400 hover:border-white/20 hover:text-white"
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>

            <div className="font-mono text-xs text-zinc-500">
              Showing {displayedList.length} of {filteredRepositories.length} repositories
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-10 rounded-2xl border border-red-500/20 bg-red-950/20 p-6 text-center font-mono">
            <AlertCircle className="mx-auto h-8 w-8 text-red-400 mb-2" />
            <h3 className="text-sm font-bold text-red-200 uppercase">
              Failed to Synchronize with GitHub API
            </h3>
            <p className="mt-1 text-xs text-red-300/80">{error}</p>
            <button
              onClick={fetchRepositories}
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs font-semibold text-red-300 hover:bg-red-500/20 transition-colors"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Retry Request</span>
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && !data && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-12 gap-x-8 justify-items-center items-end py-8">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div
                key={idx}
                className="w-[340px] max-w-full h-[326px] rounded-2xl border border-white/5 bg-[#121216]/60 p-6 flex flex-col justify-end animate-pulse"
              >
                <div className="h-4 w-32 bg-white/10 rounded mb-3" />
                <div className="h-3 w-20 bg-[#B9FF66]/20 rounded" />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredRepositories.length === 0 && (
          <div className="py-20 text-center font-mono space-y-4 rounded-2xl border border-white/10 bg-[#111115] p-8">
            <BookOpen className="mx-auto h-12 w-12 text-zinc-600" />
            <h3 className="text-base font-bold text-zinc-200 uppercase">
              No Repositories Match Your Filters
            </h3>
            <p className="text-xs text-zinc-500 max-w-md mx-auto">
              We couldn&apos;t find any repositories matching &quot;{searchQuery}&quot; or the selected
              filter criteria.
            </p>
            <button
              onClick={resetFilters}
              className="rounded-xl border border-[#B9FF66]/30 bg-[#B9FF66]/10 px-4 py-2 text-xs font-bold text-[#B9FF66] hover:bg-[#B9FF66] hover:text-[#080808] transition-colors"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Responsive Grid of GlassFolders */}
        {displayedList.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-12 sm:gap-y-16 gap-x-8 sm:gap-x-10 justify-items-center items-end py-4">
            {displayedList.map((repo, idx) => {
              const artPreset = getArtForRepo(repo, idx);
              const files = generateVaultRepoFiles(repo, artPreset);
              const metaLabel = `${repo.language || "Code"} · ${formatDate(repo.updatedAt)}`;
              const isFolderOpen = openFolderId === repo.id;

              const menuItems = [
                {
                  label: "Deep Dive & README",
                  onSelect: () => setModalRepo(repo),
                },
                {
                  label: "View on GitHub ↗",
                  onSelect: () => window.open(repo.htmlUrl, "_blank", "noopener,noreferrer"),
                },
                {
                  label: "Copy Repository URL",
                  onSelect: () => navigator.clipboard.writeText(repo.htmlUrl),
                },
              ];

              return (
                <div key={repo.id} className="flex flex-col items-center">
                  <GlassFolder
                    label={repo.name}
                    meta={metaLabel}
                    tone="dark"
                    art={artPreset}
                    seed={repo.id % 997}
                    width={folderWidth}
                    appear={true}
                    appearDelay={(idx % PAGE_SIZE) * 70}
                    open={isFolderOpen}
                    onOpenChange={(next) => {
                      if (next) setOpenFolderId(repo.id);
                      else if (openFolderId === repo.id) setOpenFolderId(null);
                    }}
                    files={files}
                    action="more"
                    menu={menuItems}
                    onFileSelect={(file) => {
                      if (file.href && file.type === "github") {
                        window.open(file.href, "_blank", "noopener,noreferrer");
                      } else {
                        setModalRepo(repo);
                      }
                    }}
                  />

                  {/* Card Quick Info Bar */}
                  <div className="mt-4 flex items-center justify-between w-full max-w-[340px] px-2 font-mono text-[11px] text-zinc-400">
                    <span className="truncate max-w-[190px]">
                      {repo.language || "Code"}
                      {repo.stars > 0 && ` · ${repo.stars}★`}
                      {repo.isFork && " · [fork]"}
                    </span>
                    <button
                      onClick={() => setModalRepo(repo)}
                      className="text-[#B9FF66] hover:underline flex items-center gap-1 font-semibold"
                    >
                      <span>SPECS</span>
                      <ArrowUpRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Load More Button */}
        {hasMore && (
          <div className="mt-16 text-center">
            <button
              onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-[#141418] px-6 py-3 font-mono text-xs font-bold text-white hover:border-[#B9FF66] hover:text-[#B9FF66] transition-all shadow-lg"
            >
              <span>LOAD MORE REPOSITORIES ({filteredRepositories.length - visibleCount} REMAINING)</span>
              <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Back to Work Bottom Link */}
        <div className="mt-20 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-zinc-500">
          <Link
            href="/#work"
            className="flex items-center gap-2 text-zinc-400 hover:text-[#B9FF66] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>RETURN TO FEATURED SYSTEMS ON HOME</span>
          </Link>

          <span>Inexpert-trifler · Public GitHub Archive</span>
        </div>
      </main>

      {/* Repository Detail Modal */}
      <RepositoryDetailModal
        repo={modalRepo}
        isOpen={Boolean(modalRepo)}
        onClose={() => setModalRepo(null)}
      />
    </div>
  );
}
