import { NextRequest, NextResponse } from "next/server";
import { fetchRepositoryDetail, GitHubApiError } from "@/lib/github-service";

interface RouteContext {
  params: Promise<{
    repo: string;
  }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { repo } = await context.params;
    const { searchParams } = new URL(request.url);
    const configuredOwner = process.env.GITHUB_USERNAME || "Inexpert-trifler";
    const owner = (searchParams.get("owner") || configuredOwner).trim();

    if (!repo) {
      return NextResponse.json(
        { error: "Repository name is required.", code: "MISSING_REPO_NAME" },
        { status: 400 }
      );
    }

    const data = await fetchRepositoryDetail(owner, repo);

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
        error: "Failed to fetch repository details.",
        details: message,
        code: "INTERNAL_ERROR",
      },
      { status: 500 }
    );
  }
}
