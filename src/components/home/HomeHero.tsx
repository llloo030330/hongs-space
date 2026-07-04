"use client";

import { motion } from "framer-motion";
import { useCallback, useState } from "react";
import HeroVisual from "@/components/hero/HeroVisual";
import { ProjectCard } from "@/components/home/ProjectCard";
import { ProjectModal } from "@/components/home/ProjectModal";
import { GallerySection } from "@/components/sections/GallerySection";
import { projects, type Project } from "@/data/projects";

const navItems = [
  { label: "Home", href: "#hero" },
  { label: "About", href: "#about" },
  { label: "Projects", href: "#projects" },
  { label: "Gallery", href: "#gallery" },
  { label: "Contact", href: "#contact" },
];

function SiteNav() {
  return (
    <header className="fixed left-0 right-0 top-4 z-50 px-4 sm:top-6">
      <nav className="mx-auto flex max-w-4xl items-center justify-center rounded-full border border-black/[0.055] bg-white/[0.34] px-2.5 py-1.5 shadow-[0_16px_54px_rgba(50,50,44,0.055)] backdrop-blur-2xl">
        <div className="flex w-full items-center justify-between gap-2 overflow-x-auto sm:w-auto sm:justify-center sm:gap-3">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="min-h-10 shrink-0 rounded-full px-3.5 py-2 text-[11px] font-medium tracking-[0.16em] text-black/48 transition duration-300 hover:bg-white/45 hover:text-black/72 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/16"
            >
              {item.label}
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
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      className={`scroll-mt-28 px-6 py-28 sm:px-10 sm:py-32 lg:px-16 ${className}`}
    >
      {children}
    </motion.section>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-3xl font-medium tracking-[0.01em] text-black/78 sm:text-5xl">
      {children}
    </h2>
  );
}

function SectionRule() {
  return <div className="h-px w-full bg-black/[0.07]" />;
}

export function HomeHero() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const closeProject = useCallback(() => {
    setSelectedProject(null);
  }, []);

  return (
    <main className="relative min-h-screen bg-[#f5f5f2] text-[#151515]">
      <SiteNav />

      <div id="hero" aria-hidden="true" className="absolute top-0" />
      <HeroVisual />

      <MotionSection id="about">
        <div className="mx-auto max-w-5xl">
          <SectionRule />
          <div className="grid gap-10 py-14 md:grid-cols-[0.8fr_1.2fr] md:items-start">
            <SectionTitle>About</SectionTitle>
            <div className="max-w-2xl space-y-6">
              <p className="text-xl leading-9 tracking-[-0.01em] text-black/62 sm:text-2xl sm:leading-10">
                I build small product experiments, interactive websites, and
                personal tools.
              </p>
              <p className="max-w-xl text-base leading-8 text-black/48">
                This space is where I collect the things I make, test, and keep
                thinking about, from practical systems to visual experiments and
                photography.
              </p>
              <p className="max-w-xl text-base leading-8 text-black/48">
                I care about finishing ideas, not just starting them. Most of
                the work here comes from trying to turn a vague thought into
                something that actually runs.
              </p>
            </div>
          </div>
          <SectionRule />
        </div>
      </MotionSection>

      <MotionSection id="projects" className="pt-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 max-w-2xl">
            <SectionTitle>Selected Work</SectionTitle>
            <p className="mt-6 text-base leading-8 text-black/48">
              A small archive of practical systems and experiments. Fewer
              entries, more signal.
            </p>
          </div>

          <div className="grid gap-5">
            {projects.map((project) => (
              <ProjectCard
                key={project.title}
                project={project}
                onOpen={setSelectedProject}
              />
            ))}
          </div>
        </div>
      </MotionSection>

      <GallerySection />

      <MotionSection id="contact" className="pb-36 pt-20">
        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <SectionTitle>Contact</SectionTitle>
          <p className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-black/50 sm:text-xl sm:leading-9">
            For projects, collaboration, or a simple conversation, you can reach
            me here.
          </p>

          <div className="mx-auto mt-11 max-w-2xl border-y border-black/[0.065] text-left">
            <div className="grid gap-2 border-b border-black/[0.055] py-5 sm:grid-cols-[0.32fr_1fr] sm:items-center">
              <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-black/34">
                Email
              </p>
              <a
                href="mailto:loahozhuge@gmail.com"
                className="pointer-events-auto break-all text-sm tracking-[0.02em] text-black/58 underline decoration-black/14 underline-offset-4 transition duration-300 hover:text-black/74 hover:decoration-black/28 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/15"
              >
                loahozhuge@gmail.com
              </a>
            </div>

            <div className="grid gap-2 border-b border-black/[0.055] py-5 sm:grid-cols-[0.32fr_1fr] sm:items-center">
              <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-black/34">
                WhatsApp
              </p>
              <a
                href="https://wa.me/8615812160330"
                target="_blank"
                rel="noreferrer"
                className="pointer-events-auto break-all text-sm tracking-[0.02em] text-black/50 underline decoration-black/12 underline-offset-4 transition duration-300 hover:text-black/68 hover:decoration-black/26 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/15"
              >
                +86 15812160330
              </a>
            </div>

            <div className="grid gap-2 py-5 sm:grid-cols-[0.32fr_1fr] sm:items-center">
              <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-black/34">
                WeChat
              </p>
              <p className="break-all text-sm tracking-[0.02em] text-black/50">
                zgly811
              </p>
            </div>
          </div>
        </div>
      </MotionSection>

      <footer className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 px-6 pb-10 text-center text-[11px] tracking-[0.16em] text-black/30 sm:px-10">
        <span>Hong</span>
        <a
          href="https://github.com/llloo030330"
          target="_blank"
          rel="noreferrer"
          className="transition duration-300 hover:text-black/52 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/15"
        >
          GitHub
        </a>
      </footer>

      <ProjectModal project={selectedProject} onClose={closeProject} />
    </main>
  );
}
