import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
});

const siteDescription =
  "A quiet digital space for product experiments, photography, and independent projects by Hong.";

export const metadata: Metadata = {
  title: "Hong's Space",
  description: siteDescription,
  openGraph: {
    title: "Hong's Space",
    description:
      "Product experiments, photography, and independent projects by Hong.",
    type: "website",
    siteName: "Hong's Space",
  },
  twitter: {
    card: "summary",
    title: "Hong's Space",
    description: siteDescription,
  },
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={geistSans.variable}>{children}</body>
    </html>
  );
}
