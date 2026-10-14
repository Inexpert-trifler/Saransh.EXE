"use client";

import * as React from "react";
import { GithubIcon } from "@/components/ui/icons";
import {
  Calendar,
  RefreshCw,
  AlertCircle,
  Flame,
  Zap,
  Award,
  TrendingUp,
  BarChart3,
  Activity,
} from "lucide-react";

export interface ActivityDatum {
  /** Local calendar date, YYYY-MM-DD. Duplicate dates use the last value. */
  date: string;
  value: number;
  level?: 0 | 1 | 2 | 3 | 4;
}

export type ActivityHeatmapView = "calendar" | "weekdays" | "months";

export interface ActivityHeatmapProps extends React.ComponentProps<"div"> {
  data: ActivityDatum[];
  username?: string;
  profileUrl?: string;
  totalContributions?: number;
  days?: number;
  endDate?: string | Date;
  cellSize?: number;
  color?: string;
  unit?: string;
  formatValue?: (value: number) => string;
  showMonths?: boolean;
  showWeekdays?: boolean;
  showLegend?: boolean;
  view?: ActivityHeatmapView;
  defaultView?: ActivityHeatmapView;
  onViewChange?: (view: ActivityHeatmapView) => void;
  autoPlay?: boolean;
  interval?: number;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

type Cell = {
  date: string;
  value: number;
  level: 0 | 1 | 2 | 3 | 4;
  day: number;
  week: number;
  month: string;
  label: string;
};

type Month = {
  key: string;
  label: string;
  cells: Cell[];
  firstWeek: number;
};

type Tip = {
  cell: Cell;
  x: number;
  y: number;
};

export interface HeatmapStats {
  totalContributions: number;
  activeDays: number;
  activeCadencePercent: number;
  longestStreak: number;
  currentStreak: number;
  mostActiveMonth: {
    key: string;
    label: string;
    total: number;
    activeDays: number;
  } | null;
  mostActiveWeekday: {
    name: string;
    shortName: string;
    total: number;
    activeDays: number;
  } | null;
}

const VIEWS: ActivityHeatmapView[] = ["calendar", "weekdays", "months"];
const VIEW_NAMES: Record<ActivityHeatmapView, string> = {
  calendar: "Calendar",
  weekdays: "Weekdays",
  months: "Months",
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const WEEKDAY_FULL_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

// 5-Level High Contrast Brutalist Palette
const LEVEL_PALETTE: Record<number, { bg: string; border: string; glow?: string }> = {
  0: {
    bg: "#151518",
    border: "1px solid rgba(255, 255, 255, 0.06)",
  },
  1: {
    bg: "#0e4429",
    border: "1px solid #145934",
  },
  2: {
    bg: "#006d32",
    border: "1px solid #00873d",
  },
  3: {
    bg: "#26a641",
    border: "1px solid #34c453",
  },
  4: {
    bg: "#B9FF66",
    border: "1px solid #d4ff99",
    glow: "0 0 8px rgba(185, 255, 102, 0.45)",
  },
};

const DATE_LABEL = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  month: "short",
  day: "numeric",
  year: "numeric",
});

const SHORT_DATE = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

const END_DATE = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

const MONTH_LABEL = new Intl.DateTimeFormat("en-US", {
  month: "short",
});

const FULL_MONTH_LABEL = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
});

function toKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function fromKey(key: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) return null;
  const [year = 0, month = 0, day = 0] = key.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return toKey(date) === key ? date : null;
}

export function formatCompact(value: number): string {
  if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
  if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
  return String(value);
}

export function formatContributionLabel(
  count: number,
  unit: string = "contributions",
  formatter: (v: number) => string = (v) => v.toLocaleString()
): string {
  if (count === 0) return `No ${unit}`;
  const unitSingular = unit.endsWith("s") ? unit.slice(0, -1) : unit;
  if (count === 1) return `1 ${unitSingular}`;
  return `${formatter(count)} ${unit}`;
}

// Calculate comprehensive real statistics from chronological contribution data
export function calculateHeatmapStats(
  days: Array<{ date: string; value: number }>,
  overrideTotal?: number
): HeatmapStats {
  if (!days || days.length === 0) {
    return {
      totalContributions: overrideTotal ?? 0,
      activeDays: 0,
      activeCadencePercent: 0,
      longestStreak: 0,
      currentStreak: 0,
      mostActiveMonth: null,
      mostActiveWeekday: null,
    };
  }

  const sorted = [...days].sort((a, b) => a.date.localeCompare(b.date));
  let calculatedTotal = 0;
  let activeDays = 0;
  let longestStreak = 0;
  let runningStreak = 0;

  const monthsMap = new Map<string, { key: string; label: string; total: number; activeDays: number }>();
  const weekdaysMap = Array.from({ length: 7 }, (_, i) => ({
    name: WEEKDAY_FULL_NAMES[i],
    shortName: WEEKDAYS[i],
    total: 0,
    activeDays: 0,
  }));

  for (let i = 0; i < sorted.length; i++) {
    const d = sorted[i];
    const val = d.value;
    calculatedTotal += val;

    if (val > 0) {
      activeDays += 1;
      runningStreak += 1;
      if (runningStreak > longestStreak) {
        longestStreak = runningStreak;
      }
    } else {
      runningStreak = 0;
    }

    // Month tracking
    const mKey = d.date.slice(0, 7);
    let mObj = monthsMap.get(mKey);
    if (!mObj) {
      const parsed = fromKey(`${mKey}-01`);
      mObj = {
        key: mKey,
        label: parsed ? FULL_MONTH_LABEL.format(parsed) : mKey,
        total: 0,
        activeDays: 0,
      };
      monthsMap.set(mKey, mObj);
    }
    mObj.total += val;
    if (val > 0) mObj.activeDays += 1;

    // Weekday tracking
    const [y, m, dayNum] = d.date.split("-").map(Number);
    const dateObj = new Date(y, m - 1, dayNum);
    const dow = dateObj.getDay();
    if (dow >= 0 && dow <= 6) {
      weekdaysMap[dow].total += val;
      if (val > 0) weekdaysMap[dow].activeDays += 1;
    }
  }

  // Current streak calculation from the end of the timeline
  let currentStreak = 0;
  const lastIdx = sorted.length - 1;
  if (lastIdx >= 0) {
    let startIdx = lastIdx;
    // If today has 0 contributions so far, check if yesterday was active
    if (sorted[lastIdx].value === 0 && lastIdx > 0 && sorted[lastIdx - 1].value > 0) {
      startIdx = lastIdx - 1;
    }

    for (let i = startIdx; i >= 0; i--) {
      if (sorted[i].value > 0) {
        currentStreak += 1;
      } else {
        break;
      }
    }
  }

  // Peak month determination
  let bestMonth: HeatmapStats["mostActiveMonth"] = null;
  for (const m of monthsMap.values()) {
    if (!bestMonth || m.total > bestMonth.total || (m.total === bestMonth.total && m.activeDays > bestMonth.activeDays)) {
      bestMonth = m;
    }
  }

  // Peak weekday determination
  let bestWeekday: HeatmapStats["mostActiveWeekday"] = null;
  for (const w of weekdaysMap) {
    if (!bestWeekday || w.activeDays > bestWeekday.activeDays || (w.activeDays === bestWeekday.activeDays && w.total > bestWeekday.total)) {
      bestWeekday = w;
    }
  }

  const totalContributions = overrideTotal ?? calculatedTotal;
  const activeCadencePercent = sorted.length > 0 ? (activeDays / sorted.length) * 100 : 0;

  return {
    totalContributions,
    activeDays,
    activeCadencePercent,
    longestStreak,
    currentStreak,
    mostActiveMonth: bestMonth,
    mostActiveWeekday: bestWeekday,
  };
}

function resolveLevel(
  value: number,
  explicitLevel?: 0 | 1 | 2 | 3 | 4,
  maxValue: number = 1
): 0 | 1 | 2 | 3 | 4 {
  if (explicitLevel !== undefined && explicitLevel >= 0 && explicitLevel <= 4) {
    return explicitLevel;
  }
  if (value <= 0) return 0;
  const ratio = value / Math.max(1, maxValue);
  if (ratio <= 0.25) return 1;
  if (ratio <= 0.5) return 2;
  if (ratio <= 0.75) return 3;
  return 4;
}

function buildDays(
  data: ActivityDatum[],
  daysCount: number,
  endKey: string | null
): Cell[] {
  const end = endKey ? fromKey(endKey) : null;
  if (!end) return [];

  const count = Number.isFinite(daysCount) ? Math.max(1, Math.floor(daysCount)) : 365;
  const start = new Date(end.getFullYear(), end.getMonth(), end.getDate() - count + 1);
  const offset = start.getDay();

  const byDate = new Map<string, { value: number; level?: 0 | 1 | 2 | 3 | 4 }>();
  for (const entry of data) {
    byDate.set(entry.date, {
      value: Number.isFinite(entry.value) ? Math.max(0, entry.value) : 0,
      level: entry.level,
    });
  }

  const maxVal = Math.max(1, ...data.map((d) => d.value || 0));

  return Array.from({ length: count }, (_, index) => {
    const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + index);
    const key = toKey(date);
    const entry = byDate.get(key);
    const value = entry ? entry.value : 0;
    const level = resolveLevel(value, entry?.level, maxVal);

    return {
      date: key,
      value,
      level,
      day: date.getDay(),
      week: Math.floor((index + offset) / 7),
      month: key.slice(0, 7),
      label: DATE_LABEL.format(date),
    };
  });
}

function strongestFirst(a: Cell, b: Cell) {
  return b.value - a.value || a.date.localeCompare(b.date);
}

const LEFT = 38; // Space for weekday labels
const HEADER_TOP = 22; // Compact space for month labels
const RIGHT_PAD = 8; // Minimal breathing room before right inner border

function arrange(cells: Cell[], containerContentWidth: number, customCellSize?: number) {
  const totalWeeks = Math.max(1, (cells.at(-1)?.week ?? 52) + 1);
  const totalGaps = Math.max(1, totalWeeks - 1);
  const usable = Math.max(280, containerContentWidth - LEFT - RIGHT_PAD);

  // Responsive Edge-to-Edge Cell Sizing:
  // Dynamically uses the full available width between weekday labels and the right border
  let edge: number;
  let gap: number;
  let calendarStep: number;
  let gridWidth: number;

  if (typeof customCellSize === "number" && customCellSize >= 8) {
    edge = customCellSize;
    gap = Math.max(2.5, Math.round(customCellSize * 0.22 * 10) / 10);
    calendarStep = edge + gap;
    gridWidth = totalGaps * calendarStep + edge;
  } else {
    // Distribute calendar weeks across the available width:
    // gridWidth = totalWeeks * edge + totalGaps * gap ~= usable
    // For optimal visual proportion, gap is ~22% of cell edge (gap = 0.22 * edge).
    // Therefore: totalWeeks * edge + totalGaps * 0.22 * edge = usable
    const divisor = totalWeeks + 0.22 * totalGaps;
    const rawEdge = usable / divisor;

    if (rawEdge < 12) {
      // Touch-friendly readable baseline for mobile scrollers
      edge = 12;
      gap = 3;
    } else {
      // Allow cells to scale continuously with container width (up to 26px)
      edge = Math.min(26, Math.floor(rawEdge * 10) / 10);
      // Distribute remaining usable space across all gaps:
      const remainingForGaps = usable - totalWeeks * edge;
      const rawGap = remainingForGaps / totalGaps;
      gap = Math.max(3, Math.min(6, Math.floor(rawGap * 10) / 10));
    }

    calendarStep = edge + gap;
    gridWidth = totalGaps * calendarStep + edge;
  }

  // plotWidth fills the card on desktop with zero scrollbar, and expands on mobile for touch scrolling
  const plotWidth = Math.max(containerContentWidth, LEFT + gridWidth + RIGHT_PAD);

  const weekdays: Cell[][] = Array.from({ length: 7 }, () => []);
  const months: Month[] = [];

  for (const cell of cells) {
    let month = months.find((entry) => entry.key === cell.month);
    if (!month) {
      const parsed = fromKey(cell.date);
      month = {
        key: cell.month,
        label: parsed ? MONTH_LABEL.format(parsed) : cell.month,
        cells: [],
        firstWeek: cell.week,
      };
      months.push(month);
    }
    if (cell.value > 0) {
      weekdays[cell.day].push(cell);
      month.cells.push(cell);
    }
  }

  weekdays.forEach((group) => group.sort(strongestFirst));
  months.forEach((month) => month.cells.sort(strongestFirst));

  const weekdayRanks = new Map(
    weekdays.flatMap((group) => group.map((cell, rank) => [cell.date, rank] as const))
  );
  const monthRanks = new Map(
    months.flatMap((month, column) =>
      month.cells.map((cell, rank) => [cell.date, { rank, column }] as const)
    )
  );

  const maxMonth = Math.max(1, ...months.map((m) => m.cells.length));
  const maxWeekday = Math.max(1, ...weekdays.map((g) => g.length));

  const weekdayStep = Math.min(edge + 2, (plotWidth - LEFT - RIGHT_PAD - edge) / Math.max(1, maxWeekday - 1));
  const monthColumnWidth = (plotWidth - LEFT - RIGHT_PAD) / Math.max(1, months.length);
  const BASELINE = HEADER_TOP + 7 * calendarStep - 10;
  const monthStep = Math.min(edge + 1, (BASELINE - 28) / maxMonth);

  const bestWeekday = weekdays.findIndex((group) => group.length === maxWeekday);
  const bestMonth = months.findIndex((month) => month.cells.length === maxMonth);

  return {
    shown: cells,
    totalWeeks,
    firstWeek: 0,
    weekdays,
    months,
    weekdayRanks,
    monthRanks,
    edge,
    gap,
    calendarStep,
    weekdayStep,
    monthStep,
    monthColumnWidth,
    plotWidth,
    BASELINE,
    bestWeekday,
    bestMonth,
  };
}

const EMPTY_LAYOUT = arrange([], 800);
type Layout = typeof EMPTY_LAYOUT;

function position(cell: Cell, view: ActivityHeatmapView, layout: Layout) {
  const calendar = {
    x: LEFT + cell.week * layout.calendarStep,
    y: HEADER_TOP + cell.day * layout.calendarStep,
  };

  if (view === "calendar" || cell.value <= 0) return calendar;

  if (view === "weekdays") {
    const rank = layout.weekdayRanks.get(cell.date) ?? 0;
    return {
      x: LEFT + rank * layout.weekdayStep,
      y: HEADER_TOP + cell.day * layout.calendarStep,
    };
  }

  const at = layout.monthRanks.get(cell.date);
  if (!at) return calendar;

  return {
    x: LEFT + (at.column + 0.5) * layout.monthColumnWidth - layout.edge / 2,
    y: layout.BASELINE - layout.edge - at.rank * layout.monthStep,
  };
}

function ViewIcon({ view }: { view: ActivityHeatmapView }) {
  return (
    <svg
      aria-hidden="true"
      className="shrink-0"
      width="13"
      height="13"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
    >
      {view === "calendar" ? (
        <>
          <rect x="2" y="3" width="12" height="11" rx="2" />
          <path d="M5 2v3m6-3v3M2 7h12M5 10h1m4 0h1" />
        </>
      ) : view === "weekdays" ? (
        <path d="M2 4h12M2 8h8M2 12h10" />
      ) : (
        <path d="M4 14V7m4 7V2m4 12V5" />
      )}
    </svg>
  );
}

// React Sync External Store subscribers to avoid setState in effects
function subscribeEmpty() {
  return () => {};
}

function getTodayClient(): string {
  return toKey(new Date());
}

function getTodayServer(): string | null {
  return null;
}

function subscribeReducedMotion(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

function getReducedMotionClient(): boolean {
  if (typeof window === "undefined") return true;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getReducedMotionServer(): boolean {
  return true;
}

export function ActivityHeatmap({
  data,
  username = "Inexpert-trifler",
  profileUrl = "https://github.com/Inexpert-trifler",
  totalContributions,
  days = 365,
  endDate,
  cellSize,
  color,
  unit = "contributions",
  formatValue = formatCompact,
  showMonths = true,
  showWeekdays = true,
  showLegend = true,
  view,
  defaultView = "calendar",
  onViewChange,
  autoPlay = false,
  interval = 3200,
  isLoading = false,
  error = null,
  onRetry,
  className = "",
  style,
  ...rest
}: ActivityHeatmapProps) {
  const [internalView, setInternalView] = React.useState<ActivityHeatmapView>(defaultView);
  const [width, setWidth] = React.useState(0);
  const [hovered, setHovered] = React.useState(false);
  const [focused, setFocused] = React.useState(false);
  const [stopped, setStopped] = React.useState(false);
  const [focusedDate, setFocusedDate] = React.useState("");
  const [tooltip, setTooltip] = React.useState<Tip | null>(null);

  const [containerNode, setContainerNode] = React.useState<HTMLDivElement | null>(null);
  const containerRef = React.useCallback((node: HTMLDivElement | null) => {
    if (node) {
      setContainerNode(node);
    }
  }, []);
  const tipRef = React.useRef<HTMLDivElement | null>(null);
  const plotRef = React.useRef<HTMLDivElement | null>(null);

  const today = React.useSyncExternalStore(subscribeEmpty, getTodayClient, getTodayServer);
  const reduced = React.useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionClient,
    getReducedMotionServer
  );

  const currentView = view ?? internalView;

  // Resolve end key: default to latest date in data, or today after mount
  const endKey = React.useMemo(() => {
    if (endDate instanceof Date) {
      return Number.isNaN(endDate.getTime()) ? null : toKey(endDate);
    }
    if (typeof endDate === "string") return endDate;
    if (data && data.length > 0) {
      return data[data.length - 1].date;
    }
    return today;
  }, [endDate, data, today]);

  const cells = React.useMemo(() => buildDays(data, days, endKey), [data, days, endKey]);

  // Layout calculations directly against measured inner width with smart desktop fallback
  const layout = React.useMemo(() => {
    let effectiveWidth = width;
    if (effectiveWidth <= 0) {
      if (typeof window !== "undefined" && window.innerWidth > 0) {
        effectiveWidth = Math.max(800, Math.min(window.innerWidth - 152, 1384));
      } else {
        effectiveWidth = 1200;
      }
    }
    return cells.length ? arrange(cells, effectiveWidth, cellSize) : EMPTY_LAYOUT;
  }, [cells, width, cellSize]);

  const stats = React.useMemo(() => {
    return calculateHeatmapStats(data, totalContributions);
  }, [data, totalContributions]);

  const ready = width > 0 && cells.length > 0;
  const visibleCells = currentView === "calendar" ? layout.shown : layout.shown.filter((cell) => cell.value > 0);
  const tabDate = visibleCells.some((cell) => cell.date === focusedDate) ? focusedDate : visibleCells[0]?.date;

  const bestDay = layout.weekdays[layout.bestWeekday];
  const bestMonth = layout.months[layout.bestMonth];
  const running = autoPlay && !reduced && !hovered && !focused && !stopped && ready;

  // Track the actual inner content width of the card via ResizeObserver
  React.useEffect(() => {
    if (!containerNode) return;

    const updateWidth = (inlineSize?: number) => {
      if (typeof inlineSize === "number" && inlineSize > 0) {
        setWidth(inlineSize);
        return;
      }
      const rect = containerNode.getBoundingClientRect();
      const style = window.getComputedStyle(containerNode);
      const paddingLeft = parseFloat(style.paddingLeft) || 0;
      const paddingRight = parseFloat(style.paddingRight) || 0;
      const innerW = rect.width - paddingLeft - paddingRight;
      if (innerW > 0) {
        setWidth(innerW);
      }
    };

    // Immediately capture initial inner content width to prevent layout jump
    updateWidth();

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentBoxSize && entry.contentBoxSize.length > 0) {
          updateWidth(entry.contentBoxSize[0].inlineSize);
        } else if (entry.contentRect && entry.contentRect.width > 0) {
          updateWidth(entry.contentRect.width);
        }
      }
      setTooltip(null);
    });

    observer.observe(containerNode);
    return () => observer.disconnect();
  }, [containerNode]);

  const changeView = React.useCallback(
    (next: ActivityHeatmapView, manual = false) => {
      if (manual) setStopped(true);
      setTooltip(null);
      if (next === currentView) return;
      if (view === undefined) setInternalView(next);
      onViewChange?.(next);
    },
    [currentView, view, onViewChange]
  );

  React.useEffect(() => {
    if (!running) return;
    const timer = window.setTimeout(
      () => changeView(VIEWS[(VIEWS.indexOf(currentView) + 1) % VIEWS.length]!),
      Math.max(900, interval)
    );
    return () => window.clearTimeout(timer);
  }, [running, interval, currentView, changeView]);

  React.useEffect(() => {
    const clear = () => setTooltip(null);
    window.addEventListener("scroll", clear, true);
    return () => window.removeEventListener("scroll", clear, true);
  }, []);

  // Bounded floating tooltip layout
  React.useLayoutEffect(() => {
    const tip = tipRef.current;
    if (!tip || !tooltip) return;
    const bounds = tip.getBoundingClientRect();
    const halfWidth = bounds.width / 2;
    let left = tooltip.x - halfWidth;
    let top = tooltip.y - bounds.height - 10;

    if (top < 12) {
      top = tooltip.y + 24; // Show below if top would overflow screen
    }

    left = Math.max(12, Math.min(window.innerWidth - bounds.width - 12, left));

    tip.style.left = `${left}px`;
    tip.style.top = `${top}px`;
  }, [tooltip]);

  const showTooltip = (cell: Cell, target: HTMLElement) => {
    const rect = target.getBoundingClientRect();
    setTooltip({
      cell,
      x: rect.left + rect.width / 2,
      y: rect.top,
    });
  };

  const navigateDay = (event: React.KeyboardEvent, cell: Cell) => {
    if (event.key === "Escape") {
      setTooltip(null);
      return;
    }
    const directions: Record<string, [number, number]> = {
      ArrowRight: [1, 0],
      ArrowLeft: [-1, 0],
      ArrowDown: [0, 1],
      ArrowUp: [0, -1],
    };
    const direction = directions[event.key];
    if (!direction && event.key !== "Home" && event.key !== "End") return;
    event.preventDefault();
    setStopped(true);

    let next = event.key === "Home" ? visibleCells[0] : event.key === "End" ? visibleCells.at(-1) : undefined;
    if (direction) {
      const here = position(cell, currentView, layout);
      const candidates = visibleCells
        .map((candidate) => {
          const at = position(candidate, currentView, layout);
          const dx = at.x - here.x;
          const dy = at.y - here.y;
          const forward = dx * direction[0] + dy * direction[1];
          const sideways = Math.abs(dx * direction[1] - dy * direction[0]);
          return { cell: candidate, forward, distance: forward + sideways * 20 };
        })
        .filter((c) => c.forward > 0.5)
        .sort((a, b) => a.distance - b.distance);
      next = candidates[0]?.cell;
    }

    if (next) {
      const el = plotRef.current?.querySelector(`[data-date="${next.date}"]`) as HTMLButtonElement | null;
      el?.focus();
    }
  };

  const firstDate = layout.shown[0];
  const lastDate = layout.shown.at(-1);
  const rangeLabel =
    firstDate && lastDate
      ? `${SHORT_DATE.format(fromKey(firstDate.date)!)} – ${END_DATE.format(fromKey(lastDate.date)!)}`
      : "365 Days";

  const insight =
    !stats.activeDays
      ? `No active ${unit} recorded in this period`
      : currentView === "weekdays" && bestDay
      ? `${WEEKDAYS[layout.bestWeekday]} leads with ${bestDay.length} active days`
      : currentView === "months" && bestMonth
      ? `${bestMonth.label} leads with ${bestMonth.cells.length} active days`
      : "Consistent velocity yields compounding engineering impact.";

  const dynamicPalette = React.useMemo(() => {
    if (!color) return LEVEL_PALETTE;
    return {
      ...LEVEL_PALETTE,
      4: {
        bg: color,
        border: `1px solid ${color}`,
        glow: `0 0 8px ${color}80`,
      },
    };
  }, [color]);

  // Loading State Skeleton
  if (isLoading) {
    return (
      <div
        ref={containerRef}
        className={`w-full rounded-2xl border border-white/10 bg-[#0c0c0c] p-6 sm:p-8 text-white shadow-2xl backdrop-blur-md animate-pulse ${className}`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-white/10">
          <div>
            <div className="h-3 w-44 rounded bg-white/10 mb-2" />
            <div className="h-7 w-72 rounded bg-white/15 mb-2" />
            <div className="h-3 w-28 rounded bg-white/10" />
          </div>
          <div className="h-9 w-36 rounded-xl bg-white/10" />
        </div>
        <div className="h-40 w-full rounded bg-white/5 my-5" />
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 pt-4 border-t border-white/10">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex flex-col gap-2 p-3 bg-white/[0.02] rounded-xl border border-white/5">
              <div className="h-3 w-20 rounded bg-white/10" />
              <div className="h-6 w-16 rounded bg-white/15" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error State
  if (error && (!data || data.length === 0)) {
    return (
      <div
        className={`w-full rounded-2xl border border-red-500/20 bg-[#0c0c0c] p-6 sm:p-8 text-white shadow-2xl ${className}`}
      >
        <div className="flex items-center gap-3 text-red-400 mb-3">
          <AlertCircle className="h-5 w-5" />
          <h3 className="font-mono text-sm font-semibold uppercase tracking-wider">
            GitHub Telemetry Connection Failed
          </h3>
        </div>
        <p className="text-sm text-[#a1a1aa] mb-5">{error}</p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/15 px-4 py-2 font-mono text-xs font-semibold text-white transition-all"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Retry Connection
          </button>
        )}
      </div>
    );
  }

  // Exact vertical height of plot to fit content with zero excess
  const plotContentHeight =
    currentView === "months"
      ? layout.BASELINE + 26
      : HEADER_TOP + 7 * layout.calendarStep + 4;

  return (
    <div
      {...rest}
      ref={containerRef}
      data-slot="activity-heatmap"
      data-view={currentView}
      data-ready={ready}
      className={`w-full min-w-0 rounded-2xl border border-white/10 bg-[#0c0c0c] p-5 sm:p-7 text-white shadow-2xl backdrop-blur-sm transition-all ${className}`}
      style={style}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        setTooltip(null);
      }}
      onFocus={() => setFocused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          setFocused(false);
        }
      }}
    >
      {/* 1. Compact Header Row with Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-[#B9FF66]">
            DEVELOPER ACTIVITY · GITHUB
          </span>
          <h3 className="mt-0.5 text-2xl sm:text-3xl font-black tracking-tight text-white uppercase">
            GitHub Contribution Activity
          </h3>
          <p className="mt-0.5 font-mono text-xs text-[#a1a1aa] tracking-wider uppercase">
            365 DAYS OF CODE · {formatValue(stats.totalContributions)} CONTRIBUTIONS
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Segmented Controls: Calendar / Weekdays / Months */}
          <div
            role="radiogroup"
            aria-label="Heatmap layout"
            className="inline-flex items-center gap-1 rounded-xl bg-[#141416] p-1 border border-white/5"
            onKeyDown={(event) => {
              let next = -1;
              if (event.key === "ArrowRight" || event.key === "ArrowDown") {
                next = (VIEWS.indexOf(currentView) + 1) % 3;
              }
              if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
                next = (VIEWS.indexOf(currentView) + 2) % 3;
              }
              if (event.key === "Home") next = 0;
              if (event.key === "End") next = 2;
              if (next < 0) return;
              event.preventDefault();
              changeView(VIEWS[next]!, true);
              (
                event.currentTarget.querySelector(
                  `[data-view-option="${VIEWS[next]}"]`
                ) as HTMLButtonElement | null
              )?.focus();
            }}
          >
            {VIEWS.map((option) => {
              const isActive = currentView === option;
              return (
                <button
                  key={option}
                  type="button"
                  role="radio"
                  data-view-option={option}
                  aria-checked={isActive}
                  tabIndex={isActive ? 0 : -1}
                  onClick={() => changeView(option, true)}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-[#B9FF66] text-[#080808] font-bold shadow-sm"
                      : "text-[#a1a1aa] hover:text-white hover:bg-white/5"
                  }`}
                >
                  <ViewIcon view={option} />
                  {VIEW_NAMES[option]}
                </button>
              );
            })}
          </div>

          {/* GitHub Profile Link */}
          <a
            href={profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-[#141416] px-3.5 py-1.5 font-mono text-xs text-white hover:border-[#B9FF66]/50 hover:text-[#B9FF66] transition-all group"
          >
            <GithubIcon className="h-3.5 w-3.5 text-[#a1a1aa] group-hover:text-[#B9FF66] transition-colors" />
            <span>@{username}</span>
          </a>
        </div>
      </div>

      {/* 2. Primary Contribution Visualization (Stretches Edge-to-Edge) */}
      <div className="relative my-3 w-full overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        <div
          ref={plotRef}
          role="group"
          aria-label={`${VIEW_NAMES[currentView]} contribution activity`}
          data-plot
          className="relative transition-[height] duration-250 ease-out"
          style={{
            width: layout.plotWidth,
            minWidth: layout.plotWidth,
            height: plotContentHeight,
          }}
        >
          {/* Weekday Labels (Down the left column) */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            {WEEKDAYS.map((day, index) => {
              const y = HEADER_TOP + index * layout.calendarStep;
              return (
                <div
                  key={day}
                  style={{
                    position: "absolute",
                    left: 0,
                    top: y,
                    height: layout.edge,
                    opacity: currentView === "months" ? 0 : 1,
                    transition: reduced ? "none" : "opacity 180ms ease",
                  }}
                  className="flex items-center"
                >
                  {showWeekdays && (
                    <span
                      className={`w-[34px] font-mono text-[10px] uppercase tracking-wider ${
                        currentView === "weekdays" && index === layout.bestWeekday
                          ? "font-bold text-[#B9FF66]"
                          : "text-[#71717a]"
                      }`}
                    >
                      {day}
                    </span>
                  )}
                </div>
              );
            })}

            {/* Month Labels (Across the top in Calendar view, bottom in Months view) */}
            {showMonths &&
              layout.months.map((month, index) => {
                const isBar = currentView === "months";
                const x = isBar
                  ? LEFT + (index + 0.5) * layout.monthColumnWidth
                  : LEFT + month.firstWeek * layout.calendarStep;
                const countY =
                  layout.BASELINE -
                  (month.cells.length ? layout.edge + (month.cells.length - 1) * layout.monthStep : 0) -
                  16;

                return (
                  <React.Fragment key={month.key}>
                    <span
                      data-month-label={month.key}
                      className={`absolute font-mono text-[10px] tracking-wider uppercase transition-all duration-300 ${
                        isBar && index === layout.bestMonth
                          ? "font-bold text-[#B9FF66]"
                          : "text-[#71717a]"
                      }`}
                      style={{
                        left: x,
                        top: isBar ? layout.BASELINE + 6 : 2,
                        transform: isBar ? "translateX(-50%)" : undefined,
                        opacity: currentView === "weekdays" ? 0 : 1,
                      }}
                    >
                      {month.label}
                    </span>

                    {isBar && (
                      <span
                        data-month-count={month.key}
                        className={`absolute font-mono text-[10px] tabular-nums font-semibold transition-all duration-300 ${
                          index === layout.bestMonth ? "text-[#B9FF66]" : "text-[#a1a1aa]"
                        }`}
                        style={{
                          left: x,
                          top: countY,
                          transform: "translateX(-50%)",
                        }}
                      >
                        {month.cells.length}
                      </span>
                    )}
                  </React.Fragment>
                );
              })}
          </div>

          {/* Individual Contribution Cells */}
          {layout.shown.map((cell, index) => {
            const at = position(cell, currentView, layout);
            const visible = currentView === "calendar" || cell.value > 0;
            const palette = dynamicPalette[cell.level];

            return (
              <button
                key={cell.date}
                type="button"
                data-date={cell.date}
                data-value={cell.value}
                data-level={cell.level}
                aria-label={`${cell.label}: ${formatContributionLabel(cell.value, unit, formatValue)}`}
                tabIndex={visible && cell.date === tabDate ? 0 : -1}
                disabled={!visible}
                className="absolute left-0 top-0 m-0 cursor-pointer rounded-[3px] p-0 outline-none transition-transform transition-shadow duration-150 hover:scale-125 hover:z-30 hover:ring-2 hover:ring-[#B9FF66] focus-visible:z-30 focus-visible:ring-2 focus-visible:ring-[#B9FF66]"
                style={{
                  width: layout.edge,
                  height: layout.edge,
                  transform: `translate(${at.x}px, ${at.y}px)`,
                  opacity: visible ? 1 : 0,
                  pointerEvents: visible ? "auto" : "none",
                  backgroundColor: palette.bg,
                  border: palette.border,
                  boxShadow: palette.glow,
                  transitionProperty: "transform, opacity",
                  transitionDuration: reduced ? "0ms" : "450ms",
                  transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
                  transitionDelay: reduced ? "0ms" : `${(index % 13) * 6}ms`,
                }}
                onPointerEnter={(e) => showTooltip(cell, e.currentTarget)}
                onPointerLeave={() => setTooltip(null)}
                onFocus={(e) => {
                  setFocusedDate(cell.date);
                  showTooltip(cell, e.currentTarget);
                }}
                onBlur={() => setTooltip(null)}
                onKeyDown={(e) => navigateDay(e, cell)}
              />
            );
          })}
        </div>
      </div>

      {/* 3. Tightly-Coupled Sub-bar: Date Range, Live Insight, and Intensity Legend */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-3 border-t border-white/10 text-xs font-mono text-[#a1a1aa]">
        {/* Date Range */}
        <div className="flex items-center gap-2">
          <Calendar className="h-3.5 w-3.5 text-[#B9FF66]" />
          <span>{rangeLabel}</span>
        </div>

        {/* Dynamic Live Insight */}
        <div className="flex items-center gap-1.5 text-[11px] text-[#a1a1aa]">
          <span className="inline-block h-2 w-2 rounded-full bg-[#B9FF66] animate-pulse" />
          <span>{insight}</span>
        </div>

        {/* 5-Level Intensity Legend */}
        {showLegend && (
          <div className="flex items-center gap-2" aria-label="Contribution intensity: less to more">
            <span className="text-[11px] uppercase tracking-wider">Less</span>
            <div className="flex items-center gap-1.5">
              {[0, 1, 2, 3, 4].map((level) => {
                const item = dynamicPalette[level];
                return (
                  <span
                    key={level}
                    className="h-3.5 w-3.5 rounded-[2px] transition-transform hover:scale-110"
                    style={{
                      backgroundColor: item.bg,
                      border: item.border,
                      boxShadow: item.glow,
                    }}
                  />
                );
              })}
            </div>
            <span className="text-[11px] uppercase tracking-wider">More</span>
          </div>
        )}
      </div>

      {/* 4. Compact Telemetry Insights Panel (Fills the Bottom Seamlessly) */}
      <div className="pt-4 mt-4 border-t border-white/10">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <Activity className="h-3.5 w-3.5 text-[#B9FF66]" />
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-white">
              GitHub Telemetry Insights
            </span>
          </div>
          <span className="font-mono text-[10px] text-[#B9FF66] bg-[#B9FF66]/10 px-2 py-0.5 rounded-full border border-[#B9FF66]/20">
            Live Verified
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {/* Total Contributions */}
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 hover:border-white/10 transition-colors">
            <div className="flex items-center justify-between text-[#a1a1aa]">
              <span className="font-mono text-[10px] uppercase tracking-wider">Total</span>
              <BarChart3 className="h-3 w-3 text-[#B9FF66]" />
            </div>
            <p className="mt-1 font-mono text-xl sm:text-2xl font-bold tracking-tight text-white tabular-nums">
              {formatValue(stats.totalContributions)}
            </p>
            <p className="mt-0.5 text-[10px] font-mono text-[#71717a]">365-day total</p>
          </div>

          {/* Active Days */}
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 hover:border-white/10 transition-colors">
            <div className="flex items-center justify-between text-[#a1a1aa]">
              <span className="font-mono text-[10px] uppercase tracking-wider">Active Days</span>
              <Zap className="h-3 w-3 text-[#B9FF66]" />
            </div>
            <p className="mt-1 font-mono text-xl sm:text-2xl font-bold tracking-tight text-[#B9FF66] tabular-nums">
              {formatValue(stats.activeDays)}
            </p>
            <p className="mt-0.5 text-[10px] font-mono text-[#a1a1aa]">
              {stats.activeCadencePercent.toFixed(1)}% cadence
            </p>
          </div>

          {/* Longest Streak */}
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 hover:border-white/10 transition-colors">
            <div className="flex items-center justify-between text-[#a1a1aa]">
              <span className="font-mono text-[10px] uppercase tracking-wider">Longest Streak</span>
              <Award className="h-3 w-3 text-[#B9FF66]" />
            </div>
            <p className="mt-1 font-mono text-xl sm:text-2xl font-bold tracking-tight text-white tabular-nums">
              {stats.longestStreak} <span className="text-xs font-normal text-[#a1a1aa]">days</span>
            </p>
            <p className="mt-0.5 text-[10px] font-mono text-[#71717a]">Consecutive run</p>
          </div>

          {/* Current Streak */}
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 hover:border-white/10 transition-colors">
            <div className="flex items-center justify-between text-[#a1a1aa]">
              <span className="font-mono text-[10px] uppercase tracking-wider">Current Streak</span>
              <Flame className="h-3 w-3 text-[#B9FF66]" />
            </div>
            <p className="mt-1 font-mono text-xl sm:text-2xl font-bold tracking-tight text-white tabular-nums">
              {stats.currentStreak} <span className="text-xs font-normal text-[#a1a1aa]">days</span>
            </p>
            <p className="mt-0.5 text-[10px] font-mono text-[#71717a]">
              {stats.currentStreak > 0 ? "Active sprint" : "Awaiting commit"}
            </p>
          </div>

          {/* Most Active Month */}
          {stats.mostActiveMonth && (
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 hover:border-white/10 transition-colors">
              <div className="flex items-center justify-between text-[#a1a1aa]">
                <span className="font-mono text-[10px] uppercase tracking-wider">Peak Month</span>
                <TrendingUp className="h-3 w-3 text-[#B9FF66]" />
              </div>
              <p className="mt-1 font-mono text-base sm:text-lg font-bold tracking-tight text-white truncate">
                {stats.mostActiveMonth.label}
              </p>
              <p className="mt-0.5 text-[10px] font-mono text-[#B9FF66]">
                {stats.mostActiveMonth.total} contributions
              </p>
            </div>
          )}

          {/* Most Active Weekday */}
          {stats.mostActiveWeekday && (
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 hover:border-white/10 transition-colors">
              <div className="flex items-center justify-between text-[#a1a1aa]">
                <span className="font-mono text-[10px] uppercase tracking-wider">Peak Weekday</span>
                <Calendar className="h-3 w-3 text-[#B9FF66]" />
              </div>
              <p className="mt-1 font-mono text-base sm:text-lg font-bold tracking-tight text-white truncate">
                {stats.mostActiveWeekday.name}
              </p>
              <p className="mt-0.5 text-[10px] font-mono text-[#a1a1aa]">
                {stats.mostActiveWeekday.activeDays} active days
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Accessible Floating Tooltip */}
      {tooltip && (
        <div
          ref={tipRef}
          role="tooltip"
          className="pointer-events-none fixed z-50 rounded-xl border border-white/15 bg-[#141416]/95 px-3 py-2 text-white shadow-2xl backdrop-blur-md"
          style={{ left: 12, top: 12 }}
        >
          <p className="font-mono text-[11px] text-[#a1a1aa]">{tooltip.cell.label}</p>
          <p className="mt-1 flex items-center gap-1.5 font-sans text-xs font-bold text-white">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{
                backgroundColor: dynamicPalette[tooltip.cell.level].bg,
                border: dynamicPalette[tooltip.cell.level].border,
              }}
            />
            {formatContributionLabel(tooltip.cell.value, unit, formatValue)}
          </p>
        </div>
      )}
    </div>
  );
}

export default ActivityHeatmap;
