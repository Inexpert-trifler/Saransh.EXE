import { NextRequest, NextResponse } from "next/server";
import {
  fetchUserRepositories,
  fetchRepositoryDetail,
  GitHubApiError,
} from "@/lib/github-service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const configuredUsername = process.env.GITHUB_USERNAME || "Inexpert-trifler";
    const username = (searchParams.get("username") || configuredUsername).trim();
    const repo = searchParams.get("repo")?.trim();

    // If a specific repo is requested via query param
    if (repo) {
      const detail = await fetchRepositoryDetail(username, repo);
      return NextResponse.json(detail, {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
        },
      });
    }

    const data = await fetchUserRepositories(username);

    return NextResponse.json(data, {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
      },
    });
  } catch (error) {
    if (error instanceof GitHubApiError) {
      return NextResponse.json(
        {
          error: error.message,
          code: error.code,
        },
        { status: error.status }
      );
    }

    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json(
      {
        error: "Failed to process GitHub repository request.",
        details: message,
        code: "INTERNAL_ERROR",
      },
      { status: 500 }
    );
  }
}
