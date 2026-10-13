import type { Metadata, Viewport } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { CustomCursor } from "@/components/effects/custom-cursor";
import { GrainOverlay } from "@/components/effects/grain-overlay";
import { ScrollProgress } from "@/components/effects/scroll-progress";
import { TerminalEasterEgg } from "@/components/effects/terminal-easter-egg";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SARANSH.EXE — Creative Developer & Product Architect",
  description: "An experimental digital playground & developer portfolio by Saransh Yadav. Specializing in high-performance web applications, autonomous AI agents, and tactile digital brutalism.",
  keywords: ["Saransh Yadav", "Creative Developer", "Next.js", "AI Agents", "Full Stack Engineer", "Digital Brutalism", "Frontend Motion", "Portfolio"],
  authors: [{ name: "Saransh Yadav" }],
  creator: "Saransh Yadav",
  openGraph: {
    title: "SARANSH.EXE — Creative Developer & Product Architect",
    description: "I build things that shouldn't exist yet. Full-stack development, agentic AI systems, and interactive creative web experiments.",
    type: "website",
    locale: "en_US",
    siteName: "SARANSH.EXE",
  },
  twitter: {
    card: "summary_large_image",
    title: "SARANSH.EXE — Creative Developer",
    description: "Creative developer portfolio exploring code, AI agents, and products worth shipping.",
    creator: "@saranshyadav",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#080808",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} dark antialiased`}
    >
      <body className="min-h-screen bg-[#080808] text-[#F5F5F5] selection:bg-[#B9FF66] selection:text-[#080808] relative font-sans overflow-x-hidden">
        {/* Subtle background grain & grid overlay */}
        <GrainOverlay />
        <ScrollProgress />
        <CustomCursor />
        <TerminalEasterEgg />
        
        <div className="relative z-10 flex min-h-screen flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
