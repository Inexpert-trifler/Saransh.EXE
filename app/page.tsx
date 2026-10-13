import { IntroLoader } from "@/components/layout/intro-loader";
import { Navbar } from "@/components/layout/navbar";
import { MinimalistHero } from "@/components/ui/minimalist-hero";
import { ProjectsSection } from "@/components/sections/projects-section";
import { AboutSection } from "@/components/sections/about-section";
import { SkillsSection } from "@/components/sections/skills-section";
import { ActivitySection } from "@/components/sections/activity-section";
import { JourneySection } from "@/components/sections/journey-section";
import { AchievementsSection } from "@/components/sections/achievements-section";
import { TestimonialsSection } from "@/components/sections/testimonials-section";
import { ContactSection } from "@/components/sections/contact-section";
import { Footer } from "@/components/layout/footer";

export default function Home() {
  return (
    <>
      {/* Intro Boot Experience */}
      <IntroLoader />

      {/* Main Top Navbar */}
      <Navbar />

      {/* Main Sections */}
      <main className="flex-1">
        {/* Hero Section */}
        <MinimalistHero />

        {/* About Section (01 · Origin & Mental Models) */}
        <AboutSection />

        {/* Selected Projects (02 · Architecture & Shipped Systems) */}
        <ProjectsSection />

        {/* Skills & Ecosystem */}
        <SkillsSection />

        {/* Activity Heatmap */}
        <ActivitySection />

        {/* Journey & Timeline */}
        <JourneySection />

        {/* Achievements & Proof of Work */}
        <AchievementsSection />

        {/* Optional Testimonials */}
        <TestimonialsSection />

        {/* Contact & Transmission */}
        <ContactSection />
      </main>

      {/* Footer */}
      <Footer />
    </>
  );
}
