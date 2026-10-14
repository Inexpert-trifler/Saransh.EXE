"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { ActivityHeatmap, type ActivityDatum } from "@/components/ui/activity-heatmap";
import type { GitHubContributionsResponse } from "@/app/api/github-contributions/route";

const USERNAME = "Inexpert-trifler";

export function ActivitySection() {
  const [contributions, setContributions] = useState<ActivityDatum[] | undefined>(undefined);
  const [totalContributions, setTotalContributions] = useState<number | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContributions = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/github-contributions?username=${encodeURIComponent(USERNAME)}`);
      const json: GitHubContributionsResponse & { error?: string; code?: string } = await res.json();

      if (!res.ok) {
        setIsLoading(false);
        setError(json.error || `Failed to fetch contribution data (HTTP ${res.status})`);
        setContributions([]);
        return;
      }

      if (!json.days || !Array.isArray(json.days)) {
        setIsLoading(false);
        setError("Invalid response format received from GitHub API.");
        setContributions([]);
        return;
      }

      // Map API response to ActivityDatum[]
      const mapped: ActivityDatum[] = json.days.map((item) => ({
        date: String(item.date).trim(),
        value: Math.max(0, typeof item.count === "number" ? item.count : 0),
        level: item.level,
      }));

      setContributions(mapped);
      setTotalContributions(json.totalContributions);
      setIsLoading(false);
    } catch {
      setIsLoading(false);
      setError("Network failure: Unable to reach the contribution API endpoint.");
      setContributions([]);
    }
  }, []);

  useEffect(() => {
    let ignore = false;

    async function loadInitial() {
      try {
        const res = await fetch(`/api/github-contributions?username=${encodeURIComponent(USERNAME)}`);
        const json: GitHubContributionsResponse & { error?: string; code?: string } = await res.json();

        if (ignore) return;

        if (!res.ok) {
          setIsLoading(false);
          setError(json.error || `Failed to fetch contribution data (HTTP ${res.status})`);
          setContributions([]);
          return;
        }

        if (!json.days || !Array.isArray(json.days)) {
          setIsLoading(false);
          setError("Invalid response format received from GitHub API.");
          setContributions([]);
          return;
        }

        const mapped: ActivityDatum[] = json.days.map((item) => ({
          date: String(item.date).trim(),
          value: Math.max(0, typeof item.count === "number" ? item.count : 0),
          level: item.level,
        }));

        setContributions(mapped);
        setTotalContributions(json.totalContributions);
        setIsLoading(false);
      } catch {
        if (ignore) return;
        setIsLoading(false);
        setError("Network failure: Unable to reach the contribution API endpoint.");
        setContributions([]);
      }
    }

    loadInitial();

    return () => {
      ignore = true;
    };
  }, []);

  const data = useMemo(() => contributions || [], [contributions]);

  return (
    <section
      id="activity"
      className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-12 border-b border-white/10 scroll-mt-24"
    >
      <div className="mx-auto max-w-7xl 2xl:max-w-[1440px]">
        {/* Section Header */}
        <div className="mb-10">
          <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#B9FF66]">
            {"// 04 · DISCIPLINE & WORK CADENCE"}
          </span>
          <h2 className="mt-2 text-3xl sm:text-5xl font-black tracking-tight text-white uppercase">
            CONTRIBUTION ACTIVITY
          </h2>
          <div className="mt-2 h-1 w-12 bg-[#B9FF66]" />
        </div>

        {/* Polished GitHub Analytics Card */}
        <ActivityHeatmap
          data={data}
          username={USERNAME}
          profileUrl={`https://github.com/${USERNAME}`}
          totalContributions={totalContributions}
          isLoading={isLoading}
          error={error}
          onRetry={fetchContributions}
        />
      </div>
    </section>
  );
}
