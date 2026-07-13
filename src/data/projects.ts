export type ProjectLink = {
  label: string;
  value: string;
  href: string;
};

export type CaseStudyInfoItem = {
  label: string;
  value: string;
};

export type CaseStudySystem = {
  name: string;
  description: string;
};

export type CaseStudyDecision = {
  decision: string;
  reason: string;
  tradeoff: string;
};

export type CaseStudyTestingNote = {
  observed: string;
  cause?: string;
  resolution: string;
};

export type CaseStudyTechnologyGroup = {
  label: string;
  items: string[];
};

export type ProjectCaseStudy = {
  label: string;
  longDescription: string;
  overview: CaseStudyInfoItem[];
  whyBuilt: string[];
  problemPillars: CaseStudySystem[];
  systemFlow: string[];
  coreSystems: CaseStudySystem[];
  productDecisions: CaseStudyDecision[];
  testingNotes: CaseStudyTestingNote[];
  architecture: {
    customerFlow: string[];
    adminFlow: string[];
  };
  currentStatus: string[];
  technology: CaseStudyTechnologyGroup[];
  screenshotNote: string;
  plannedScreenshots: string[];
};

export type Project = {
  slug: string;
  index: string;
  title: string;
  variant: "case-study" | "experiment";
  href: string;
  description: string;
  shortDescription: string;
  tags: string[];
  homepageTags: string[];
  role: string;
  status: string;
  systemSummary: string;
  links: ProjectLink[];
  caseStudy?: ProjectCaseStudy;
};

const repositoryLink: ProjectLink = {
  label: "Repository",
  value: "Repository",
  href: "https://github.com/llloo030330/wechat-scan-order",
};

export const projects: Project[] = [
  {
    slug: "wechat-ordering-system",
    index: "01",
    title: "WeChat Ordering System",
    variant: "case-study",
    href: "/projects/wechat-ordering-system",
    description:
      "A QR-code ordering mini program for small restaurants, focused on table sessions, merchant operations, and clear order flow.",
    shortDescription:
      "A QR-code ordering mini program for small restaurants, built around table sessions and merchant-side order handling.",
    tags: [
      "WeChat Mini Program",
      "Cloud Functions",
      "Restaurant Tool",
      "Order Management",
    ],
    homepageTags: ["WeChat Mini Program", "Cloud Functions", "Order Flow"],
    role: "Independent product design and development",
    status: "Ready for merchant deployment",
    systemSummary:
      "The system connects table QR entry, shared table orders, merchant operations, and cloud-function based data handling.",
    links: [repositoryLink],
    caseStudy: {
      label: "Selected Work / 01",
      longDescription:
        "A QR-code ordering mini program for small restaurants, focused on table sessions, merchant operations, and clear order flow.",
      overview: [
        {
          label: "Role",
          value:
            "Independent builder responsible for product flow, interface design, frontend pages, cloud functions, database structure, testing, and deployment preparation.",
        },
        {
          label: "Platform",
          value: "WeChat Mini Program with WeChat Cloud Development.",
        },
        {
          label: "Status",
          value: "Ready for merchant deployment.",
        },
      ],
      whyBuilt: [
        "I wanted to understand what it takes to turn a simple ordering idea into a complete working system.",
        "The difficult part was not displaying a menu. It was keeping table sessions, customer orders, merchant operations, and order completion consistent across the whole flow.",
      ],
      problemPillars: [
        {
          name: "Table identity",
          description:
            "Customers enter from different table QR codes, so the system needs to keep the correct table context throughout ordering and review.",
        },
        {
          name: "Shared order state",
          description:
            "People at the same table need to see the same active order, including additional dishes after the first order is placed.",
        },
        {
          name: "Merchant completion flow",
          description:
            "Merchant-side order completion and table clearing need to close the active session so the next group starts cleanly.",
        },
      ],
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
      coreSystems: [
        {
          name: "Table Sessions",
          description:
            "Each table QR establishes the table context used by the ordering flow and active table session.",
        },
        {
          name: "Order Isolation",
          description:
            "Orders are queried and updated according to the correct table and session instead of being shown globally.",
        },
        {
          name: "Same-table Updates",
          description:
            "Additional dishes are merged into the active table order when an active shared order already exists.",
        },
        {
          name: "Merchant Operations",
          description:
            "The merchant side includes order handling, dish management, category management, table management, store settings, and table code generation.",
        },
        {
          name: "Table Clearing",
          description:
            "Table session records can be closed after completion or clearing so the next group starts with a new active session.",
        },
        {
          name: "Cloud Functions",
          description:
            "Customer menu reads, order operations, admin operations, table-code generation, and openid retrieval are handled through cloud functions.",
        },
      ],
      productDecisions: [
        {
          decision: "Use a table session instead of isolated carts.",
          reason:
            "The restaurant workflow depends on the table, not only on a single customer's device.",
          tradeoff:
            "Every order action needs to validate the session, table, and current user context.",
        },
        {
          decision: "Merge additional dishes into the active table order.",
          reason:
            "Restaurant staff should see one current order for the table rather than several disconnected order records.",
          tradeoff:
            "The update logic must preserve existing dishes, remarks, totals, and order state.",
        },
        {
          decision: "Separate customer operations from merchant operations.",
          reason:
            "Customers only need menu, cart, order detail, and table state; merchants need administrative controls.",
          tradeoff:
            "The project needs separate cloud-function actions and admin whitelist checks.",
        },
        {
          decision: "Keep table clearing tied to session state.",
          reason:
            "A new group at the same table should not inherit the previous group's active order.",
          tradeoff:
            "Merchant completion and clearing flows must update both order and table-session state consistently.",
        },
      ],
      testingNotes: [
        {
          observed:
            "A new customer can still see the previous table order if the table session remains active.",
          cause:
            "The active table session is the source of the current shared order.",
          resolution:
            "Close the table session through merchant completion or table clearing before the next group uses the table.",
        },
        {
          observed:
            "Additional dishes need to appear in the same current table order instead of creating unrelated records.",
          cause:
            "The order API checks for an active session order and appends items when one exists.",
          resolution:
            "Use the active order id on the table session and update the existing order inside a transaction.",
        },
        {
          observed:
            "Only authorized customers should view a table order after scanning or joining the table session.",
          cause:
            "Order detail access depends on the table session customer openid list.",
          resolution:
            "Validate session membership before returning current order or order details.",
        },
        {
          observed:
            "Cloud function and database permission issues can block menu, order, admin, or table-code operations.",
          resolution:
            "Deployment documentation keeps database collections and cloud function deployment steps explicit.",
        },
      ],
      architecture: {
        customerFlow: [
          "Customer Mini Program",
          "menuApi / orderApi",
          "Cloud Database",
          "Merchant Dashboard",
        ],
        adminFlow: [
          "Platform Admin",
          "adminApi",
          "Store Management",
          "Merchant Separation",
        ],
      },
      currentStatus: [
        "Core customer ordering flow completed.",
        "Merchant order management completed.",
        "Table session and clearing flow implemented.",
        "Menu, dish, category, table, and store settings management implemented.",
        "Further merchant testing and deployment work can continue.",
      ],
      technology: [
        {
          label: "Client",
          items: ["WeChat Mini Program", "JavaScript", "WXML", "WXSS"],
        },
        {
          label: "Cloud",
          items: [
            "WeChat Cloud Development",
            "Cloud Functions",
            "wx-server-sdk",
          ],
        },
        {
          label: "Data",
          items: [
            "Cloud Database",
            "orders",
            "tableSessions",
            "tables",
            "dishes",
            "categories",
            "storeSettings",
          ],
        },
        {
          label: "Tools",
          items: ["WeChat Developer Tools", "Configuration templates"],
        },
      ],
      screenshotNote:
        "Interface documentation will be added as the system develops.",
      plannedScreenshots: [
        "Customer menu",
        "Current shared table order",
        "Merchant order management",
        "Dish management",
        "Table management",
      ],
    },
  },
  {
    slug: "brain-garden",
    index: "02",
    title: "Brain Garden",
    variant: "experiment",
    href: "/experiments/brain-garden",
    description:
      "A small web experiment for memory, attention, focus, and quick rule switching.",
    shortDescription:
      "A small web experiment for memory, attention, focus, and quick rule switching.",
    tags: ["Experiment", "Interaction", "Daily Practice", "React"],
    homepageTags: ["Experiment", "Interaction", "Daily Practice"],
    role: "Independent interaction experiment",
    status: "Web experiment",
    systemSummary:
      "Four short exercises live on a separate experiment page so the homepage stays quiet.",
    links: [
      {
        label: "Open Experiment",
        value: "Open Experiment",
        href: "/experiments/brain-garden",
      },
    ],
  },
];

export function getProjectBySlug(slug: string) {
  return projects.find((project) => project.slug === slug);
}
