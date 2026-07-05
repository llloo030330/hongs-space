"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import type { Project } from "@/data/projects";

type ProjectModalProps = {
  project: Project | null;
  onClose: () => void;
};

function isExternalLink(href: string) {
  return href.startsWith("http://") || href.startsWith("https://");
}

function DetailBlock({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.24em] text-black/38">
        {label}
      </p>
      <div className="text-sm leading-7 text-black/62">{children}</div>
    </div>
  );
}

export function ProjectModal({ project, onClose }: ProjectModalProps) {
  useEffect(() => {
    if (!project) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [project, onClose]);

  return (
    <AnimatePresence>
      {project ? (
        <motion.div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-[#f5f5f2]/62 px-4 py-8 backdrop-blur-xl sm:px-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          onClick={onClose}
        >
          <motion.article
            role="dialog"
            aria-modal="true"
            aria-labelledby="project-modal-title"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.98 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            onClick={(event) => event.stopPropagation()}
            className="relative max-h-[86vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-black/[0.08] bg-white/66 p-6 shadow-[0_18px_70px_rgba(35,35,30,0.1)] backdrop-blur-2xl sm:p-9"
          >
            <button
              type="button"
              aria-label="Close project details"
              onClick={onClose}
              className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white/36 text-xl leading-none text-black/45 transition duration-300 hover:bg-white/62 hover:text-black/70 focus:outline-none focus:ring-2 focus:ring-black/15"
            >
              X
            </button>

            <div className="pr-12">
              <p className="mb-5 text-[11px] font-medium uppercase tracking-[0.26em] text-black/38">
                Case Note
              </p>
              <h3
                id="project-modal-title"
                className="text-3xl font-semibold tracking-[0.01em] text-black/82 sm:text-5xl"
              >
                {project.title}
              </h3>
              <p className="mt-7 max-w-2xl text-base leading-8 text-black/55 sm:text-lg sm:leading-9">
                {project.description}
              </p>
            </div>

            <div className="mt-10 grid gap-7 sm:grid-cols-2">
              <DetailBlock label="Context">{project.context}</DetailBlock>
              <DetailBlock label="Role">{project.role}</DetailBlock>
              <DetailBlock label="Status">{project.status}</DetailBlock>
              <DetailBlock label="Problem">{project.problem}</DetailBlock>
              <DetailBlock label="Solution">{project.solution}</DetailBlock>
              <DetailBlock label="Tech">{project.techStack.join(", ")}</DetailBlock>
              {project.links.length > 0 ? (
                <DetailBlock label="Links">
                  <div className="space-y-2">
                    {project.links.map((link) => (
                      <p key={link.label}>
                        <span className="text-black/42">{link.label}: </span>
                        <a
                          href={link.href}
                          target={
                            isExternalLink(link.href) ? "_blank" : undefined
                          }
                          rel={isExternalLink(link.href) ? "noreferrer" : undefined}
                          className="underline decoration-black/14 underline-offset-4 transition duration-300 hover:text-black/78 hover:decoration-black/30"
                        >
                          {link.value}
                        </a>
                      </p>
                    ))}
                  </div>
                </DetailBlock>
              ) : null}
            </div>

            <div className="mt-9 rounded-2xl border border-black/[0.07] bg-white/30 p-6">
              <DetailBlock label="System Flow">
                <ol className="flex flex-wrap items-center gap-x-2 gap-y-2">
                  {project.systemFlow.map((step, index) => (
                    <li
                      key={step}
                      className="flex items-center gap-2 text-[12px] leading-6 text-black/56"
                    >
                      <span>{step}</span>
                      {index < project.systemFlow.length - 1 ? (
                        <span className="text-black/22" aria-hidden="true">
                          {"->"}
                        </span>
                      ) : null}
                    </li>
                  ))}
                </ol>
              </DetailBlock>
            </div>

            <div className="mt-4 rounded-2xl border border-black/[0.07] bg-white/30 p-6">
              <DetailBlock label="Key Systems">
                <ul className="flex flex-wrap gap-2">
                  {project.keySystems.map((system) => (
                    <li
                      key={system}
                      className="rounded-full border border-black/[0.06] bg-white/[0.16] px-3 py-1.5 text-[10px] font-medium tracking-[0.13em] text-black/48"
                    >
                      {system}
                    </li>
                  ))}
                </ul>
              </DetailBlock>
            </div>

            <div className="mt-4 rounded-2xl border border-black/[0.07] bg-white/30 p-6">
              <DetailBlock label="Core Features">
                <ul className="grid gap-x-7 gap-y-3 sm:grid-cols-2">
                  {project.coreFeatures.map((feature) => (
                    <li
                      key={feature}
                      className="border-t border-black/[0.06] pt-3"
                    >
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </DetailBlock>
            </div>
          </motion.article>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
