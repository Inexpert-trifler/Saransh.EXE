export interface AboutStoryCard {
  id: string;
  index: string;
  eyebrow: string;
  title: string;
  content: string;
  accentColor: string;
  tags?: string[];
  chips?: string[];
  statements?: string[];
  labels?: string[];
  closingLine?: string;
  cta?: {
    label: string;
    href: string;
    actionText: string;
  };
}

export const ABOUT_STORY_CARDS: AboutStoryCard[] = [
  {
    id: "card-01-who-i-am",
    index: "01 / 04",
    eyebrow: "01 / THE PERSON BEHIND THE BUILDS",
    title: "I THINK IN IDEAS. I BUILD IN CODE.",
    content:
      "I'm a computer science student, developer, vibecoder, and hackathon enthusiast. I enjoy turning late-night ideas into working products, experimenting with technology, and figuring out how things work under the hood.",
    accentColor: "rgba(185, 255, 102, 0.85)", // Acid Lime
    tags: [
      "CS STUDENT",
      "VIBECODER",
      "HACKATHON ENTHUSIAST",
      "PRODUCT BUILDER",
    ],
  },
  {
    id: "card-02-what-i-build",
    index: "02 / 04",
    eyebrow: "02 / WHAT I BUILD",
    title: "TURNING CONCEPTS INTO WORKING SOFTWARE.",
    content:
      "I build across the stack—from responsive full-stack applications and SaaS platforms to autonomous AI agents and automated workflows. I like connecting the pieces and turning abstract ideas into reliable software.",
    accentColor: "rgba(56, 189, 248, 0.85)", // Electric Cyan/Sky
    chips: [
      "FULL-STACK WEB APPS",
      "AI AGENTS & APIS",
      "SAAS PRODUCTS",
      "WORKFLOW AUTOMATION",
      "SYSTEM ARCHITECTURE",
      "PRODUCT PROTOTYPES",
    ],
  },
  {
    id: "card-03-what-makes-me-curious",
    index: "03 / 04",
    eyebrow: "03 / WHAT I'M CURIOUS ABOUT",
    title: "CURIOSITY IS MY DEFAULT MODE.",
    content:
      "I like exploring new technology, understanding how systems work under the hood, experimenting with AI, and discovering better ways to build products. Learning is most rewarding when I can test things in code.",
    accentColor: "rgba(168, 85, 247, 0.85)", // Electric Purple
    statements: [
      "Exploring new web frameworks and modern agentic AI workflows.",
      "Understanding how systems, networks, and databases work under load.",
      "Experimenting with tactile UI animations and digital brutalism.",
      "Asking why things work the way they do and testing hypotheses.",
      "Turning what-if curiosities into live, runnable experiments.",
    ],
  },
  {
    id: "card-04-how-i-work",
    index: "04 / 04",
    eyebrow: "04 / HOW I WORK",
    title: "PROTOTYPE FAST. LEARN BY BUILDING. SHIP.",
    content:
      "My process centers on rapid prototyping, learning by building, thorough debugging, and collaborating with hackathon teams. I believe in moving quickly from concept to working code and shipping solutions that genuinely work.",
    accentColor: "rgba(185, 255, 102, 0.95)", // Signature Lime
    labels: [
      "RAPID PROTOTYPING",
      "LEARNING BY BUILDING",
      "DEEP DEBUGGING",
      "TEAM COLLABORATION",
      "HACKATHONS & SHIPPED BUILDS",
    ],
    closingLine: "GOT AN AMBITIOUS IDEA? LET'S BUILD IT TOGETHER.",
    cta: {
      label: "LET'S TALK",
      href: "#contact",
      actionText: "TRANSMIT MESSAGE",
    },
  },
];
