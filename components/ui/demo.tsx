"use client";

import * as React from "react";
import { ActivityHeatmap } from "@/components/ui/activity-heatmap";
import type { ActivityDatum, ActivityHeatmapView } from "@/components/ui/activity-heatmap";

export const HEATMAP_DEMO_END = "2025-12-31";
const LIVE_STREAK_DAYS = 6;

// A repeatable year of movement practice. Weekdays are busier; summer is quieter.
export function makeDemoActivity(days = 365): ActivityDatum[] {
  let seed = 20251009;
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const count = Number.isFinite(days) ? Math.max(1, Math.floor(days)) : 365;
  const out: ActivityDatum[] = [];
  for (let index = count - 1; index >= 0; index -= 1) {
    const date = new Date(2025, 11, 31 - index);
    const day = date.getDay();
    const summer = date.getMonth() >= 5 && date.getMonth() <= 7;
    const chance = (day === 2 ? 0.97 : day === 0 || day === 6 ? 0.26 : 0.85) * (summer ? 0.52 : 1);
    const active = index < LIVE_STREAK_DAYS || random() < chance;
    const value = active ? Math.round((20 + random() * 55) * (day === 2 ? 1.25 : 1)) : 0;
    out.push({ date: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`, value });
  }
  return out;
}

export const HEATMAP_DEMO_DATA = makeDemoActivity();
const CCGATHER_URL = "https://ccgather.com/?utm_source=21st&utm_medium=component&utm_campaign=activity_heatmap";

type DemoProps = {
  days?: number;
  cellSize?: number;
  color?: string;
  autoPlay?: boolean;
  interval?: number;
  defaultView?: ActivityHeatmapView;
  bare?: boolean;
  controlled?: boolean;
  empty?: boolean;
};

export default function Demo({ days = 365, cellSize = 10, color, autoPlay, interval, defaultView = "calendar", bare = false, controlled = false, empty = false }: DemoProps) {
  const data = React.useMemo(() => empty ? [] : makeDemoActivity(days), [days, empty]);
  const [selected, setSelected] = React.useState(defaultView);
  const heatmap = <ActivityHeatmap
    data={data}
    days={days}
    endDate={HEATMAP_DEMO_END}
    cellSize={cellSize}
    color={color ?? (bare ? undefined : "var(--color-chart-2, var(--heatmap-demo-accent))")}
    unit="min"
    autoPlay={autoPlay ?? (bare ? undefined : true)}
    interval={interval ?? (bare ? undefined : 1600)}
    defaultView={defaultView}
    {...(controlled ? { view: selected, onViewChange: setSelected } : {})}
  />;
  if (bare) return <div className="flex min-h-screen w-full items-center justify-center bg-background p-6"><div data-controlled-view={controlled ? selected : undefined} className="w-full max-w-3xl">{heatmap}</div></div>;
  return (
    <div data-heatmap-demo className="flex min-h-screen w-full flex-col items-center justify-center gap-4 bg-background p-6 font-sans text-foreground [--heatmap-demo-accent:oklch(0.6_0.12_165)] dark:[--heatmap-demo-accent:oklch(0.72_0.15_163)]">
      <div className="w-full max-w-3xl rounded-2xl border border-border bg-card p-5 text-card-foreground shadow-sm">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">Movement practice · 2025</p>
            <h2 className="mt-1.5 text-xl font-semibold leading-7 tracking-tight">Make the pattern visible.</h2>
          </div>
          <span className="mt-1 hidden items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-[10px] text-muted-foreground min-[480px]:inline-flex"><svg aria-hidden="true" width="12" height="12" viewBox="0 0 12 12" fill="currentColor"><path d="M1 7h2v4H1zm4-6h2v10H5zm4 3h2v7H9z" /></svg>Daily practice</span>
        </div>
        {heatmap}
      </div>
      <a href={CCGATHER_URL} target="_blank" rel="noreferrer" className="text-[10px] text-muted-foreground underline underline-offset-4 hover:text-foreground">Made by the CCgather team</a>
    </div>
  );
}
