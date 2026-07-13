"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import HeroVisual from "@/components/hero/HeroVisual";
import { ProjectCard } from "@/components/home/ProjectCard";
import { GallerySection } from "@/components/sections/GallerySection";
import type { PhotoSeries } from "@/components/sections/photoData";
import { projects } from "@/data/projects";

const navItems = [
  { label: "Home", href: "#hero" },
  { label: "About", href: "#about" },
  { label: "Projects", mobileLabel: "Work", href: "#projects" },
  { label: "Gallery", href: "#gallery" },
  { label: "Contact", href: "#contact" },
];

const sectionIds = navItems.map((item) => item.href.slice(1));

function SiteNav({
  activeSection,
  hasScrolled,
}: {
  activeSection: string;
  hasScrolled: boolean;
}) {
  return (
    <header className="fixed left-0 right-0 top-3 z-50 px-0 sm:top-6 sm:px-4">
      <nav
        aria-label="Primary navigation"
        className={`mx-auto flex w-[calc(100vw-20px)] max-w-[46rem] items-center justify-center rounded-full border px-1.5 py-1.5 backdrop-blur-xl transition duration-500 sm:w-auto sm:px-2 ${
          hasScrolled
            ? "border-black/[0.075] bg-[#f7f7f3]/72"
            : "border-black/[0.04] bg-white/[0.16]"
        }`}
      >
        <div className="flex w-full min-w-0 items-center justify-between gap-0 sm:w-auto sm:justify-center sm:gap-2">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              aria-label={item.label}
              aria-current={activeSection === item.href.slice(1) ? "page" : undefined}
              className={`relative inline-flex min-h-11 min-w-0 flex-1 items-center justify-center rounded-full px-0.5 py-2 text-[9px] font-medium tracking-[0.01em] transition duration-300 after:absolute after:bottom-1.5 after:left-1/2 after:h-px after:w-3 after:-translate-x-1/2 after:bg-current after:transition-opacity min-[390px]:px-2 min-[390px]:tracking-[0.045em] sm:min-w-fit sm:flex-none sm:px-3.5 sm:text-[11px] sm:tracking-[0.15em] ${
                activeSection === item.href.slice(1)
                  ? "text-black/74 after:opacity-35"
                  : "text-black/44 after:opacity-0 hover:text-black/68"
              } focus:outline-none focus-visible:ring-2 focus-visible:ring-black/16`}
            >
              <span className="sm:hidden">{item.mobileLabel ?? item.label}</span>
              <span className="hidden sm:inline">{item.label}</span>
            </a>
          ))}
        </div>
      </nav>
    </header>
  );
}

function MotionSection({
  id,
  children,
  className = "",
}: {
  id: string;
  children: React.ReactNode;
  className?: string;
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.section
      id={id}
      initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{
        duration: shouldReduceMotion ? 0.01 : 0.62,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={`scroll-mt-28 px-6 sm:px-10 lg:px-16 ${className}`}
    >
      {children}
    </motion.section>
  );
}

function SectionTitle({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <h2 className={`text-3xl font-medium tracking-[0.01em] text-black/78 sm:text-5xl ${className}`}>
      {children}
    </h2>
  );
}

function SectionRule() {
  return <div className="h-px w-full bg-black/[0.07]" />;
}

function SectionHeader({
  label,
  title,
  description,
  align = "left",
}: {
  label: string;
  title: string;
  description?: string;
  align?: "left" | "center";
}) {
  return (
    <div className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <p className="mb-5 text-[10px] font-medium uppercase tracking-[0.18em] text-black/32">
        {label}
      </p>
      <SectionTitle>{title}</SectionTitle>
      {description ? (
        <p className="mt-6 max-w-2xl text-sm leading-7 text-black/48 sm:text-base sm:leading-8">
          {description}
        </p>
      ) : null}
    </div>
  );
}

export function HomeHero({
  photoSeries,
  currentYear,
}: {
  photoSeries: PhotoSeries[];
  currentYear: number;
}) {
  const [activeSection, setActiveSection] = useState("hero");
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    let previousScrolledState = window.scrollY > 48;

    const handleScroll = () => {
      const nextScrolledState = window.scrollY > 48;

      if (nextScrolledState === previousScrolledState) return;

      previousScrolledState = nextScrolledState;
      setHasScrolled(nextScrolledState);
    };

    setHasScrolled(previousScrolledState);
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter((section): section is HTMLElement => Boolean(section));

    if (sections.length === 0) return;

    const hashId = window.location.hash.slice(1);
    if (sectionIds.includes(hashId)) {
      setActiveSection(hashId);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (!visibleEntry) return;

        setActiveSection((current) =>
          current === visibleEntry.target.id ? current : visibleEntry.target.id,
        );
      },
      {
        rootMargin: "-28% 0px -58% 0px",
        threshold: [0.08, 0.18, 0.32, 0.5],
      },
    );

    sections.forEach((section) => observer.observe(section));

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <main className="relative min-h-[100svh] overflow-x-clip bg-[#f5f5f2] text-[#151515]">
      <SiteNav activeSection={activeSection} hasScrolled={hasScrolled} />

      <HeroVisual />
      <div className="pointer-events-none relative z-10 h-px bg-gradient-to-r from-transparent via-black/[0.07] to-transparent" />

      <MotionSection id="about" className="bg-[#f4f4f0] py-20 sm:py-28 lg:py-32">
        <div className="mx-auto max-w-5xl">
          <SectionRule />
          <div className="grid gap-8 py-10 sm:gap-10 sm:py-14 md:grid-cols-[0.78fr_1.22fr] md:items-start">
            <SectionHeader label="About / 01" title="About" />
            <div className="max-w-2xl space-y-6">
              <p className="text-lg leading-8 tracking-[-0.01em] text-black/62 sm:text-2xl sm:leading-10">
                I build small product experiments, interactive websites, and
                personal tools.
              </p>
              <p className="max-w-xl text-[15px] leading-8 text-black/48 sm:text-base">
                This space is where I collect the things I make, test,
                photograph, and keep thinking about.
              </p>
              <p className="max-w-xl text-[15px] leading-8 text-black/48 sm:text-base">
                I care about finishing ideas, not just starting them. Most of
                the work here begins as a vague thought and slowly becomes
                something that actually runs.
              </p>
              <div className="mt-9 divide-y divide-black/[0.06] border-y border-black/[0.065]">
                {[
                  ["Based in", "China"],
                  ["Focus", "Product experiments, interaction, photography"],
                  ["Working style", "Independent, curious, hands-on"],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="grid gap-2 py-4 sm:grid-cols-[0.34fr_1fr] sm:items-center"
                  >
                    <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-black/32">
                      {label}
                    </p>
                    <p className="text-sm leading-7 text-black/52">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <SectionRule />
        </div>
      </MotionSection>

      <MotionSection id="projects" className="bg-[#f1f1ed] pb-20 pt-14 sm:pb-28 sm:pt-20 lg:pb-32">
        <div className="mx-auto max-w-6xl">
          <SectionHeader
            label="Selected Work / 02"
            title="Selected Work"
            description="Practical systems and experiments, kept structured enough to show how they work."
          />

          <div className="mt-10 grid gap-4 sm:mt-12 sm:gap-5">
            {projects.map((project) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </div>
        </div>
      </MotionSection>

      <GallerySection photoSeries={photoSeries} />

      <MotionSection id="contact" className="bg-[#f4f4f0] pb-20 pt-16 sm:pb-32 sm:pt-24">
        <div className="relative z-10 mx-auto max-w-4xl">
          <SectionHeader
            label="Contact / 04"
            title="Contact"
            description="For projects, collaboration, or a simple conversation, you can reach me here."
            align="center"
          />

          <div className="mx-auto mt-9 max-w-2xl border-y border-black/[0.065] text-left sm:mt-10">
            <div className="grid gap-2 border-b border-black/[0.055] py-5 sm:grid-cols-[0.32fr_1fr] sm:items-center">
              <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-black/34">
                Email
              </p>
              <a
                href="mailto:loahozhuge@gmail.com"
                className="pointer-events-auto text-sm tracking-[0.02em] text-black/58 underline decoration-black/14 underline-offset-4 transition duration-300 [overflow-wrap:anywhere] hover:text-black/74 hover:decoration-black/28 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/15"
              >
                loahozhuge@gmail.com
              </a>
            </div>

            <div className="grid gap-2 py-5 sm:grid-cols-[0.32fr_1fr] sm:items-center">
              <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-black/34">
                GitHub
              </p>
              <a
                href="https://github.com/llloo030330"
                target="_blank"
                rel="noreferrer"
                className="pointer-events-auto text-sm tracking-[0.02em] text-black/50 underline decoration-black/12 underline-offset-4 transition duration-300 [overflow-wrap:anywhere] hover:text-black/68 hover:decoration-black/26 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/15"
              >
                github.com/llloo030330
              </a>
            </div>
          </div>

          <div className="mt-10 text-center">
            <a
              href="#hero"
              className="inline-flex min-h-11 items-center rounded-full px-4 text-[11px] font-medium uppercase tracking-[0.16em] text-black/36 transition duration-300 hover:text-black/58 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/15"
            >
              Back to top
            </a>
          </div>
        </div>
      </MotionSection>

      <footer className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 bg-[#f4f4f0] px-6 pb-[max(2.5rem,calc(env(safe-area-inset-bottom)+1.5rem))] text-center text-[11px] tracking-[0.14em] text-black/30 sm:px-10">
        <span>Hong</span>
        <span>{currentYear}</span>
        <a
          href="https://github.com/llloo030330"
          target="_blank"
          rel="noreferrer"
          className="transition duration-300 hover:text-black/52 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/15"
        >
          GitHub
        </a>
      </footer>
    </main>
  );
}
