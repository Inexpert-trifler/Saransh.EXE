"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  ContributionSkyline,
  type ContributionDay,
} from "@/components/ui/contribution-skyline";
import type { GitHubContributionsResponse } from "@/app/api/github-contributions/route";

const USERNAME = "Inexpert-trifler";

export function ActivitySection() {
  const [contributions, setContributions] = useState<ContributionDay[] | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);

  const fetchContributions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setErrorCode(null);

    try {
      const res = await fetch(`/api/github-contributions?username=${encodeURIComponent(USERNAME)}`);
      const json: GitHubContributionsResponse & { error?: string; code?: string } = await res.json();

      if (!res.ok) {
        setIsLoading(false);
        setError(json.error || `Failed to fetch contribution data (HTTP ${res.status})`);
        setErrorCode(json.code || "FETCH_ERROR");
        setContributions([]); // Strict empty array: never fall back to mock data
        return;
      }

      if (!json.days || !Array.isArray(json.days)) {
        setIsLoading(false);
        setError("Invalid response format received from GitHub API.");
        setErrorCode("INVALID_FORMAT");
        setContributions([]);
        return;
      }

      // Map API response to ContributionDay[]: { date: "YYYY-MM-DD", count: number }
      // Dates normalized and legitimate zero-contribution days preserved
      const mapped: ContributionDay[] = json.days.map((item) => ({
        date: String(item.date).trim(),
        count: Math.max(0, typeof item.count === "number" ? item.count : 0),
        level: item.level,
      }));

      setContributions(mapped);
      setIsLoading(false);
    } catch {
      setIsLoading(false);
      setError("Network failure: Unable to reach the contribution API endpoint.");
      setErrorCode("NETWORK_ERROR");
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
          setErrorCode(json.code || "FETCH_ERROR");
          setContributions([]);
          return;
        }

        if (!json.days || !Array.isArray(json.days)) {
          setIsLoading(false);
          setError("Invalid response format received from GitHub API.");
          setErrorCode("INVALID_FORMAT");
          setContributions([]);
          return;
        }

        const mapped: ContributionDay[] = json.days.map((item) => ({
          date: String(item.date).trim(),
          count: Math.max(0, typeof item.count === "number" ? item.count : 0),
          level: item.level,
        }));

        setContributions(mapped);
        setIsLoading(false);
      } catch {
        if (ignore) return;
        setIsLoading(false);
        setError("Network failure: Unable to reach the contribution API endpoint.");
        setErrorCode("NETWORK_ERROR");
        setContributions([]);
      }
    }

    loadInitial();

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <section id="activity" className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-12 border-b border-white/10 scroll-mt-24">
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="mb-12">
          <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#B9FF66]">
            {"// 04 · DISCIPLINE & WORK CADENCE"}
          </span>
          <h2 className="mt-2 text-3xl sm:text-5xl font-black tracking-tight text-white uppercase">
            CONTRIBUTION SKYLINE
          </h2>
          <div className="mt-2 h-1 w-12 bg-[#B9FF66]" />
        </div>

        {/* 3D Isometric Skyline Component */}
        <ContributionSkyline
          username={USERNAME}
          data={contributions}
          isLoading={isLoading}
          error={error}
          errorCode={errorCode}
          onRetry={fetchContributions}
        />
      </div>
    </section>
  );
}
