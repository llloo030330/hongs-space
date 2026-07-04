"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import type { Project } from "@/data/projects";

type ProjectCardProps = {
  project: Project;
  onOpen: (project: Project) => void;
};

export function ProjectCard({ project, onOpen }: ProjectCardProps) {
  return (
    <motion.article
      whileHover={{ y: -2 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="group w-full rounded-[22px] border border-black/[0.07] bg-white/[0.18] p-6 text-left backdrop-blur-xl transition duration-500 hover:border-black/[0.13] hover:bg-white/[0.28] sm:p-9"
    >
      <div className="grid gap-11 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12">
        <div className="flex flex-col justify-between gap-10">
          <div>
            <p className="mb-5 text-[10px] font-medium uppercase tracking-[0.26em] text-black/34">
              {project.status}
            </p>
            <h3 className="max-w-lg text-2xl font-medium tracking-[0.01em] text-black/78 sm:text-3xl">
              {project.title}
            </h3>
            <p className="mt-6 max-w-xl text-sm leading-7 text-black/52 sm:text-base sm:leading-8">
              {project.description}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-black/[0.065] bg-white/[0.16] px-3 py-1.5 text-[10px] font-medium tracking-[0.13em] text-black/43"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="lg:pl-2">
          <div className="divide-y divide-black/[0.06] border-y border-black/[0.055]">
            <CaseField label="Role">{project.role}</CaseField>
            <CaseField label="Problem">{project.problem}</CaseField>
            <CaseField label="Solution">{project.solution}</CaseField>
            <CaseField label="Tech">{project.techStack.join(", ")}</CaseField>

            <div className="py-5">
              <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.22em] text-black/34">
                Core Features
              </p>
              <ul className="grid gap-x-7 gap-y-2 sm:grid-cols-2">
                {project.coreFeatures.map((feature) => (
                  <li
                    key={feature}
                    className="border-t border-black/[0.045] pt-2.5 text-[13px] leading-6 text-black/56"
                  >
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <div className="py-5">
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  aria-label={`Open ${project.title} case note`}
                  onClick={() => onOpen(project)}
                  className="min-h-11 rounded-full border border-black/[0.085] px-5 text-[11px] font-medium tracking-[0.16em] text-black/54 transition duration-300 hover:border-black/[0.15] hover:bg-white/38 hover:text-black/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/15"
                >
                  Open Case Note
                </button>
                {project.links.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-11 items-center rounded-full border border-black/[0.065] px-5 text-[11px] font-medium tracking-[0.16em] text-black/46 transition duration-300 hover:border-black/[0.13] hover:bg-white/30 hover:text-black/64 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/15"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
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
  children: ReactNode;
}) {
  return (
    <div className="py-5">
      <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.22em] text-black/34">
        {label}
      </p>
      <p className="max-w-2xl text-sm leading-7 text-black/58">{children}</p>
    </div>
  );
}
