import Link from "next/link";
import type {
  CaseStudyDecision,
  CaseStudyInfoItem,
  CaseStudySystem,
  CaseStudyTestingNote,
  CaseStudyTechnologyGroup,
  Project,
} from "@/data/projects";

function isExternalLink(href: string) {
  return href.startsWith("http://") || href.startsWith("https://");
}

function ExternalOrInternalLink({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className: string;
}) {
  if (href.startsWith("/")) {
    return (
      <Link href={href} className={className}>
        {children}
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
      {children}
    </a>
  );
}

export function ProjectCaseStudy({ project }: { project: Project }) {
  const caseStudy = project.caseStudy;

  if (!caseStudy) {
    return null;
  }

  const repository = project.links.find((link) => link.label === "Repository");

  return (
    <main className="min-h-[100svh] bg-[#f5f5f2] px-4 py-7 text-[#151515] sm:px-8 sm:py-10 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <nav className="mb-12 grid gap-3 text-[10px] font-medium tracking-[0.12em] text-black/42 sm:mb-16 sm:flex sm:flex-wrap sm:items-center sm:justify-between sm:gap-4 sm:text-[11px] sm:tracking-[0.16em]">
          <Link
            href="/#projects"
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-black/[0.075] px-4 py-3 text-center transition duration-300 hover:border-black/[0.14] hover:bg-white/34 hover:text-black/64 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/15"
          >
            Back to Hong&apos;s Space
          </Link>
          {repository ? (
            <a
              href={repository.href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-black/[0.065] px-4 py-3 text-center transition duration-300 hover:border-black/[0.13] hover:bg-white/30 hover:text-black/64 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/15"
            >
              Repository
            </a>
          ) : null}
        </nav>

        <header className="border-y border-black/[0.07] py-11 sm:py-20 lg:py-24">
          <p className="mb-6 text-[10px] font-medium uppercase tracking-[0.2em] text-black/36 sm:mb-7 sm:text-[11px] sm:tracking-[0.26em]">
            {caseStudy.label}
          </p>
          <h1 className="max-w-4xl text-[2.55rem] font-medium leading-[1.06] tracking-[-0.03em] text-black/82 sm:text-6xl lg:text-7xl">
            {project.title}
          </h1>
          <p className="mt-7 max-w-2xl text-[15px] leading-8 text-black/54 sm:mt-8 sm:text-xl sm:leading-9">
            {caseStudy.longDescription}
          </p>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <HeaderMeta label="Status" value={project.status} />
            <HeaderMeta label="Role" value={project.role} />
            <HeaderMeta label="Route" value={project.href} />
          </div>
        </header>

        <CaseSection
          kicker="Overview"
          title="A practical system built around table flow."
        >
          <InfoGrid items={caseStudy.overview} />
        </CaseSection>

        <CaseSection kicker="Why I Built It" title="The menu was not the hard part.">
          <div className="max-w-3xl space-y-5 text-base leading-8 text-black/58 sm:text-lg sm:leading-9">
            {caseStudy.whyBuilt.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </CaseSection>

        <CaseSection kicker="The Problem" title="Three pieces had to stay aligned.">
          <SystemList systems={caseStudy.problemPillars} />
        </CaseSection>

        <CaseSection kicker="System Flow" title="From scan to cleared table.">
          <SystemFlow steps={caseStudy.systemFlow} />
        </CaseSection>

        <CaseSection kicker="Core Systems" title="The parts that make it work.">
          <NumberedSystems systems={caseStudy.coreSystems} />
        </CaseSection>

        <CaseSection
          kicker="Product Decisions"
          title="Decisions that shaped the system."
        >
          <DecisionList decisions={caseStudy.productDecisions} />
        </CaseSection>

        <CaseSection
          kicker="Testing Notes"
          title="Issues found while making the flow complete."
        >
          <TestingNotes notes={caseStudy.testingNotes} />
        </CaseSection>

        <CaseSection kicker="Architecture" title="A small cloud-backed ordering loop.">
          <ArchitectureFlow
            label="Customer and merchant flow"
            nodes={caseStudy.architecture.customerFlow}
          />
          <div className="mt-5">
            <ArchitectureFlow
              label="Administration flow"
              nodes={caseStudy.architecture.adminFlow}
            />
          </div>
        </CaseSection>

        <CaseSection kicker="Interface" title="Screenshots will stay factual.">
          <div className="rounded-[22px] border border-black/[0.065] bg-white/[0.14] p-6 sm:p-8">
            <p className="text-sm leading-7 text-black/56">
              {caseStudy.screenshotNote}
            </p>
            <ul className="mt-5 grid gap-2 text-sm leading-7 text-black/44 sm:grid-cols-2">
              {caseStudy.plannedScreenshots.map((item) => (
                <li key={item} className="border-t border-black/[0.055] pt-3">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </CaseSection>

        <CaseSection kicker="Current Status" title={project.status}>
          <ul className="grid gap-3 text-sm leading-7 text-black/58 sm:grid-cols-2">
            {caseStudy.currentStatus.map((item) => (
              <li key={item} className="border-t border-black/[0.06] pt-3">
                {item}
              </li>
            ))}
          </ul>
        </CaseSection>

        <CaseSection kicker="Technology" title="Native Mini Program and cloud functions.">
          <TechnologyList groups={caseStudy.technology} />
        </CaseSection>

        <footer className="border-t border-black/[0.07] py-10 pb-[max(2.5rem,calc(env(safe-area-inset-bottom)+1.5rem))] sm:py-12">
          <div className="grid gap-4 sm:flex sm:flex-wrap sm:items-center sm:justify-between">
            <Link
              href="/#projects"
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-black/[0.075] px-5 py-3 text-center text-[10px] font-medium tracking-[0.12em] text-black/48 transition duration-300 hover:border-black/[0.14] hover:bg-white/34 hover:text-black/66 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/15 sm:text-[11px] sm:tracking-[0.16em]"
            >
              Back to Projects
            </Link>
            <div className="grid gap-3 sm:flex sm:flex-wrap">
              {repository ? (
                <ExternalOrInternalLink
                  href={repository.href}
                  className="inline-flex min-h-11 items-center justify-center rounded-full border border-black/[0.075] px-5 py-3 text-center text-[10px] font-medium tracking-[0.12em] text-black/48 transition duration-300 hover:border-black/[0.14] hover:bg-white/34 hover:text-black/66 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/15 sm:text-[11px] sm:tracking-[0.16em]"
                >
                  Repository
                </ExternalOrInternalLink>
              ) : null}
              <ExternalOrInternalLink
                href="/experiments/brain-garden"
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-black/[0.055] px-5 py-3 text-center text-[10px] font-medium tracking-[0.12em] text-black/38 transition duration-300 hover:border-black/[0.12] hover:bg-white/24 hover:text-black/58 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/15 sm:text-[11px] sm:tracking-[0.16em]"
              >
                Next Project: Brain Garden
              </ExternalOrInternalLink>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}

function HeaderMeta({ label, value }: CaseStudyInfoItem) {
  return (
    <div className="border-t border-black/[0.065] pt-4">
      <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-black/34">
        {label}
      </p>
      <p className="mt-3 text-sm leading-7 text-black/58">{value}</p>
    </div>
  );
}

function CaseSection({
  kicker,
  title,
  children,
}: {
  kicker: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="grid gap-7 border-b border-black/[0.07] py-11 sm:py-[4.5rem] lg:grid-cols-[0.34fr_1fr] lg:gap-12">
      <div>
        <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-black/34">
          {kicker}
        </p>
        <h2 className="mt-4 max-w-sm text-[1.45rem] font-medium leading-tight tracking-[-0.01em] text-black/76 sm:mt-5 sm:text-3xl">
          {title}
        </h2>
      </div>
      <div>{children}</div>
    </section>
  );
}

function InfoGrid({ items }: { items: CaseStudyInfoItem[] }) {
  return (
    <dl className="grid gap-4 sm:grid-cols-3">
      {items.map((item) => (
        <div
          key={item.label}
          className="border-y border-black/[0.06] py-5 sm:border-b-0"
        >
          <dt className="text-[10px] font-medium uppercase tracking-[0.22em] text-black/34">
            {item.label}
          </dt>
          <dd className="mt-3 text-sm leading-7 text-black/58">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function SystemList({ systems }: { systems: CaseStudySystem[] }) {
  return (
    <ul className="grid gap-5">
      {systems.map((system) => (
        <li key={system.name} className="border-t border-black/[0.06] pt-5">
          <h3 className="text-base font-medium text-black/72">{system.name}</h3>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-black/54">
            {system.description}
          </p>
        </li>
      ))}
    </ul>
  );
}

function SystemFlow({ steps }: { steps: string[] }) {
  return (
    <ol className="relative grid gap-4 before:absolute before:bottom-2 before:left-[7px] before:top-2 before:w-px before:bg-black/[0.08] sm:grid-cols-2 sm:gap-x-6 sm:gap-y-5 sm:before:hidden">
      {steps.map((step, index) => (
        <li
          key={step}
          className="relative flex items-center gap-4 rounded-[18px] border border-black/[0.055] bg-white/[0.12] px-4 py-4 text-sm text-black/58 transition duration-300 hover:border-black/[0.12] hover:bg-white/[0.24]"
        >
          <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full border border-black/[0.12] bg-[#f5f5f2] text-[8px] text-black/40">
            {index + 1}
          </span>
          <span>{step}</span>
        </li>
      ))}
    </ol>
  );
}

function NumberedSystems({ systems }: { systems: CaseStudySystem[] }) {
  return (
    <ol className="divide-y divide-black/[0.06] border-y border-black/[0.06]">
      {systems.map((system, index) => (
        <li key={system.name} className="grid gap-4 py-5 sm:grid-cols-[80px_1fr]">
          <span className="text-[11px] font-medium tracking-[0.18em] text-black/30">
            {String(index + 1).padStart(2, "0")}
          </span>
          <div>
            <h3 className="text-base font-medium text-black/72">
              {system.name}
            </h3>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-black/54">
              {system.description}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}

function DecisionList({ decisions }: { decisions: CaseStudyDecision[] }) {
  return (
    <ol className="grid gap-5">
      {decisions.map((item, index) => (
        <li
          key={item.decision}
          className="rounded-[22px] border border-black/[0.065] bg-white/[0.12] p-5 sm:p-6"
        >
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-black/32">
            Decision {String(index + 1).padStart(2, "0")}
          </p>
          <h3 className="mt-4 text-base font-medium text-black/72">
            {item.decision}
          </h3>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <SmallField label="Reason">{item.reason}</SmallField>
            <SmallField label="Tradeoff">{item.tradeoff}</SmallField>
          </div>
        </li>
      ))}
    </ol>
  );
}

function TestingNotes({ notes }: { notes: CaseStudyTestingNote[] }) {
  return (
    <ul className="divide-y divide-black/[0.06] border-y border-black/[0.06]">
      {notes.map((note) => (
        <li key={note.observed} className="grid gap-4 py-5 sm:grid-cols-3">
          <SmallField label="Observed">{note.observed}</SmallField>
          <SmallField label="Cause">{note.cause || "Handled through testing and follow-up checks."}</SmallField>
          <SmallField label="Resolution">{note.resolution}</SmallField>
        </li>
      ))}
    </ul>
  );
}

function ArchitectureFlow({ label, nodes }: { label: string; nodes: string[] }) {
  return (
    <div className="rounded-[22px] border border-black/[0.065] bg-white/[0.12] p-5 sm:p-6">
      <p className="mb-5 text-[10px] font-medium uppercase tracking-[0.22em] text-black/34">
        {label}
      </p>
      <ol className="grid gap-3 sm:grid-cols-[repeat(auto-fit,minmax(150px,1fr))]">
        {nodes.map((node, index) => (
          <li
            key={node}
          className="relative rounded-[16px] border border-black/[0.055] bg-white/[0.1] px-4 py-4 text-sm leading-6 text-black/58 [overflow-wrap:anywhere]"
          >
            <span>{node}</span>
            {index < nodes.length - 1 ? (
              <span
                className="absolute -bottom-3 left-1/2 text-black/20 sm:-right-4 sm:bottom-auto sm:left-auto sm:top-1/2 sm:-translate-y-1/2"
                aria-hidden="true"
              >
                {"->"}
              </span>
            ) : null}
          </li>
        ))}
      </ol>
    </div>
  );
}

function TechnologyList({ groups }: { groups: CaseStudyTechnologyGroup[] }) {
  return (
    <dl className="grid gap-5 sm:grid-cols-2">
      {groups.map((group) => (
        <div key={group.label} className="border-t border-black/[0.06] pt-5">
          <dt className="text-[10px] font-medium uppercase tracking-[0.22em] text-black/34">
            {group.label}
          </dt>
          <dd className="mt-4">
            <ul className="space-y-2 text-sm leading-7 text-black/56">
              {group.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </dd>
        </div>
      ))}
    </dl>
  );
}

function SmallField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-black/32">
        {label}
      </p>
      <p className="mt-2 text-sm leading-7 text-black/56">{children}</p>
    </div>
  );
}
