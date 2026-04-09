import type { Metadata } from "next";
import { Bricolage_Grotesque, DM_Sans, DM_Mono } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  variable: "--font-dm-mono",
  weight: ["300", "400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "HireIQ — Resume Intelligence Platform",
    template: "%s · HireIQ",
  },
  description:
    "AI-powered resume screening and candidate evaluation for modern hiring teams. Parse resumes, score candidates, manage pipelines.",
  keywords: ["resume screening", "AI recruitment", "candidate evaluation", "hiring platform"],
  authors: [{ name: "HireIQ" }],
  openGraph: {
    title: "HireIQ — Resume Intelligence Platform",
    description: "AI-powered resume screening and candidate evaluation.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${bricolage.variable} ${dmSans.variable} ${dmMono.variable}`}
    >
      <body className="min-h-screen bg-background antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
