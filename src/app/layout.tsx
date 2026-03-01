import type { Metadata } from "next";
import { Inter, DM_Serif_Display } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ThemeProvider from "@/components/ui/ThemeProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const dmSerif = DM_Serif_Display({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-dm-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s | Second Monitor Games",
    default:  "Second Monitor Games — Free Daily Puzzle Games",
  },
  description:
    "Free daily puzzle games for your second monitor. A new word puzzle, brain game, and strategy challenge every day — no subscription needed. Play today.",
  keywords: [
    "daily puzzle game",
    "free daily word puzzle",
    "online puzzle game",
    "word puzzle game",
    "daily brain puzzle",
    "free brain games",
    "puzzle game at work",
    "five letter word puzzle",
    "daily puzzle game free",
    "word puzzle online free",
    "games to play at work",
    "brain puzzle game online",
    "puzzle game like Wordle",
    "free word puzzle game",
  ],
  metadataBase: new URL("https://secondmonitorgames.com"),
  alternates: {
    canonical: "https://secondmonitorgames.com",
  },
  openGraph: {
    title:       "Second Monitor Games — Free Daily Puzzle Games",
    description: "Free daily puzzle games. A new word puzzle, brain game, and strategy challenge every day — no subscription needed.",
    siteName:    "Second Monitor Games",
    url:         "https://secondmonitorgames.com",
    type:        "website",
    locale:      "en_US",
  },
  twitter: {
    card:        "summary_large_image",
    title:       "Second Monitor Games — Free Daily Puzzle Games",
    description: "Free daily puzzle games. New word puzzles and brain games every day — no subscription needed.",
    site:        "@SecondMonitorGames",
  },
  robots: {
    index:            true,
    follow:           true,
    googleBot: {
      index:               true,
      follow:              true,
      "max-image-preview": "large",
      "max-snippet":       -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${dmSerif.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Theme init — runs before first paint to prevent flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var t = localStorage.getItem('smg-theme');
                document.documentElement.setAttribute(
                  'data-theme',
                  t === 'light' ? 'light' : 'dark'
                );
              } catch (e) {}
            `,
          }}
        />
        {/* JSON-LD — WebSite + Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type":       "WebSite",
                  "@id":         "https://secondmonitorgames.com/#website",
                  "name":        "Second Monitor Games",
                  "url":         "https://secondmonitorgames.com",
                  "description": "Free daily puzzle games. A new word puzzle, brain game, and strategy challenge every day.",
                  "inLanguage":  "en-US",
                },
                {
                  "@type":  "Organization",
                  "@id":    "https://secondmonitorgames.com/#organization",
                  "name":   "Second Monitor Games",
                  "url":    "https://secondmonitorgames.com",
                  "sameAs": [
                    "https://twitter.com/SecondMonitorGames",
                  ],
                },
              ],
            }),
          }}
        />
      </head>
      <body className="antialiased flex flex-col min-h-screen">
        <ClerkProvider>
          <ThemeProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
