"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  NormalizedRepository,
  RepositoriesApiResponse,
} from "@/lib/github-types";
import {
  matchFeaturedRepositories,
  getVaultRepositories,
  EnrichedFeaturedFolder,
} from "@/lib/featured-repositories";
import { GlassFolder } from "@/components/ui/glass-folder-cards";
import { RepositoryDetailModal } from "@/components/ui/repository-detail-modal";
import {
  ArrowUpRight,
  RefreshCw,
  AlertCircle,
  FolderGit2,
} from "lucide-react";

interface ProjectsSectionProps {
  username?: string;
}

export function ProjectsSection({ username = "Inexpert-trifler" }: ProjectsSectionProps) {
  const router = useRouter();
  const [data, setData] = useState<RepositoriesApiResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Responsive folder width to prevent any mobile horizontal overflow
  const [folderWidth, setFolderWidth] = useState<number>(340);

  // Active open modal repo
  const [modalRepo, setModalRepo] = useState<NormalizedRepository | null>(null);
  const [modalDisplayName, setModalDisplayName] = useState<string | undefined>(undefined);

  // Folder open states
  const [openFolderId, setOpenFolderId] = useState<string | null>(null);

  useEffect(() => {
    const handleResize = () => {
      if (typeof window === "undefined") return;
      // Screen width minus padding
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
      const res = await fetch(`/api/github-repositories?username=${encodeURIComponent(username)}`);
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `HTTP ${res.status}: Failed to fetch repositories.`);
      }
      const json: RepositoriesApiResponse = await res.json();
      setData(json);
      setLoading(false);
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
          setError(err instanceof Error ? err.message : "Failed to connect to GitHub repositories API.");
          setLoading(false);
        }
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, [username]);

  // Match the 5 featured repos and vault repos
  const { featuredFolders, remainingCount } = useMemo(() => {
    const repos = data?.repositories || [];
    const { featured, featuredRepoIds, featuredNames } = matchFeaturedRepositories(repos);
    const vault = getVaultRepositories(repos, featuredRepoIds, featuredNames);
    return {
      featuredFolders: featured,
      remainingCount: vault.length,
    };
  }, [data]);

  const handleFeaturedFolderClick = (folder: EnrichedFeaturedFolder, willOpen: boolean) => {
    if (willOpen) {
      setOpenFolderId(folder.displayName);
    } else if (openFolderId === folder.displayName) {
      setOpenFolderId(null);
    }
  };

  const handleFileSelect = (folder: EnrichedFeaturedFolder, file: { href?: string; type?: unknown }) => {
    if (file.href && file.type === "github") {
      window.open(file.href, "_blank", "noopener,noreferrer");
      return;
    }

    // If real repository data is matched, open the detail modal
    if (folder.realRepo) {
      setModalRepo(folder.realRepo);
      setModalDisplayName(folder.displayName);
    } else {
      // Create a fallback NormalizedRepository
      const fallback: NormalizedRepository = {
        id: folder.seed,
        name: folder.matchedSlug,
        fullName: `Inexpert-trifler/${folder.matchedSlug}`,
        description: `Featured engineering project: ${folder.displayName}.`,
        htmlUrl: `https://github.com/Inexpert-trifler/${folder.matchedSlug}`,
        homepage: null,
        language: "TypeScript",
        topics: [folder.displayName.toLowerCase(), "system", "architecture"],
        stars: 0,
        forks: 0,
        openIssues: 0,
        isFork: false,
        isArchived: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        pushedAt: new Date().toISOString(),
        defaultBranch: "main",
        size: 100,
        readmeAvailable: false,
      };
      setModalRepo(fallback);
      setModalDisplayName(folder.displayName);
    }
  };

  // Open the Repository Vault
  const handleOpenVault = () => {
    router.push("/repositories");
  };

  return (
    <section
      id="work"
      className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-12 border-b border-white/10 scroll-mt-24 overflow-hidden"
    >
      {/* Background Subtle Gradient & Grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="mx-auto max-w-7xl relative z-10">
        {/* Header & Stats Banner */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
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
            <p className="mt-3 text-xs sm:text-sm text-zinc-400 font-mono max-w-xl">
              Curated architectural systems and research repositories. Interactive animated
              folders reveal system components, READMEs, and live GitHub sources.
            </p>
          </div>

          {/* Quick Metrics from Real GitHub API */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 font-mono text-xs">
            <div className="rounded-xl border border-white/10 bg-[#111111] px-4 py-2">
              <span className="text-zinc-500 block text-[10px] uppercase">PUBLIC REPOSITORIES</span>
              <span className="text-white font-bold text-sm">
                {data ? data.totalRepositories : "25"}
              </span>
            </div>
            <div className="rounded-xl border border-white/10 bg-[#111111] px-4 py-2">
              <span className="text-zinc-500 block text-[10px] uppercase">FEATURED SYSTEMS</span>
              <span className="text-[#B9FF66] font-bold text-sm">5 CURATED</span>
            </div>
            <div className="rounded-xl border border-white/10 bg-[#111111] px-4 py-2">
              <span className="text-zinc-500 block text-[10px] uppercase">TOTAL STARS</span>
              <span className="text-[#B9FF66] font-bold text-sm">
                {data ? data.totalStars : 0}
              </span>
            </div>
            <div className="rounded-xl border border-white/10 bg-[#111111] px-4 py-2">
              <span className="text-zinc-500 block text-[10px] uppercase">TOTAL FORKS</span>
              <span className="text-[#38BDF8] font-bold text-sm">
                {data ? data.totalForks : 2}
              </span>
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

        {/* EXACTLY SIX ANIMATED FOLDER CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-12 sm:gap-y-16 gap-x-8 sm:gap-x-10 justify-items-center items-end py-4">
            {/* The First 5 Featured Repository Folders */}
            {featuredFolders.map((folder, index) => {
              const repo = folder.realRepo;
              const isFolderOpen = openFolderId === folder.displayName;
              const metaLabel = repo?.language
                ? `${repo.language} · ${repo.stars > 0 ? `${repo.stars}★` : "Core System"}`
                : "System Architecture";

              const menuItems = [
                {
                  label: "Project Specs & README",
                  onSelect: () => {
                    if (repo) {
                      setModalRepo(repo);
                      setModalDisplayName(folder.displayName);
                    }
                  },
                },
                {
                  label: "View on GitHub ↗",
                  onSelect: () => {
                    const url = repo?.htmlUrl || `https://github.com/Inexpert-trifler/${folder.matchedSlug}`;
                    window.open(url, "_blank", "noopener,noreferrer");
                  },
                },
                {
                  label: "Copy Repository URL",
                  onSelect: () => {
                    const url = repo?.htmlUrl || `https://github.com/Inexpert-trifler/${folder.matchedSlug}`;
                    navigator.clipboard.writeText(url);
                  },
                },
              ];

              return (
                <div key={folder.displayName} className="flex flex-col items-center">
                  <GlassFolder
                    label={folder.displayName}
                    meta={metaLabel}
                    tone="dark"
                    art={folder.artPreset}
                    seed={folder.seed}
                    width={folderWidth}
                    appear={true}
                    appearDelay={index * 90}
                    open={isFolderOpen}
                    onOpenChange={(next) => handleFeaturedFolderClick(folder, next)}
                    files={folder.files}
                    action="more"
                    menu={menuItems}
                    onFileSelect={(file) => handleFileSelect(folder, file)}
                  />

                  {/* Accessible Quick Action Below Card */}
                  <div className="mt-4 flex items-center justify-between w-full max-w-[340px] px-2 font-mono text-[11px] text-zinc-400">
                    <span className="truncate max-w-[180px]">
                      {repo ? `repo: ${repo.name}` : folder.matchedSlug}
                    </span>
                    <button
                      onClick={() => {
                        if (repo) {
                          setModalRepo(repo);
                          setModalDisplayName(folder.displayName);
                        } else {
                          handleFileSelect(folder, {});
                        }
                      }}
                      className="text-[#B9FF66] hover:underline flex items-center gap-1 font-semibold"
                    >
                      <span>SPECS</span>
                      <ArrowUpRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              );
            })}

            {/* The 6th Folder: Repository Vault */}
            <div className="flex flex-col items-center">
              <GlassFolder
                label="Repository Vault"
                meta={`${remainingCount || 20} public repositories`}
                tone="dark"
                art="vault"
                seed={777}
                width={folderWidth}
                appear={true}
                appearDelay={5 * 90}
                open={openFolderId === "Repository Vault"}
                onOpenChange={(next) => {
                  if (next) {
                    handleOpenVault();
                  } else {
                    setOpenFolderId(null);
                  }
                }}
                action="more"
                menu={[
                  {
                    label: "Open Vault Library ↗",
                    onSelect: handleOpenVault,
                  },
                  {
                    label: "Filter & Search Repos",
                    onSelect: handleOpenVault,
                  },
                ]}
                files={[
                  {
                    name: "All Repositories",
                    meta: `${remainingCount} projects · Explore ↗`,
                    art: "vault",
                    href: "/repositories",
                  },
                  {
                    name: "Taxonomy & Stacks",
                    meta: "TS, Python, JS, HTML ↗",
                    href: "/repositories",
                  },
                  {
                    name: "Open Vault.exe",
                    meta: "Full Archive Index ↗",
                    href: "/repositories",
                  },
                  {
                    name: "Explore Library",
                    meta: "Navigate to /repositories ↗",
                    href: "/repositories",
                  },
                ]}
                onFileSelect={() => handleOpenVault()}
              />

              {/* Quick Action Below Vault Card */}
              <div className="mt-4 flex items-center justify-between w-full max-w-[340px] px-2 font-mono text-[11px] text-zinc-400">
                <span className="text-[#38BDF8] flex items-center gap-1">
                  <FolderGit2 className="h-3 w-3" />
                  <span>Remaining Public Archive</span>
                </span>
                <button
                  onClick={handleOpenVault}
                  className="text-[#B9FF66] hover:underline flex items-center gap-1 font-semibold"
                >
                  <span>EXPLORE</span>
                  <ArrowUpRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>

        {/* Footer Hint and Vault CTA Banner */}
        <div className="mt-14 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-zinc-500">
          <p className="text-center sm:text-left">
            Hover to lean 3D · Click folder to open · Select any sheet for code & README
          </p>

          <button
            onClick={handleOpenVault}
            className="flex items-center gap-2 rounded-xl border border-[#B9FF66]/30 bg-[#B9FF66]/10 px-4 py-2 font-mono text-xs font-bold text-[#B9FF66] hover:bg-[#B9FF66] hover:text-[#080808] transition-all shadow-[0_0_15px_rgba(185,255,102,0.15)]"
          >
            <FolderGit2 className="h-3.5 w-3.5" />
            <span>OPEN REPOSITORY VAULT ({remainingCount} REPOS)</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Repository Detail Modal */}
      <RepositoryDetailModal
        repo={modalRepo}
        displayName={modalDisplayName}
        isOpen={Boolean(modalRepo)}
        onClose={() => {
          setModalRepo(null);
          setModalDisplayName(undefined);
        }}
        username={username}
      />
    </section>
  );
}
