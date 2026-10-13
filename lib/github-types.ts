export interface NormalizedRepository {
  id: number;
  name: string;
  fullName: string;
  description: string | null;
  htmlUrl: string;
  homepage: string | null;
  language: string | null;
  topics: string[];
  stars: number;
  forks: number;
  openIssues: number;
  isFork: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  pushedAt: string;
  defaultBranch: string;
  size: number;
  readmeAvailable: boolean;
  readmeSummary?: {
    overview?: string;
    features?: string[];
    technologies?: string[];
    architecture?: string;
    installation?: string;
    demoUrl?: string;
    license?: string;
  };
}

export interface ReadmeSection {
  title: string;
  content: string;
}

export interface ReadmeScreenshot {
  alt: string;
  url: string;
}

export interface ReadmeDetails {
  repoName: string;
  rawMarkdown: string;
  overview: string | null;
  features: string[];
  technologies: string[];
  architecture: string | null;
  installation: string | null;
  usage: string | null;
  screenshots: ReadmeScreenshot[];
  demoUrl: string | null;
  license: string | null;
  sections: ReadmeSection[];
}

export interface RepositoriesApiResponse {
  username: string;
  totalRepositories: number;
  totalStars: number;
  totalForks: number;
  languages: { language: string; count: number }[];
  repositories: NormalizedRepository[];
  updatedAt: string;
  source: "live" | "cached";
}

export interface RepositoryDetailApiResponse {
  repository: NormalizedRepository;
  readme: ReadmeDetails | null;
  readmeAvailable: boolean;
  updatedAt: string;
}
