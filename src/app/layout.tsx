import type { Metadata, Viewport } from "next";
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
  metadataBase: new URL("https://hongs-space.vercel.app"),
  title: "Hong's Space",
  description: siteDescription,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Hong's Space",
    description:
      "Product experiments, photography, and independent projects by Hong.",
    type: "website",
    siteName: "Hong's Space",
    url: "/",
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

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#f5f5f2",
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
