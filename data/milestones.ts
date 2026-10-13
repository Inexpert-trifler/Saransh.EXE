export interface MilestoneItem {
  id: string;
  period: string;
  title: string;
  description: string;
  tags: string[];
  achievement?: string;
  status?: string;
  featured?: boolean;
  type: "learning" | "hackathon" | "project" | "community";
}

export const milestonesData: MilestoneItem[] = [
  {
    id: "milestone-1-beginning",
    period: "Q4 2025",
    title: "The Beginning: From Learning to Building",
    description:
      "Started seriously building software projects, applying programming fundamentals to practical applications and learning how frontend, backend, databases, and deployment work together.",
    tags: ["JavaScript", "Java", "C++", "Web Development"],
    type: "learning",
  },
  {
    id: "milestone-2-polaris-vibeathon",
    period: "November 2025",
    title: "Polaris × Replit Vibeathon",
    description:
      "Participated in a rapid product-building hackathon focused on turning an idea into a prototype through collaborative development.",
    achievement: "Top 20",
    featured: true,
    tags: ["Vibe Coding", "Replit", "Hackathon", "Rapid Prototyping"],
    type: "hackathon",
  },
  {
    id: "milestone-3-sih-2025",
    period: "2025",
    title: "SIH 2025: College-Level Selection",
    description:
      "Selected through the college-level internal process for Smart India Hackathon 2025.",
    achievement: "College-Level Selection",
    tags: ["SIH 2025", "Innovation", "Teamwork", "Problem Solving"],
    type: "hackathon",
  },
  {
    id: "milestone-4-ambassador",
    period: "2025–2026",
    title: "Student Ambassador & Community Engagement",
    description:
      "Built experience engaging with student technology communities and developer opportunities through student ambassador programs.",
    tags: ["Student Community", "Technology", "Developer Ecosystem"],
    type: "community",
  },
  {
    id: "milestone-5-sih-2026",
    period: "2026",
    title: "SIH 2026: Returning for Another Cycle",
    description:
      "Earned a second college-level SIH selection in 2026. Worked with Team TheBinaryBrains on a problem-statement-driven solution and progressed to official SIH portal submission.",
    achievement: "Official SIH Portal Submission",
    status: "Two-Time Selection",
    featured: true,
    tags: ["SIH 2026", "TheBinaryBrains", "Teamwork", "Innovation"],
    type: "hackathon",
  },
  {
    id: "milestone-6-fitsura",
    period: "2026",
    title: "Fitsura: Building a Fitness SaaS",
    description:
      "Developing a gym-management platform and companion fitness app with membership management, workout tracking, nutrition, calorie tracking, and trainer workflows.",
    status: "Prototype / Active Development",
    featured: true,
    tags: ["Fitsura", "Fitness Technology", "SaaS", "Product Building"],
    type: "project",
  },
  {
    id: "milestone-7-signalx",
    period: "2026",
    title: "SignalX: Financial Crime Detection",
    description:
      "Developing a platform focused on suspicious transaction patterns, graph-based relationships, risk scoring, and potential money-muling ring detection.",
    status: "Project in Development",
    tags: ["FinTech", "RegTech", "Graph Analytics", "Fraud Detection"],
    type: "project",
  },
  {
    id: "milestone-8-careflow",
    period: "2026",
    title: "CareFlow: Healthcare Workflows",
    description:
      "Working on patient-facing healthcare workflows, including intake, identity verification, document handling, and care-team interfaces.",
    status: "Implementation & Integration",
    tags: ["CareFlow", "HealthTech", "React", "Workflow Design"],
    type: "project",
  },
  {
    id: "milestone-9-promptgym",
    period: "2025–2026",
    title: "PromptGym: AI Evaluation & Developer Tooling",
    description:
      "Explored evaluation workflows and developer tooling through PromptGym, applying experimentation and rapid prototyping to AI-focused development.",
    tags: ["PromptGym", "AI", "Developer Tools", "Experimentation"],
    type: "project",
  },
  {
    id: "milestone-10-fullstack",
    period: "2025–2026",
    title: "Full-Stack Engineering & Product Development",
    description:
      "Expanded hands-on experience across JavaScript, Java, C++, React, Node.js, Express, MongoDB, Python, GitHub, and deployment workflows.",
    status: "Continuous Evolution",
    tags: ["Full Stack", "React", "Node.js", "MongoDB", "Deployment"],
    type: "learning",
  },
];
