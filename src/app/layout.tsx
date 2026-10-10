import type { Metadata } from "next";
import { siteUrl } from "@/lib/site";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
const sans = Geist({ subsets: ["latin"], variable: "--font-sans" });
const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" });
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Tape — Investment research workspace",
  description:
    "One research workspace for opportunities, smart money, options, news, and portfolio risk.",
  robots: { index: false, follow: false },
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${mono.variable} dark`}
      suppressHydrationWarning
    >
      <body>{children}</body>
    </html>
  );
}
