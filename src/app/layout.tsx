import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://prepai.ng";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: "PREP CLASS — Pass JAMB, WAEC & NECO on Your First Try",
    template: "%s · PREP CLASS",
  },
  description:
    "Practice real CBT past questions for JAMB, WAEC and NECO. Get an AI weakness report after every session and study the exact textbook chapter you need. ₦1,000/month.",
  keywords: [
    "JAMB CBT practice",
    "WAEC past questions",
    "NECO past questions",
    "JAMB 2026",
    "CBT practice Nigeria",
    "AI study app Nigeria",
    "JAMB past questions and answers",
    "PREP CLASS",
  ],
  authors: [{ name: "PREP CLASS" }],
  openGraph: {
    type: "website",
    locale: "en_NG",
    url: SITE,
    siteName: "PREP CLASS",
    title: "PREP CLASS — Pass JAMB, WAEC & NECO on Your First Try",
    description:
      "Real CBT practice + AI weakness reports + the exact textbook chapter to study. Built for Nigerian students.",
    images: [{ url: "/og.svg", width: 1200, height: 630, alt: "PREP CLASS" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "PREP CLASS — Pass JAMB, WAEC & NECO on Your First Try",
    description: "Real CBT practice + AI weakness reports + recommended textbook chapters.",
    images: ["/og.svg"],
  },
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icon.svg", apple: "/icon.svg" },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#1f3fed",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>{children}</body>
    </html>
  );
}
