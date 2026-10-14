import { NormalizedRepository } from "./github-types";
import { ArtPresetName, GlassFolderFile } from "@/components/ui/glass-folder-cards";

export interface FeaturedRepoConfig {
  displayName: "SignalX" | "PromptGym" | "RakshakLogix" | "ResumeOS" | "FinSightAI";
  // Possible repository names on GitHub to match against
  slugCandidates: string[];
  artPreset: ArtPresetName;
  seed: number;
  fallbackDescription: string;
  defaultLanguage: string;
  keyFiles: { name: string; meta: string }[];
}

export const FEATURED_REPOSITORIES_CONFIG: FeaturedRepoConfig[] = [
  {
    displayName: "SignalX",
    slugCandidates: ["SignalX", "SignalX-Hackathon", "signalx", "signalx-hackathon"],
    artPreset: "ember",
    seed: 101,
    fallbackDescription:
      "Autonomous AI startup intelligence platform crawling web sources, extracting market signals, and synthesizing competitor insights.",
    defaultLanguage: "TypeScript",
    keyFiles: [
      { name: "README.md", meta: "Startup Intelligence" },
      { name: "crawler-agent.ts", meta: "TypeScript · Agent" },
      { name: "market-graph.json", meta: "Gemini + Anakin API" },
    ],
  },
  {
    displayName: "PromptGym",
    slugCandidates: ["PromptGym", "Scaler_Hackathon", "promptgym", "scaler_hackathon", "prompt-gym"],
    artPreset: "verdant",
    seed: 202,
    fallbackDescription:
      "Fully OpenEnv-compliant prompt engineering evaluation environment built for the Scaler × Meta × HuggingFace OpenEnv Hackathon 2026.",
    defaultLanguage: "Python",
    keyFiles: [
      { name: "README.md", meta: "OpenEnv Evaluation" },
      { name: "evaluator.py", meta: "Python · Docker Env" },
      { name: "prompt-matrix.yaml", meta: "HuggingFace Space" },
    ],
  },
  {
    displayName: "RakshakLogix",
    slugCandidates: ["RakshakLogix", "rakshaklogix", "rakshak-logix"],
    artPreset: "glacier",
    seed: 303,
    fallbackDescription:
      "Cyber defense logic and situational security architecture protecting critical operational workflows.",
    defaultLanguage: "HTML",
    keyFiles: [
      { name: "README.md", meta: "Defense Framework" },
      { name: "security-rules.json", meta: "Rule Engine" },
      { name: "audit-matrix.ts", meta: "Access Guard" },
    ],
  },
  {
    displayName: "ResumeOS",
    slugCandidates: ["ResumeOS", "resumeos", "resume-os"],
    artPreset: "aurora",
    seed: 404,
    fallbackDescription:
      "Intelligent resume architecture and developer career operating system transforming profile signals into interactive experiences.",
    defaultLanguage: "TypeScript",
    keyFiles: [
      { name: "README.md", meta: "Operating System" },
      { name: "resume-engine.tsx", meta: "TypeScript · React" },
      { name: "schema-parser.ts", meta: "AST Parser" },
    ],
  },
  {
    displayName: "FinSightAI",
    slugCandidates: ["FinSightAI", "finsightai", "fin-sight-ai"],
    artPreset: "dusk",
    seed: 505,
    fallbackDescription:
      "AI-driven financial analysis and audit intelligence platform detecting transactional anomalies and synthesizing risk patterns.",
    defaultLanguage: "JavaScript",
    keyFiles: [
      { name: "README.md", meta: "Financial Audit AI" },
      { name: "anomaly-detector.js", meta: "JavaScript · ML" },
      { name: "risk-ledger.json", meta: "Pattern Engine" },
    ],
  },
];

export interface EnrichedFeaturedFolder {
  displayName: "SignalX" | "PromptGym" | "RakshakLogix" | "ResumeOS" | "FinSightAI";
  realRepo: NormalizedRepository | null;
  artPreset: ArtPresetName;
  seed: number;
  files: GlassFolderFile[];
  matchedSlug: string;
}

/**
 * Matches real GitHub repositories to the 5 featured configs.
 * Guarantees the exact order: SignalX, PromptGym, RakshakLogix, ResumeOS, FinSightAI.
 */
export function matchFeaturedRepositories(
  allRepos: NormalizedRepository[]
): {
  featured: EnrichedFeaturedFolder[];
  featuredRepoIds: Set<number>;
  featuredNames: Set<string>;
} {
  const featuredRepoIds = new Set<number>();
  const featuredNames = new Set<string>();

  const featured = FEATURED_REPOSITORIES_CONFIG.map((config) => {
    // Look for matching repo by candidate slugs (case-insensitive)
    const match = allRepos.find((repo) =>
      config.slugCandidates.some(
        (slug) => repo.name.toLowerCase() === slug.toLowerCase()
      )
    );

    if (match) {
      featuredRepoIds.add(match.id);
      featuredNames.add(match.name.toLowerCase());
    }

    const repoSlug = match ? match.name : config.slugCandidates[0];
    const repoUrl = match?.htmlUrl || `https://github.com/Inexpert-trifler/${repoSlug}`;

    // Build the sheet files
    const files: GlassFolderFile[] = [
      {
        name: config.keyFiles[0]?.name || "README.md",
        meta: config.keyFiles[0]?.meta || "Documentation",
        art: config.artPreset,
        type: "readme",
      },
      {
        name: config.keyFiles[1]?.name || "core-system.ts",
        meta:
          match?.language
            ? `${match.language} · Core`
            : config.keyFiles[1]?.meta || "Core Architecture",
      },
      {
        name: config.keyFiles[2]?.name || "metadata.json",
        meta: match
          ? `★ ${match.stars} · ⑂ ${match.forks}`
          : config.keyFiles[2]?.meta || "Metrics",
      },
      {
        name: "GitHub Repository",
        meta: `Inexpert-trifler/${repoSlug} ↗`,
        href: repoUrl,
        type: "github",
      },
    ];

    return {
      displayName: config.displayName,
      realRepo: match || null,
      artPreset: config.artPreset,
      seed: config.seed,
      files,
      matchedSlug: repoSlug,
    };
  });

  return { featured, featuredRepoIds, featuredNames };
}

/**
 * Filters out the 5 featured repositories from all repos for the Repository Vault.
 */
export function getVaultRepositories(
  allRepos: NormalizedRepository[],
  featuredRepoIds: Set<number>,
  featuredNames: Set<string>
): NormalizedRepository[] {
  return allRepos.filter(
    (repo) =>
      !featuredRepoIds.has(repo.id) &&
      !featuredNames.has(repo.name.toLowerCase())
  );
}

/**
 * Helper to generate file sheets for any vault repository folder
 */
export function generateVaultRepoFiles(
  repo: NormalizedRepository,
  artPreset: ArtPresetName
): GlassFolderFile[] {
  const ext =
    repo.language === "Python"
      ? "py"
      : repo.language === "TypeScript"
      ? "ts"
      : repo.language === "JavaScript"
      ? "js"
      : repo.language === "HTML"
      ? "html"
      : repo.language === "CSS"
      ? "css"
      : "md";

  return [
    {
      name: "README.md",
      meta: repo.readmeAvailable ? "Documentation" : "Overview",
      art: artPreset,
      type: "readme",
    },
    {
      name: `index.${ext}`,
      meta: `${repo.language || "Code"} · Source`,
    },
    {
      name: "repository.json",
      meta: `★ ${repo.stars} · ⑂ ${repo.forks}`,
    },
    {
      name: "GitHub Source",
      meta: `Inexpert-trifler/${repo.name} ↗`,
      href: repo.htmlUrl,
      type: "github",
    },
  ];
}
