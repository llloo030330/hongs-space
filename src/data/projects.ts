export type ProjectLink = {
  label: string;
  value: string;
  href: string;
};

export type Project = {
  title: string;
  variant?: "case-study" | "experiment";
  description: string;
  tags: string[];
  context: string;
  systemFlow: string[];
  keySystems: string[];
  role: string;
  problem: string;
  solution: string;
  coreFeatures: string[];
  techStack: string[];
  status: string;
  links: ProjectLink[];
};

export const projects: Project[] = [
  {
    title: "WeChat Ordering System",
    variant: "case-study",
    description:
      "A QR-code ordering mini program for small restaurants, focused on table sessions, merchant operations, and real-time order flow.",
    tags: [
      "WeChat Mini Program",
      "Cloud Functions",
      "Restaurant Tool",
      "Order Management",
    ],
    context:
      "A QR-code ordering mini program built for small restaurant ordering workflows.",
    systemFlow: [
      "Scan table QR",
      "Browse menu",
      "Add to cart",
      "Confirm order",
      "Same-table updates",
      "Merchant handles order",
      "Complete order",
      "Clear table session",
    ],
    keySystems: [
      "Table Sessions",
      "Order Isolation",
      "Same-table Updates",
      "Merchant Dashboard",
      "Dish Management",
      "Table Clearing",
    ],
    role:
      "Independent builder: product flow, interface design, frontend pages, cloud functions, database structure, testing, and deployment preparation.",
    problem:
      "Keeping customer orders isolated by table while giving merchants a clear way to manage active orders.",
    solution:
      "A table-based ordering flow with isolated table sessions, same-table order updates, merchant order controls, and table clearing after completion.",
    coreFeatures: [
      "QR-code table ordering",
      "Menu browsing and cart flow",
      "Order confirmation",
      "Add-dishes flow",
      "Table/session-based order isolation",
      "Same-table shared order state",
      "Merchant order dashboard",
      "Dish management",
      "Complete order and clear table",
      "Cloud function based order handling",
    ],
    techStack: [
      "WeChat Mini Program",
      "JavaScript",
      "WXML",
      "WXSS",
      "WeChat Cloud Development",
      "Cloud Functions",
      "Cloud Database",
    ],
    status: "Ready for merchant deployment",
    links: [
      {
        label: "Repository",
        value: "View Repository",
        href: "https://github.com/llloo030330/wechat-scan-order",
      },
    ],
  },
  {
    title: "Brain Garden",
    variant: "experiment",
    description:
      "A quiet cognitive exercise experiment for focus, memory, attention, and quick rule switching.",
    tags: ["Experiment", "Interaction", "Cognitive Practice", "React"],
    context:
      "A small daily brain training experiment with focus, memory, attention, and rule-switching games.",
    systemFlow: [
      "Choose practice",
      "Start short game",
      "Finish attempt",
      "Save local best",
      "Return tomorrow",
    ],
    keySystems: [
      "Memory Path",
      "Stroop Focus",
      "Schulte Grid",
      "RPS Logic",
      "Local Progress",
    ],
    role:
      "Independent builder: interaction design, game logic, React migration, local progress storage, and responsive implementation.",
    problem:
      "Small cognitive exercises can become noisy or game-like too quickly, which does not fit Hong's Space.",
    solution:
      "A restrained experiment page with four short games, local-only progress, and a quiet interface that stays separate from the homepage hero.",
    coreFeatures: [
      "Memory path sequence practice",
      "Stroop color attention practice",
      "Schulte visual search grid",
      "Rock Paper Scissors rule-switching exercise",
      "Best score saved locally",
      "No login or database",
      "Mobile-friendly layout",
    ],
    techStack: ["Next.js", "React", "TypeScript", "Tailwind CSS", "localStorage"],
    status: "Web experiment",
    links: [
      {
        label: "Open Experiment",
        value: "Open Experiment",
        href: "/experiments/brain-garden",
      },
    ],
  },
];
