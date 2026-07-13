import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectCaseStudy } from "@/components/projects/ProjectCaseStudy";
import { getProjectBySlug } from "@/data/projects";

const project = getProjectBySlug("wechat-ordering-system");

export const metadata: Metadata = {
  title: "WeChat Ordering System - Hong's Space",
  description:
    "A QR-code ordering mini program for small restaurants, built around table sessions, merchant operations, and clear order flow.",
  openGraph: {
    title: "WeChat Ordering System - Hong's Space",
    description:
      "A QR-code ordering mini program for small restaurants, built around table sessions, merchant operations, and clear order flow.",
    type: "article",
    url: "https://hongs-space.vercel.app/projects/wechat-ordering-system",
  },
};

export default function WeChatOrderingSystemPage() {
  if (!project || !project.caseStudy) {
    notFound();
  }

  return <ProjectCaseStudy project={project} />;
}
