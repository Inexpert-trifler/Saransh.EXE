export interface Project {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  longDescription: string;
  category: "Full Stack" | "AI & Agents" | "Creative Web" | "Systems" | "Mobile";
  techStack: string[];
  status: "Production" | "Beta" | "Active Experiment" | "Shipped";
  featured: boolean;
  year: string;
  role: string;
  highlights: string[];
  links: {
    live?: string | null;
    github?: string | null;
    caseStudy?: string | null;
  };
  metrics?: {
    label: string;
    value: string;
  }[];
  accentColor: string;
}

export interface SkillCategory {
  title: string;
  description: string;
  skills: {
    name: string;
    level: "Core" | "Advanced" | "Exploring";
    icon?: string;
    description: string;
    featured?: boolean;
  }[];
}

import { MilestoneItem, milestonesData } from "./milestones";

export type Milestone = MilestoneItem;

export interface Achievement {
  title: string;
  category: "Hackathon" | "Open Source" | "Building" | "Community";
  date: string;
  summary: string;
  details: string;
  badge?: string;
  link?: string | null;
}

export interface Testimonial {
  id: string;
  author: string;
  role: string;
  company: string;
  avatar: string;
  content: string;
  tag: string;
}

export interface PortfolioData {
  profile: {
    name: string;
    handle: string;
    tagline: string;
    eyebrow: string;
    headline: string;
    headlineAccent: string;
    bioShort: string;
    bioLong: string[];
    location: string;
    timezone: string;
    availability: {
      status: "Available for projects" | "Exploring opportunities" | "Building in stealth";
      indicatorColor: string;
      details: string;
    };
    philosophy: {
      title: string;
      description: string;
    }[];
    currentlyExploring: string[];
    interestTags: string[];
  };
  navigation: {
    label: string;
    href: string;
    badge?: string;
  }[];
  socials: {
    platform: string;
    url: string | null;
    username: string;
    icon: string;
  }[];
  projects: Project[];
  skillCategories: SkillCategory[];
  technologiesMarquee: {
    name: string;
    category: string;
  }[];
  milestones: Milestone[];
  achievements: Achievement[];
  testimonials: {
    enabled: boolean;
    disclaimer: string;
    items: Testimonial[];
  };
  contact: {
    email: string;
    responseTime: string;
    preferredTopics: string[];
    formNotice: string;
  };
  features: {
    enableTestimonials: boolean;
    enableActivityHeatmap: boolean;
    enableTerminalEasterEgg: boolean;
    enableCustomCursor: boolean;
    enableSoundEffects: boolean;
  };
}

export const portfolioData: PortfolioData = {
  profile: {
    name: "Saransh Yadav",
    handle: "SARANSH.EXE",
    tagline: "Creative Developer & Product Architect",
    eyebrow: "INDEPENDENT DEVELOPER / PRODUCT BUILDER",
    headline: "I BUILD THINGS THAT",
    headlineAccent: "SHOULDN'T EXIST YET.",
    bioShort: "Developer, experimenter, and product builder exploring the intersection of modern web architectures, autonomous AI agents, and products that create memorable digital experiences.",
    bioLong: [
      "I'm a CS student obsessed with turning late-night ideas into real products. AI, code, motion, and interfaces that hit different — that's my playground.",
      "I build across the stack, experiment aggressively, and debug until the thing actually works."
    ],
    location: "Bengaluru, India (UTC+5:30)",
    timezone: "IST",
    availability: {
      status: "Available for projects",
      indicatorColor: "#B9FF66",
      details: "Hackathons, ambitious side projects, AI experiments, and people who actually build."
    },
    philosophy: [
      {
        title: "Speed is a feature.",
        description: "Prototype fast. Iterate faster."
      },
      {
        title: "Pixels have personality.",
        description: "No soulless templates. Make every interaction count."
      },
      {
        title: "Ship > overthink.",
        description: "Build it, test it, learn, repeat."
      },
      {
        title: "AI is the co-pilot. I'm still driving.",
        description: "Use the tools. Understand the code. Own the result."
      }
    ],
    currentlyExploring: [
      "AI agents",
      "Full-stack builds",
      "Motion & UI",
      "Startup ideas"
    ],
    interestTags: [
      "VibeCoding",
      "AIAgents",
      "CreativeDev",
      "Hackathons",
      "ProductBuilding",
      "MotionDesign",
      "FullStack"
    ]
  },
  navigation: [
    { label: "About", href: "#about" },
    { label: "Work", href: "#work" },
    { label: "Stack", href: "#stack" },
    { label: "Activity", href: "#activity" },
    { label: "Journey", href: "#journey" },
    { label: "Contact", href: "#contact" }
  ],
  socials: [
    {
      platform: "GitHub",
      url: "https://github.com/Inexpert-trifler",
      username: "@Inexpert-trifler",
      icon: "github"
    },
    {
      platform: "LinkedIn",
      url: "https://linkedin.com",
      username: "saransh-yadav",
      icon: "linkedin"
    },
    {
      platform: "Twitter / X",
      url: "https://twitter.com",
      username: "@saranshyadav",
      icon: "twitter"
    },
    {
      platform: "Email",
      url: "mailto:saransh@example.com",
      username: "saransh@example.com",
      icon: "mail"
    }
  ],
  projects: [],
  skillCategories: [
    {
      title: "Languages",
      description: "Core languages used for building robust systems and interfaces.",
      skills: [
        { name: "TypeScript", level: "Core", description: "Strict typing, generics, complex interfaces", featured: true },
        { name: "JavaScript (ESNext)", level: "Core", description: "Modern async patterns, DOM APIs, event loop", featured: true },
        { name: "Python", level: "Advanced", description: "FastAPI, LangChain, agent automation, data scripts", featured: true },
        { name: "C / C++", level: "Advanced", description: "Memory management, algorithms, competitive programming" },
        { name: "Java", level: "Advanced", description: "Object-oriented design, backend microservices" },
        { name: "SQL", level: "Core", description: "Relational query optimization, schemas, migrations" }
      ]
    },
    {
      title: "Frontend Architecture",
      description: "Modern component-driven web interfaces with fluid motion.",
      skills: [
        { name: "Next.js (App Router)", level: "Core", description: "Server components, streaming, edge routes, layouts", featured: true },
        { name: "React 19", level: "Core", description: "Concurrent features, custom hooks, Suspense", featured: true },
        { name: "Tailwind CSS", level: "Core", description: "Design tokens, responsive utility architecture", featured: true },
        { name: "Motion (Framer)", level: "Core", description: "Layout animations, gesture physics, orchestrations", featured: true },
        { name: "GSAP & ScrollTrigger", level: "Advanced", description: "Complex timeline choreography, pinned scroll triggers", featured: true },
        { name: "HTML5 / Semantic A11y", level: "Core", description: "Accessible landmarks, ARIA labels, keyboard focus" }
      ]
    },
    {
      title: "Backend & Systems",
      description: "Scalable server architectures, APIs, and real-time data sync.",
      skills: [
        { name: "Node.js", level: "Core", description: "Event-driven runtime, streams, microservices", featured: true },
        { name: "FastAPI / Express", level: "Core", description: "RESTful endpoints, middleware, authentication", featured: true },
        { name: "PostgreSQL / Prisma", level: "Core", description: "Relational schemas, ACID compliance, indexing", featured: true },
        { name: "MongoDB", level: "Advanced", description: "Document schemas, aggregation pipelines" },
        { name: "Redis", level: "Advanced", description: "Pub/Sub, token rate-limiting, session cache" },
        { name: "WebSockets / WebRTC", level: "Advanced", description: "Bi-directional real-time communication" }
      ]
    },
    {
      title: "AI & Experimentation",
      description: "Building autonomous systems, prompt engineering, and LLM apps.",
      skills: [
        { name: "Agentic Workflows", level: "Core", description: "Multi-agent systems, tool calling, autonomous loops", featured: true },
        { name: "LLM APIs (Claude, Gemini, GPT)", level: "Core", description: "Structured JSON outputs, vision, temperature tuning", featured: true },
        { name: "LangChain / LangGraph", level: "Advanced", description: "Stateful agents, semantic search, vector embeddings" },
        { name: "Vector Databases", level: "Advanced", description: "Pinecone, pgvector, hybrid semantic retrieval" },
        { name: "Creative WebGL / Shaders", level: "Exploring", description: "Three.js, GLSL fragment shaders, canvas drawing" }
      ]
    },
    {
      title: "DevOps & Tools",
      description: "Development environments, version control, and cloud deployment.",
      skills: [
        { name: "Git & GitHub", level: "Core", description: "Branching strategies, CI actions, code review", featured: true },
        { name: "Docker", level: "Advanced", description: "Multi-stage containerization, docker-compose", featured: true },
        { name: "Vercel / Cloudflare", level: "Core", description: "Edge deployments, DNS, serverless functions", featured: true },
        { name: "Linux / Zsh", level: "Core", description: "Command line proficiency, scripting, system monitoring" },
        { name: "Figma", level: "Advanced", description: "Design systems, auto-layout, prototype wireframes" }
      ]
    }
  ],
  technologiesMarquee: [
    { name: "TypeScript", category: "Language" },
    { name: "Next.js", category: "Framework" },
    { name: "React 19", category: "Frontend" },
    { name: "Tailwind CSS", category: "Styling" },
    { name: "Node.js", category: "Backend" },
    { name: "Python", category: "Language" },
    { name: "PostgreSQL", category: "Database" },
    { name: "Prisma", category: "ORM" },
    { name: "GSAP", category: "Motion" },
    { name: "Motion / React", category: "Motion" },
    { name: "Docker", category: "DevOps" },
    { name: "Redis", category: "Cache" },
    { name: "FastAPI", category: "Backend" },
    { name: "Supabase", category: "Database" },
    { name: "Claude API", category: "AI" },
    { name: "Gemini API", category: "AI" }
  ],
  milestones: milestonesData,
  achievements: [
    {
      title: "48-Hour Hackathon Finalist",
      category: "Hackathon",
      date: "2025",
      summary: "Built and deployed an AI-assisted compliance engine from scratch under intense time pressure.",
      details: "Delivered live demo with working graph visualizations and zero server failures during final jury evaluation.",
      badge: "Finalist Sprint"
    },
    {
      title: "15+ Full-Stack Web Projects Shipped",
      category: "Building",
      date: "2024 – 2026",
      summary: "Authored production web applications ranging from gym management platforms to agent eval environments.",
      details: "Consistent focus on end-to-end craftsmanship: DB schema design, secure auth, fluid micro-interactions, responsive CSS.",
      badge: "Active Builder"
    },
    {
      title: "Open Source Contributor & Explorer",
      category: "Open Source",
      date: "2025",
      summary: "Contributed component fixes, accessible keyboard navigation patches, and docs to community tooling.",
      details: "Advocate for clean code standards, type safety, and honest software communication.",
      badge: "Open Source"
    },
    {
      title: "Continuous Algorithm Practice",
      category: "Community",
      date: "2023 – Present",
      summary: "Solved 300+ computational problem sets across graph theory, dynamic programming, and data structures.",
      details: "Strong foundational grasp of space/time complexities, caching invariants, and system limits.",
      badge: "Problem Solving"
    }
  ],
  testimonials: {
    enabled: false,
    disclaimer: "No third-party endorsements listed. Direct work artifacts and GitHub code history provide proof of work.",
    items: []
  },
  contact: {
    email: "saransh@example.com",
    responseTime: "Usually within 24 hours",
    preferredTopics: [
      "Freelance full-stack builds",
      "AI agent prototypes & workflows",
      "Creative developer collaborations",
      "Hackathons & startup advisory"
    ],
    formNotice: "DEMO MODE ACTIVE: This form conducts honest client-side validation and simulates delivery feedback. Set up an API route or Resend/Formspree endpoint when ready."
  },
  features: {
    enableTestimonials: true,
    enableActivityHeatmap: true,
    enableTerminalEasterEgg: true,
    enableCustomCursor: true,
    enableSoundEffects: false
  }
};
