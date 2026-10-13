"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  Calendar,
  Info,
  ExternalLink,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { GithubIcon } from "@/components/ui/icons";
import type { GitHubContributionsResponse } from "@/app/api/github-contributions/route";

export interface ActivityDay {
  date: string; // YYYY-MM-DD
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export interface ActivityHeatmapProps {
  className?: string;
  username?: string;
}

const LEVEL_CLASSES: Record<number, string> = {
  0: "bg-[#1a1a1a] border border-white/5",
  1: "bg-[#B9FF66]/25 border border-[#B9FF66]/30",
  2: "bg-[#B9FF66]/50 border border-[#B9FF66]/60",
  3: "bg-[#B9FF66]/75 shadow-[0_0_4px_rgba(185,255,102,0.4)]",
  4: "bg-[#B9FF66] shadow-[0_0_6px_rgba(185,255,102,0.7)]",
};

// Generate idle placeholder cells so layout remains structurally stable while loading or on error
function generatePlaceholderDays(daysCount: number): ActivityDay[] {
  return Array.from({ length: daysCount }, (_, i) => ({
    date: `2026-01-${String((i % 28) + 1).padStart(2, "0")}`,
    count: 0,
    level: 0,
  }));
}

function formatDateLabel(dateStr: string): string {
  try {
    const [year, month, day] = dateStr.split("-").map(Number);
    const d = new Date(year, month - 1, day);
    return d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export function ActivityHeatmap({
  className = "",
  username = "Inexpert-trifler",
}: ActivityHeatmapProps) {
  const [data, setData] = useState<GitHubContributionsResponse | null>(null);
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);

  const [rangeFilter, setRangeFilter] = useState<"6m" | "12m">("12m");
  const [selectedDay, setSelectedDay] = useState<ActivityDay | null>(null);
  const [hoveredDay, setHoveredDay] = useState<{ day: ActivityDay; x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleRetry = useCallback(async () => {
    setStatus("loading");
    setErrorMessage(null);
    setErrorCode(null);

    try {
      const res = await fetch(`/api/github-contributions?username=${encodeURIComponent(username)}`);
      const json = await res.json();

      if (!res.ok) {
        setStatus("error");
        setErrorMessage(json.error || `HTTP Error ${res.status}`);
        setErrorCode(json.code || "REQUEST_FAILED");
        return;
      }

      setData(json);
      setStatus("success");
    } catch {
      setStatus("error");
      setErrorMessage("Network error: Unable to contact the contributions endpoint.");
      setErrorCode("NETWORK_ERROR");
    }
  }, [username]);

  useEffect(() => {
    let ignore = false;

    async function loadInitial() {
      try {
        const res = await fetch(`/api/github-contributions?username=${encodeURIComponent(username)}`);
        const json = await res.json();

        if (ignore) return;

        if (!res.ok) {
          setStatus("error");
          setErrorMessage(json.error || `HTTP Error ${res.status}`);
          setErrorCode(json.code || "REQUEST_FAILED");
          return;
        }

        setData(json);
        setStatus("success");
      } catch {
        if (ignore) return;
        setStatus("error");
        setErrorMessage("Network error: Unable to contact the contributions endpoint.");
        setErrorCode("NETWORK_ERROR");
      }
    }

    loadInitial();

    return () => {
      ignore = true;
    };
  }, [username]);

  // Determine active displayed days based on range filter (6m = 182 days / 26 weeks, 12m = 364 days / 52 weeks)
  const targetDaysCount = rangeFilter === "6m" ? 182 : 364;

  const displayedDays = useMemo<ActivityDay[]>(() => {
    if (status === "success" && data?.days && data.days.length > 0) {
      return data.days.slice(-targetDaysCount);
    }
    return generatePlaceholderDays(targetDaysCount);
  }, [status, data, targetDaysCount]);

  // Compute metrics only when supported by live API data
  const totalContributionsInView = useMemo(() => {
    if (status !== "success" || !data) return null;
    if (rangeFilter === "12m" && typeof data.totalContributions === "number") {
      return data.totalContributions;
    }
    return displayedDays.reduce((acc, curr) => acc + curr.count, 0);
  }, [status, data, rangeFilter, displayedDays]);

  const activeDaysCount = useMemo(() => {
    if (status !== "success") return null;
    return displayedDays.filter((d) => d.count > 0).length;
  }, [status, displayedDays]);

  const peakDay = useMemo<{ count: number; date: string } | null>(() => {
    if (status !== "success" || displayedDays.length === 0) return null;
    let max = 0;
    let maxDate = "";
    for (const d of displayedDays) {
      if (d.count > max) {
        max = d.count;
        maxDate = d.date;
      }
    }
    return { count: max, date: maxDate };
  }, [status, displayedDays]);

  const handleMouseEnter = (day: ActivityDay, e: React.MouseEvent<HTMLButtonElement>) => {
    if (!containerRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();
    setHoveredDay({
      day,
      x: rect.left - containerRect.left + rect.width / 2,
      y: rect.top - containerRect.top - 8,
    });
  };

  const handleMouseLeave = () => {
    setHoveredDay(null);
  };

  return (
    <div className={`rounded-xl border border-white/10 bg-[#111111] p-5 sm:p-6 shadow-xl ${className}`}>
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <Calendar className="h-4 w-4 text-[#B9FF66]" />
            <h3 className="font-mono text-sm font-semibold tracking-wide text-[#F5F5F5]">
              GITHUB ACTIVITY CADENCE
            </h3>

            {/* Live Data Status Indicator */}
            {status === "loading" && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/25 bg-amber-400/10 px-2.5 py-0.5 font-mono text-[10px] text-amber-300 font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                <span>Loading contributions...</span>
              </span>
            )}

            {status === "success" && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#B9FF66]/30 bg-[#B9FF66]/10 px-2.5 py-0.5 font-mono text-[10px] text-[#B9FF66] font-semibold shadow-[0_0_8px_rgba(185,255,102,0.2)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#B9FF66]" />
                <span>Live GitHub data</span>
              </span>
            )}

            {status === "error" && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 px-2.5 py-0.5 font-mono text-[10px] text-rose-300 font-semibold">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                <span>Unable to load GitHub data</span>
              </span>
            )}
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-[#A1A1AA]">
            <a
              href={`https://github.com/${username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-mono text-[#F5F5F5] hover:text-[#B9FF66] transition-colors"
              aria-label={`Visit GitHub profile for @${username}`}
            >
              <GithubIcon className="h-3.5 w-3.5" />
              <span>@{username}</span>
              <ExternalLink className="h-3 w-3 opacity-70" />
            </a>

            {status === "success" && data?.period && (
              <>
                <span className="text-zinc-600">·</span>
                <span className="font-mono text-[11px] text-zinc-400">
                  {data.period.start} → {data.period.end}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Range Controls & Retry Button */}
        <div className="flex items-center gap-2">
          {status === "error" && (
            <button
              onClick={handleRetry}
              className="flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-mono text-zinc-300 hover:border-[#B9FF66] hover:text-[#B9FF66] transition-colors"
              title="Retry fetching GitHub contributions"
            >
              <RefreshCw className="h-3 w-3" />
              <span>Retry</span>
            </button>
          )}

          <button
            onClick={() => setRangeFilter("6m")}
            className={`rounded-md px-3 py-1 text-xs font-mono transition-all ${
              rangeFilter === "6m"
                ? "bg-[#B9FF66] text-[#080808] font-semibold shadow-[0_0_8px_rgba(185,255,102,0.3)]"
                : "bg-white/5 text-zinc-400 hover:text-white"
            }`}
          >
            6 Months
          </button>
          <button
            onClick={() => setRangeFilter("12m")}
            className={`rounded-md px-3 py-1 text-xs font-mono transition-all ${
              rangeFilter === "12m"
                ? "bg-[#B9FF66] text-[#080808] font-semibold shadow-[0_0_8px_rgba(185,255,102,0.3)]"
                : "bg-white/5 text-zinc-400 hover:text-white"
            }`}
          >
            12 Months
          </button>
        </div>
      </div>

      {/* Recoverable Error Notification Banner */}
      {status === "error" && (
        <div className="my-4 rounded-lg border border-amber-500/25 bg-amber-500/5 p-4 font-mono text-xs">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2 font-semibold text-amber-300">
                <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />
                <span>
                  {errorCode === "MISSING_TOKEN"
                    ? "GitHub Token Not Configured"
                    : errorCode === "RATE_LIMITED"
                    ? "GitHub API Rate Limited"
                    : "Unable to Retrieve GitHub Contributions"}
                </span>
              </div>
              <p className="text-[11px] leading-relaxed text-zinc-400">
                {errorMessage || "The GitHub GraphQL API could not be reached."}
              </p>
              {errorCode === "MISSING_TOKEN" && (
                <p className="mt-1 text-[10px] text-zinc-500">
                  Setup: Set <code className="rounded bg-white/10 px-1 py-0.5 text-[#B9FF66]">GITHUB_TOKEN</code> in your environment variables (<code className="text-zinc-300">.env.local</code> or Vercel) with public read access.
                </p>
              )}
            </div>

            <button
              onClick={handleRetry}
              className="shrink-0 flex items-center gap-1.5 rounded-md border border-white/15 bg-white/10 px-3 py-1.5 text-xs text-white hover:border-[#B9FF66] hover:text-[#B9FF66] transition-colors"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Retry Sync</span>
            </button>
          </div>
        </div>
      )}

      {/* Stats summary strip */}
      <div className="my-4 grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
        <div className="rounded-lg border border-white/5 bg-[#171717] p-2.5">
          <div className="text-zinc-500 text-[10px] uppercase">
            {rangeFilter === "12m" ? "Annual Total" : "6-Month Total"}
          </div>
          <div className="mt-0.5 text-base font-bold text-[#B9FF66]">
            {status === "success" && totalContributionsInView !== null ? (
              totalContributionsInView.toLocaleString()
            ) : status === "loading" ? (
              <span className="text-zinc-500 animate-pulse">Syncing...</span>
            ) : (
              <span className="text-zinc-600">—</span>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-white/5 bg-[#171717] p-2.5">
          <div className="text-zinc-500 text-[10px] uppercase">Active Days</div>
          <div className="mt-0.5 text-base font-bold text-white">
            {status === "success" && activeDaysCount !== null ? (
              `${activeDaysCount} / ${displayedDays.length}`
            ) : status === "loading" ? (
              <span className="text-zinc-500 animate-pulse">Syncing...</span>
            ) : (
              <span className="text-zinc-600">— / {displayedDays.length}</span>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-white/5 bg-[#171717] p-2.5">
          <div className="text-zinc-500 text-[10px] uppercase">Peak Day</div>
          <div className="mt-0.5 text-base font-bold text-[#38BDF8]">
            {status === "success" && peakDay ? (
              `${peakDay.count} activities`
            ) : status === "loading" ? (
              <span className="text-zinc-500 animate-pulse">Syncing...</span>
            ) : (
              <span className="text-zinc-600">—</span>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-white/5 bg-[#171717] p-2.5">
          <div className="text-zinc-500 text-[10px] uppercase">Selected Day</div>
          <div className="mt-0.5 text-base font-bold text-zinc-300 truncate">
            {selectedDay ? (
              status === "success" ? (
                `${selectedDay.count} on ${selectedDay.date}`
              ) : (
                `${selectedDay.date}`
              )
            ) : (
              "Click any cell"
            )}
          </div>
        </div>
      </div>

      {/* Interactive Grid */}
      <div ref={containerRef} className="relative w-full overflow-x-auto py-2">
        {hoveredDay && (
          <div
            className="pointer-events-none absolute z-50 -translate-x-1/2 -translate-y-full px-2.5 py-1.5 bg-[#171717] border border-white/15 rounded-md font-mono text-[11px] text-[#f5f5f5] whitespace-nowrap shadow-2xl"
            style={{ left: `${hoveredDay.x}px`, top: `${hoveredDay.y}px` }}
          >
            {status === "success" ? (
              <>
                <span className="text-[#B9FF66] font-bold">
                  {hoveredDay.day.count} {hoveredDay.day.count === 1 ? "contribution" : "contributions"}
                </span>{" "}
                on {formatDateLabel(hoveredDay.day.date)}
              </>
            ) : (
              <span>{formatDateLabel(hoveredDay.day.date)} (Data offline)</span>
            )}
          </div>
        )}

        <div
          className="inline-grid gap-[3px]"
          style={{
            gridTemplateRows: "repeat(7, 12px)",
            gridAutoFlow: "column",
            gridAutoColumns: "12px",
          }}
          role="grid"
          aria-label={`Contribution activity grid for ${username}`}
        >
          {displayedDays.map((day, idx) => {
            const levelClass = LEVEL_CLASSES[day.level] || LEVEL_CLASSES[0];
            const isClickable = true;

            return (
              <button
                key={day.date ? `${day.date}-${idx}` : `cell-${idx}`}
                type="button"
                role="gridcell"
                tabIndex={0}
                aria-label={
                  status === "success"
                    ? `${day.count} contributions on ${day.date}`
                    : `Activity cell ${idx + 1}`
                }
                onClick={() => isClickable && setSelectedDay(day)}
                onMouseEnter={(e) => handleMouseEnter(day, e)}
                onMouseLeave={handleMouseLeave}
                className={`w-3 h-3 rounded-[2px] transition-transform cursor-pointer outline-none focus-visible:outline-2 focus-visible:outline-[#B9FF66] focus-visible:outline-offset-1 ${levelClass} ${
                  status === "loading" ? "animate-pulse" : ""
                }`}
              />
            );
          })}
        </div>
      </div>

      {/* Legend & Metadata Strip */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-zinc-400 pt-3 border-t border-white/5">
        <div className="flex items-center gap-2">
          <span>Less</span>
          <div className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-sm bg-[#1a1a1a] border border-white/10" />
            <span className="h-2.5 w-2.5 rounded-sm bg-[rgba(185,255,102,0.25)]" />
            <span className="h-2.5 w-2.5 rounded-sm bg-[rgba(185,255,102,0.5)]" />
            <span className="h-2.5 w-2.5 rounded-sm bg-[rgba(185,255,102,0.75)]" />
            <span className="h-2.5 w-2.5 rounded-sm bg-[#B9FF66]" />
          </div>
          <span>More</span>
        </div>

        <div className="flex items-center gap-1.5 text-zinc-400">
          {status === "success" && data ? (
            <div className="flex items-center gap-1.5 text-zinc-400">
              <CheckCircle2 className="h-3.5 w-3.5 text-[#B9FF66]" />
              <span>
                Synced with GitHub GraphQL API · {new Date(data.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-zinc-500">
              <Info className="h-3.5 w-3.5" />
              <span>
                {status === "loading"
                  ? "Contacting GitHub GraphQL endpoint..."
                  : "Live sync paused. Provide GITHUB_TOKEN to enable real-time tracking."}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
