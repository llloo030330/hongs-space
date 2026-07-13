import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
});

const siteDescription = "在阅读环境中重复记忆英语单词。";

export const metadata: Metadata = {
  title: "阅读环境中重复记忆",
  description: siteDescription,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "阅读环境中重复记忆",
    description: siteDescription,
    type: "website",
    siteName: "阅读环境中重复记忆",
  },
  twitter: {
    card: "summary",
    title: "阅读环境中重复记忆",
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
    <html lang="zh-CN">
      <body className={geistSans.variable}>{children}</body>
    </html>
  );
}
