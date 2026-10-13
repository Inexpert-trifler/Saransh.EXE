import {
  NormalizedRepository,
  ReadmeDetails,
  RepositoriesApiResponse,
  RepositoryDetailApiResponse,
} from "./github-types";
import { parseReadmeContent } from "./github-readme-parser";

const USERNAME_REGEX = /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/;
const GITHUB_API_BASE = "https://api.github.com";

export class GitHubApiError extends Error {
  status: number;
  code: string;

  constructor(message: string, status: number, code: string) {
    super(message);
    this.name = "GitHubApiError";
    this.status = status;
    this.code = code;
  }
}

/**
 * Builds request headers with server-side authorization if configured
 */
function getGithubHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    "User-Agent": "SARANSH-EXE-Portfolio/1.0",
    Accept: "application/vnd.github.v3+json",
  };

  const token = process.env.GITHUB_TOKEN?.trim();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
}

/**
 * Validates a GitHub username
 */
export function validateUsername(username: string): void {
  if (!username || !USERNAME_REGEX.test(username)) {
    throw new GitHubApiError(
      `Invalid GitHub username format: "${username}".`,
      400,
      "INVALID_USERNAME"
    );
  }
}

interface GitHubRepoPayload {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  topics?: string[];
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  fork: boolean;
  archived: boolean;
  private: boolean;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  default_branch: string;
  size: number;
}

/**
 * Fetches all public repositories for a user with pagination
 */
export async function fetchUserRepositories(
  username: string
): Promise<RepositoriesApiResponse> {
  validateUsername(username);

  const headers = getGithubHeaders();
  const allRepos: GitHubRepoPayload[] = [];
  let page = 1;
  const perPage = 100;
  let hasMore = true;

  while (hasMore) {
    const url = `${GITHUB_API_BASE}/users/${encodeURIComponent(
      username
    )}/repos?per_page=${perPage}&page=${page}&sort=updated&direction=desc&type=all`;

    const res = await fetch(url, {
      headers,
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      if (res.status === 403 || res.status === 429) {
        const remaining = res.headers.get("x-ratelimit-remaining");
        const reset = res.headers.get("x-ratelimit-reset");
        const resetDate = reset ? new Date(parseInt(reset, 10) * 1000).toLocaleTimeString() : "later";

        throw new GitHubApiError(
          `GitHub API rate limit exceeded (remaining: ${remaining || "0"}). Window resets at ${resetDate}. Consider configuring GITHUB_TOKEN for higher rate limits.`,
          429,
          "RATE_LIMITED"
        );
      }

      if (res.status === 404) {
        throw new GitHubApiError(
          `GitHub user "${username}" was not found.`,
          404,
          "USER_NOT_FOUND"
        );
      }

      throw new GitHubApiError(
        `Failed to fetch repositories from GitHub (status ${res.status}).`,
        res.status,
        "GITHUB_ERROR"
      );
    }

    const data = await res.json();
    if (!Array.isArray(data)) {
      throw new GitHubApiError(
        "Unexpected response format from GitHub API.",
        502,
        "MALFORMED_RESPONSE"
      );
    }

    allRepos.push(...data);

    // Stop if less than perPage returned or safety threshold reached
    if (data.length < perPage || page >= 5) {
      hasMore = false;
    } else {
      page++;
    }
  }

  // Filter out any private repos just in case and map to NormalizedRepository
  const publicRepos = allRepos.filter((r) => !r.private);

  // Compute metrics
  let totalStars = 0;
  let totalForks = 0;
  const languageCounts: Record<string, number> = {};

  const normalized: NormalizedRepository[] = publicRepos.map((r) => {
    totalStars += r.stargazers_count || 0;
    totalForks += r.forks_count || 0;

    if (r.language) {
      languageCounts[r.language] = (languageCounts[r.language] || 0) + 1;
    }

    return {
      id: r.id,
      name: r.name,
      fullName: r.full_name,
      description: r.description || null,
      htmlUrl: r.html_url,
      homepage: r.homepage || null,
      language: r.language || null,
      topics: Array.isArray(r.topics) ? r.topics : [],
      stars: r.stargazers_count || 0,
      forks: r.forks_count || 0,
      openIssues: r.open_issues_count || 0,
      isFork: Boolean(r.fork),
      isArchived: Boolean(r.archived),
      createdAt: r.created_at,
      updatedAt: r.updated_at,
      pushedAt: r.pushed_at,
      defaultBranch: r.default_branch || "main",
      size: r.size || 0,
      readmeAvailable: false, // will be enriched on demand or for top repos
    };
  });

  const languages = Object.entries(languageCounts)
    .map(([language, count]) => ({ language, count }))
    .sort((a, b) => b.count - a.count);

  return {
    username,
    totalRepositories: normalized.length,
    totalStars,
    totalForks,
    languages,
    repositories: normalized,
    updatedAt: new Date().toISOString(),
    source: "live",
  };
}

/**
 * Fetches and parses a repository's README
 */
export async function fetchRepositoryReadme(
  owner: string,
  repo: string,
  defaultBranch = "main",
  homepage: string | null = null
): Promise<{ readmeAvailable: boolean; readme: ReadmeDetails | null }> {
  validateUsername(owner);

  const headers = getGithubHeaders();
  const url = `${GITHUB_API_BASE}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(
    repo
  )}/readme`;

  try {
    const res = await fetch(url, {
      headers,
      next: { revalidate: 3600 },
    });

    if (res.status === 404) {
      return { readmeAvailable: false, readme: null };
    }

    if (!res.ok) {
      if (res.status === 403 || res.status === 429) {
        throw new GitHubApiError(
          "GitHub API rate limit reached while fetching repository README.",
          429,
          "RATE_LIMITED"
        );
      }
      return { readmeAvailable: false, readme: null };
    }

    const data = await res.json();
    if (!data.content) {
      return { readmeAvailable: false, readme: null };
    }

    const rawMarkdown = Buffer.from(data.content, "base64").toString("utf-8");
    const parsed = parseReadmeContent(rawMarkdown, {
      owner,
      repo,
      defaultBranch,
      homepage,
    });

    return {
      readmeAvailable: true,
      readme: parsed,
    };
  } catch (error) {
    if (error instanceof GitHubApiError) throw error;
    return { readmeAvailable: false, readme: null };
  }
}

/**
 * Fetches single repository details + parsed README
 */
export async function fetchRepositoryDetail(
  owner: string,
  repo: string
): Promise<RepositoryDetailApiResponse> {
  validateUsername(owner);

  const headers = getGithubHeaders();
  const url = `${GITHUB_API_BASE}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(
    repo
  )}`;

  const res = await fetch(url, {
    headers,
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    if (res.status === 404) {
      throw new GitHubApiError(
        `Repository "${owner}/${repo}" was not found.`,
        404,
        "REPO_NOT_FOUND"
      );
    }
    throw new GitHubApiError(
      `Failed to fetch repository metadata (status ${res.status}).`,
      res.status,
      "GITHUB_ERROR"
    );
  }

  const r = await res.json();
  const branch = r.default_branch || "main";

  const { readmeAvailable, readme } = await fetchRepositoryReadme(
    owner,
    repo,
    branch,
    r.homepage
  );

  const repository: NormalizedRepository = {
    id: r.id,
    name: r.name,
    fullName: r.full_name,
    description: r.description || null,
    htmlUrl: r.html_url,
    homepage: r.homepage || null,
    language: r.language || null,
    topics: Array.isArray(r.topics) ? r.topics : [],
    stars: r.stargazers_count || 0,
    forks: r.forks_count || 0,
    openIssues: r.open_issues_count || 0,
    isFork: Boolean(r.fork),
    isArchived: Boolean(r.archived),
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    pushedAt: r.pushed_at,
    defaultBranch: branch,
    size: r.size || 0,
    readmeAvailable,
    readmeSummary: readme
      ? {
          overview: readme.overview || undefined,
          features: readme.features.length > 0 ? readme.features : undefined,
          technologies: readme.technologies.length > 0 ? readme.technologies : undefined,
          architecture: readme.architecture || undefined,
          installation: readme.installation || undefined,
          demoUrl: readme.demoUrl || undefined,
          license: readme.license || undefined,
        }
      : undefined,
  };

  return {
    repository,
    readme,
    readmeAvailable,
    updatedAt: new Date().toISOString(),
  };
}
