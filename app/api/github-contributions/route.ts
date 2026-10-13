import { NextRequest, NextResponse } from "next/server";

export interface ContributionDayItem {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export interface GitHubContributionsResponse {
  username: string;
  totalContributions: number;
  period: {
    start: string;
    end: string;
  };
  updatedAt: string;
  days: ContributionDayItem[];
  source: "live";
}

interface GraphQLContributionDay {
  date: string;
  contributionCount: number;
  contributionLevel?: string;
  weekday?: number;
}

interface GraphQLWeek {
  contributionDays: GraphQLContributionDay[];
}

interface GraphQLContributionsCollection {
  contributionCalendar: {
    totalContributions: number;
    weeks: GraphQLWeek[];
  };
}

interface GraphQLResponse {
  data?: {
    user?: {
      contributionsCollection?: GraphQLContributionsCollection;
    } | null;
  };
  errors?: Array<{
    message: string;
    type?: string;
  }>;
}

function mapContributionLevel(level?: string, count: number = 0): 0 | 1 | 2 | 3 | 4 {
  switch (level) {
    case "FOURTH_QUARTILE":
      return 4;
    case "THIRD_QUARTILE":
      return 3;
    case "SECOND_QUARTILE":
      return 2;
    case "FIRST_QUARTILE":
      return 1;
    case "NONE":
      return 0;
    default:
      if (count > 9) return 4;
      if (count > 6) return 3;
      if (count > 3) return 2;
      if (count > 0) return 1;
      return 0;
  }
}

const GITHUB_USERNAME_REGEX = /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const requestedUsername = searchParams.get("username");
    const username = (requestedUsername || process.env.GITHUB_USERNAME || "Inexpert-trifler").trim();

    if (!username || !GITHUB_USERNAME_REGEX.test(username)) {
      return NextResponse.json(
        {
          error: "Invalid GitHub username format. Usernames must be 1-39 alphanumeric characters or single hyphens.",
          code: "INVALID_USERNAME",
          username,
        },
        { status: 400 }
      );
    }

    const token = process.env.GITHUB_TOKEN?.trim();

    // If token is missing, provide a safe, clear setup response
    if (!token) {
      return NextResponse.json(
        {
          error:
            "GITHUB_TOKEN is not configured in environment variables. GitHub's GraphQL API requires a Personal Access Token (PAT) with 'read:user' permissions to query the contribution calendar.",
          code: "MISSING_TOKEN",
          username,
        },
        {
          status: 401,
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );
    }

    // Rolling approximately one year period (364 days = 52 weeks, strictly within GitHub's 1-year max limit)
    const toDate = new Date();
    const fromDate = new Date(toDate.getTime() - 364 * 24 * 60 * 60 * 1000);

    const query = `
      query getContributions($username: String!, $from: DateTime!, $to: DateTime!) {
        user(login: $username) {
          contributionsCollection(from: $from, to: $to) {
            contributionCalendar {
              totalContributions
              weeks {
                contributionDays {
                  date
                  contributionCount
                  contributionLevel
                  weekday
                }
              }
            }
          }
        }
      }
    `;

    const githubRes = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": `SARANSH-EXE-Portfolio/${username}`,
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        query,
        variables: {
          username,
          from: fromDate.toISOString(),
          to: toDate.toISOString(),
        },
      }),
      next: { revalidate: 3600 },
    });

    if (githubRes.status === 401) {
      return NextResponse.json(
        {
          error: "GitHub authentication failed. Please verify that your GITHUB_TOKEN is valid and has not expired.",
          code: "INVALID_TOKEN",
          username,
        },
        { status: 401 }
      );
    }

    if (githubRes.status === 403) {
      return NextResponse.json(
        {
          error: "GitHub API rate limit exceeded or access forbidden.",
          code: "RATE_LIMITED",
          username,
        },
        { status: 429 }
      );
    }

    if (!githubRes.ok) {
      return NextResponse.json(
        {
          error: `GitHub API returned unexpected HTTP status: ${githubRes.status}.`,
          code: "GITHUB_HTTP_ERROR",
          username,
        },
        { status: 502 }
      );
    }

    const json: GraphQLResponse = await githubRes.json();

    // Check GraphQL errors array even if HTTP status was 200
    if (json.errors && json.errors.length > 0) {
      const firstError = json.errors[0];
      const errMsg = firstError.message || "Unknown GraphQL error";

      if (errMsg.toLowerCase().includes("could not resolve to a user") || errMsg.toLowerCase().includes("not found")) {
        return NextResponse.json(
          {
            error: `GitHub user '${username}' not found.`,
            code: "USER_NOT_FOUND",
            username,
          },
          { status: 404 }
        );
      }

      if (firstError.type === "RATE_LIMITED" || errMsg.toLowerCase().includes("rate limit")) {
        return NextResponse.json(
          {
            error: "GitHub API rate limit reached. Please wait before retrying.",
            code: "RATE_LIMITED",
            username,
          },
          { status: 429 }
        );
      }

      return NextResponse.json(
        {
          error: errMsg,
          code: "GRAPHQL_ERROR",
          username,
        },
        { status: 502 }
      );
    }

    const calendar = json.data?.user?.contributionsCollection?.contributionCalendar;
    if (!json.data?.user) {
      return NextResponse.json(
        {
          error: `GitHub user '${username}' not found.`,
          code: "USER_NOT_FOUND",
          username,
        },
        { status: 404 }
      );
    }

    if (!calendar || !calendar.weeks) {
      return NextResponse.json(
        {
          error: "Contribution calendar data is unavailable for this user.",
          code: "EMPTY_CALENDAR",
          username,
        },
        { status: 502 }
      );
    }

    // Flatten all contribution days from the calendar weeks
    const flattenedDays: ContributionDayItem[] = [];
    for (const week of calendar.weeks) {
      if (Array.isArray(week.contributionDays)) {
        for (const day of week.contributionDays) {
          if (day?.date) {
            flattenedDays.push({
              date: day.date,
              count: Math.max(0, typeof day.contributionCount === "number" ? day.contributionCount : 0),
              level: mapContributionLevel(day.contributionLevel, day.contributionCount),
            });
          }
        }
      }
    }

    // Sort ascending by date
    flattenedDays.sort((a, b) => a.date.localeCompare(b.date));

    const periodStart = flattenedDays.length > 0 ? flattenedDays[0].date : fromDate.toISOString().split("T")[0];
    const periodEnd = flattenedDays.length > 0 ? flattenedDays[flattenedDays.length - 1].date : toDate.toISOString().split("T")[0];

    const payload: GitHubContributionsResponse = {
      username,
      totalContributions:
        typeof calendar.totalContributions === "number"
          ? calendar.totalContributions
          : flattenedDays.reduce((acc, d) => acc + d.count, 0),
      period: {
        start: periodStart,
        end: periodEnd,
      },
      updatedAt: new Date().toISOString(),
      days: flattenedDays,
      source: "live",
    };

    return NextResponse.json(payload, {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json(
      {
        error: "Failed to communicate with GitHub API.",
        details: process.env.NODE_ENV === "development" ? message : undefined,
        code: "INTERNAL_ERROR",
      },
      { status: 500 }
    );
  }
}
