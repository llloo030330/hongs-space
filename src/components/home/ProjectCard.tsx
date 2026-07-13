"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import type { Project } from "@/data/projects";

type ProjectCardProps = {
  project: Project;
};

function isExternalLink(href: string) {
  return href.startsWith("http://") || href.startsWith("https://");
}

function ProjectLinkButton({ href, label }: { href: string; label: string }) {
  const className =
    "inline-flex min-h-11 w-full items-center justify-center rounded-full border border-black/[0.075] px-4 text-center text-[10px] font-medium tracking-[0.13em] text-black/50 transition duration-300 hover:border-black/[0.14] hover:bg-white/32 hover:text-black/68 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/15 sm:w-fit sm:px-5 sm:text-[11px] sm:tracking-[0.16em]";

  if (href.startsWith("/")) {
    return (
      <Link href={href} className={className}>
        {label}
      </Link>
    );
  }

  return (
    <a
      href={href}
      target={isExternalLink(href) ? "_blank" : undefined}
      rel={isExternalLink(href) ? "noreferrer" : undefined}
      className={className}
    >
      {label}
    </a>
  );
}

export function ProjectCard({ project }: ProjectCardProps) {
  if (project.variant === "experiment") {
    return <ExperimentProjectCard project={project} />;
  }

  return (
    <motion.article
      whileHover={{ y: -2 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="group w-full rounded-[20px] border border-black/[0.07] bg-white/[0.18] p-5 text-left backdrop-blur-xl transition duration-500 hover:border-black/[0.13] hover:bg-white/[0.28] sm:rounded-[22px] sm:p-9"
    >
      <div className="grid gap-7 lg:grid-cols-[0.92fr_1.08fr] lg:gap-12">
        <div className="flex flex-col justify-between gap-7 sm:gap-9">
          <div>
            <p className="mb-5 text-[10px] font-medium uppercase tracking-[0.26em] text-black/34">
              {project.status}
            </p>
            <h3 className="max-w-lg text-[1.55rem] font-medium leading-tight tracking-[0.01em] text-black/78 sm:text-3xl">
              {project.title}
            </h3>
            <p className="mt-5 max-w-xl text-sm leading-7 text-black/52 sm:mt-6 sm:text-base sm:leading-8">
              {project.shortDescription}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {project.homepageTags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-black/[0.065] bg-white/[0.16] px-3 py-1.5 text-[9.5px] font-medium tracking-[0.1em] text-black/43 sm:text-[10px] sm:tracking-[0.13em]"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="lg:pl-2">
          <div className="divide-y divide-black/[0.06] border-y border-black/[0.055]">
            <CaseField label="Role">{project.role}</CaseField>
            <CaseField label="System Summary">
              {project.systemSummary}
            </CaseField>
            <div className="py-5">
              <div className="flex flex-wrap gap-3">
                <ProjectLinkButton href={project.href} label="Open Case Study" />
                {project.links.map((link) => (
                  <ProjectLinkButton
                    key={link.href}
                    href={link.href}
                    label={link.label}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

function ExperimentProjectCard({ project }: { project: Project }) {
  const primaryLink = project.links[0];

  return (
    <motion.article
      whileHover={{ y: -1 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="group rounded-[18px] border border-black/[0.055] bg-white/[0.12] p-5 text-left transition duration-500 hover:border-black/[0.11] hover:bg-white/[0.2] sm:p-7"
    >
      <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <p className="mb-4 text-[10px] font-medium uppercase tracking-[0.24em] text-black/32">
            Secondary experiment
          </p>
          <h3 className="text-[1.45rem] font-medium leading-tight tracking-[0.01em] text-black/74 sm:text-2xl">
            {project.title}
          </h3>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-black/50">
            {project.description}
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            {project.homepageTags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-black/[0.055] bg-white/[0.12] px-3 py-1.5 text-[9.5px] font-medium tracking-[0.1em] text-black/38 sm:text-[10px] sm:tracking-[0.13em]"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4 md:items-end">
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-black/30">
            {project.status}
          </p>
          {primaryLink ? (
            <ProjectLinkButton href={primaryLink.href} label={primaryLink.label} />
          ) : null}
        </div>
      </div>
    </motion.article>
  );
}

function CaseField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="py-5">
      <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.22em] text-black/34">
        {label}
      </p>
      <p className="max-w-2xl text-sm leading-7 text-black/58 [overflow-wrap:anywhere]">{children}</p>
    </div>
  );
}
