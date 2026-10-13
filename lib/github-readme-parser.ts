import { ReadmeDetails, ReadmeSection, ReadmeScreenshot } from "./github-types";

interface ParserContext {
  owner: string;
  repo: string;
  defaultBranch: string;
  homepage?: string | null;
}

/**
 * Resolves relative image and asset links against GitHub raw content URL
 */
export function resolveRelativeGithubUrls(
  markdown: string,
  owner: string,
  repo: string,
  branch: string
): string {
  const rawBase = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}`;

  // 1. Markdown images: ![alt](url)
  let resolved = markdown.replace(/!\[(.*?)\]\((.*?)\)/g, (match, alt, url) => {
    const trimmed = url.trim();
    if (
      trimmed.startsWith("http://") ||
      trimmed.startsWith("https://") ||
      trimmed.startsWith("data:")
    ) {
      return match;
    }
    const cleanPath = trimmed.replace(/^\.?\//, "");
    return `![${alt}](${rawBase}/${cleanPath})`;
  });

  // 2. HTML <img> tags
  resolved = resolved.replace(/<img\s+([^>]*?)src=["'](.*?)["']([^>]*?)>/gi, (match, before, src, after) => {
    const trimmed = src.trim();
    if (
      trimmed.startsWith("http://") ||
      trimmed.startsWith("https://") ||
      trimmed.startsWith("data:")
    ) {
      return match;
    }
    const cleanPath = trimmed.replace(/^\.?\//, "");
    return `<img ${before}src="${rawBase}/${cleanPath}"${after}>`;
  });

  // 3. Markdown relative links (like [Docs](./docs/README.md)) to github blob
  const blobBase = `https://github.com/${owner}/${repo}/blob/${branch}`;
  resolved = resolved.replace(/(?<!!)\[(.*?)\]\((.*?)\)/g, (match, text, url) => {
    const trimmed = url.trim();
    if (
      trimmed.startsWith("http://") ||
      trimmed.startsWith("https://") ||
      trimmed.startsWith("#") ||
      trimmed.startsWith("mailto:")
    ) {
      return match;
    }
    const cleanPath = trimmed.replace(/^\.?\//, "");
    return `[${text}](${blobBase}/${cleanPath})`;
  });

  return resolved;
}

/**
 * Strips script tags, iframes, inline event handlers, and javascript: links
 */
export function sanitizeMarkdown(markdown: string): string {
  return markdown
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, "")
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, "")
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, "")
    .replace(/javascript:[^"'\s)]*/gi, "");
}

/**
 * Helper to strip markdown formatting for plain text extracts
 */
function stripMarkdownFormatting(text: string): string {
  return text
    .replace(/!\[.*?\]\(.*?\)/g, "") // remove images
    .replace(/\[(.*?)\]\(.*?\)/g, "$1") // link to plain text
    .replace(/[`*_~#]/g, "") // markdown characters
    .replace(/<[^>]+>/g, "") // html tags
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Extracts bullet points from a markdown text block
 */
function extractBulletPoints(text: string): string[] {
  const lines = text.split("\n");
  const bullets: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    const match = trimmed.match(/^[-*+]\s+(.+)$/) || trimmed.match(/^\d+\.\s+(.+)$/);
    if (match && match[1]) {
      const clean = stripMarkdownFormatting(match[1]);
      if (clean && clean.length > 2 && clean.length < 250) {
        bullets.push(clean);
      }
    }
  }

  return bullets;
}

/**
 * Extracts all screenshots/images from markdown
 */
function extractScreenshots(markdown: string): ReadmeScreenshot[] {
  const screenshots: ReadmeScreenshot[] = [];
  const imgRegex = /!\[(.*?)\]\((https?:\/\/[^\s)]+)\)/g;
  let match;

  while ((match = imgRegex.exec(markdown)) !== null) {
    const alt = match[1]?.trim() || "Project preview";
    const url = match[2]?.trim();
    // Ignore shield badges and small icons
    if (
      url &&
      !url.includes("img.shields.io") &&
      !url.includes("badge") &&
      !url.includes("travis-ci") &&
      !url.includes("circleci")
    ) {
      screenshots.push({ alt, url });
    }
  }

  return screenshots;
}

/**
 * Parses README markdown into structured fields and sections
 */
export function parseReadmeContent(
  rawMarkdown: string,
  context: ParserContext
): ReadmeDetails {
  const sanitized = sanitizeMarkdown(rawMarkdown);
  const resolved = resolveRelativeGithubUrls(
    sanitized,
    context.owner,
    context.repo,
    context.defaultBranch
  );

  const lines = resolved.split("\n");
  const sections: ReadmeSection[] = [];
  let currentTitle = "Introduction";
  let currentBuffer: string[] = [];

  for (const line of lines) {
    const headingMatch = line.match(/^(#{1,3})\s+(.+)$/);
    if (headingMatch) {
      if (currentBuffer.length > 0) {
        sections.push({
          title: currentTitle,
          content: currentBuffer.join("\n").trim(),
        });
        currentBuffer = [];
      }
      currentTitle = headingMatch[2].replace(/[#*_`]/g, "").trim();
    } else {
      currentBuffer.push(line);
    }
  }

  if (currentBuffer.length > 0) {
    sections.push({
      title: currentTitle,
      content: currentBuffer.join("\n").trim(),
    });
  }

  // Categorize sections by normalized titles
  let overview: string | null = null;
  const features: string[] = [];
  const technologies: string[] = [];
  let architecture: string | null = null;
  let installation: string | null = null;
  let usage: string | null = null;
  let demoUrl: string | null = context.homepage || null;
  let license: string | null = null;

  for (const section of sections) {
    const lower = section.title.toLowerCase();

    // 1. Overview / About
    if (
      lower.includes("overview") ||
      lower.includes("about") ||
      lower.includes("introduction") ||
      lower.includes("description") ||
      lower === "summary" ||
      (section.title === "Introduction" && !overview)
    ) {
      const plain = stripMarkdownFormatting(section.content);
      // Skip lines that are just shield badges or single title
      const validParagraphs = plain
        .split("\n\n")
        .filter((p) => p.length > 20 && !p.startsWith("! ["));
      if (validParagraphs.length > 0 && !overview) {
        overview = validParagraphs.slice(0, 2).join(" ");
      }
    }

    // 2. Features
    if (
      lower.includes("feature") ||
      lower.includes("capability") ||
      lower.includes("highlights") ||
      lower.includes("what it does")
    ) {
      const extracted = extractBulletPoints(section.content);
      if (extracted.length > 0) {
        features.push(...extracted);
      } else {
        const plain = stripMarkdownFormatting(section.content);
        if (plain && plain.length > 20) {
          features.push(plain.slice(0, 200));
        }
      }
    }

    // 3. Tech Stack / Technologies
    if (
      lower.includes("tech") ||
      lower.includes("stack") ||
      lower.includes("built with") ||
      lower.includes("dependencies") ||
      lower.includes("tools used")
    ) {
      const extracted = extractBulletPoints(section.content);
      if (extracted.length > 0) {
        technologies.push(...extracted);
      } else {
        // Look for comma separated or badge-like tags
        const plain = stripMarkdownFormatting(section.content);
        plain
          .split(/[,•|]/)
          .map((t) => t.trim())
          .filter((t) => t.length > 1 && t.length < 30)
          .forEach((t) => technologies.push(t));
      }
    }

    // 4. Architecture / Workflow
    if (
      lower.includes("architecture") ||
      lower.includes("workflow") ||
      lower.includes("how it works") ||
      lower.includes("system design")
    ) {
      architecture = stripMarkdownFormatting(section.content);
    }

    // 5. Installation / Setup
    if (
      lower.includes("install") ||
      lower.includes("getting started") ||
      lower.includes("setup") ||
      lower.includes("prerequisites") ||
      lower.includes("run locally")
    ) {
      installation = section.content;
    }

    // 6. Usage
    if (lower.includes("usage") || lower.includes("how to use") || lower.includes("quick start")) {
      usage = section.content;
    }

    // 7. Live Demo / Deployment Link
    if (
      lower.includes("demo") ||
      lower.includes("deployment") ||
      lower.includes("live") ||
      lower.includes("website")
    ) {
      const urlMatch = section.content.match(/https?:\/\/[^\s)\]"']+/);
      if (urlMatch && !demoUrl) {
        demoUrl = urlMatch[0];
      }
    }

    // 8. License
    if (lower.includes("license")) {
      license = stripMarkdownFormatting(section.content);
    }
  }

  // Fallback for overview if not identified by heading
  if (!overview && sections.length > 0) {
    const firstSectionContent = stripMarkdownFormatting(sections[0].content);
    if (firstSectionContent && firstSectionContent.length > 20) {
      overview = firstSectionContent.slice(0, 300);
    }
  }

  // Also check for any standalone live demo URL in the entire text if still missing
  if (!demoUrl) {
    const liveMatch = resolved.match(/(?:Live Demo|Live App|Website|Demo):\s*(https?:\/\/[^\s)\]"']+)/i);
    if (liveMatch && liveMatch[1]) {
      demoUrl = liveMatch[1];
    }
  }

  const screenshots = extractScreenshots(resolved);

  return {
    repoName: context.repo,
    rawMarkdown: resolved,
    overview: overview ? overview.slice(0, 400) : null,
    features: Array.from(new Set(features)).slice(0, 8),
    technologies: Array.from(new Set(technologies)).slice(0, 12),
    architecture: architecture ? architecture.slice(0, 500) : null,
    installation: installation ? installation.slice(0, 800) : null,
    usage: usage ? usage.slice(0, 800) : null,
    screenshots: screenshots.slice(0, 6),
    demoUrl,
    license: license ? license.slice(0, 100) : null,
    sections,
  };
}
