export type ProjectLink = {
  label: string;
  value: string;
  href: string;
};

export type Project = {
  title: string;
  description: string;
  tags: string[];
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
    description:
      "A QR-code ordering mini program for small restaurants, built around a simple customer flow and clear merchant-side order management.",
    tags: [
      "WeChat Mini Program",
      "Cloud Functions",
      "Restaurant Tool",
      "Order Management",
    ],
    role:
      "Independent builder - product flow, interface design, frontend implementation, cloud functions, database structure, merchant workflow, testing, and deployment preparation.",
    problem:
      "Small restaurants need a simple ordering flow where customers can scan a table QR code, place orders, add dishes, and let merchants manage orders without confusion between tables.",
    solution:
      "A table-based ordering system with QR-code entry, cart and order confirmation, table session isolation, same-table order sharing, merchant order management, and table clearing after completion.",
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
];
