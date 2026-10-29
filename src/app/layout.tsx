import type { Metadata } from "next";
import { Anton, Barlow, Barlow_Condensed } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import GoogleAnalytics from "@/components/GoogleAnalytics";

const display = Anton({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
  display: "swap",
});

const label = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-label",
  display: "swap",
});

const body = Barlow({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s | Second Monitor Games",
    default:  "Second Monitor Games — Free Daily Puzzle Games",
  },
  description:
    "Quick daily puzzle games for your second monitor. Card games, strategy puzzles, and brain challenges designed for work breaks — free to play, no subscription needed.",
  keywords: [
    "second monitor games",
    "games to play at work",
    "games like Balatro",
    "card game like Balatro browser",
    "roguelike card game online",
    "quick games during work break",
    "card puzzle game online",
    "unique puzzle games",
    "daily card game",
    "solitaire roguelike",
    "Balatro alternative free",
    "brain games for work",
    "strategy card game online",
    "games between meetings",
    "free daily puzzle game",
    "office games online",
    "daily strategy game",
  ],
  metadataBase: new URL("https://secondmonitorgames.com"),
  alternates: {
    canonical: "https://secondmonitorgames.com",
  },
  openGraph: {
    title:       "Second Monitor Games — Daily Card Games & Puzzles for Work Breaks",
    description: "Quick daily card games, strategy puzzles, and brain challenges for your second monitor. Free to play — new challenges every day.",
    siteName:    "Second Monitor Games",
    url:         "https://secondmonitorgames.com",
    type:        "website",
    locale:      "en_US",
  },
  twitter: {
    card:        "summary_large_image",
    title:       "Second Monitor Games — Daily Card Games & Puzzles for Work Breaks",
    description: "Quick daily card games and puzzles for your second monitor. Free to play, new challenges every day.",
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
      className={`${display.variable} ${label.variable} ${body.variable}`}
    >
      <head>
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
        <GoogleAnalytics />
        <ClerkProvider afterSignUpUrl="/onboard">
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </ClerkProvider>
      </body>
    </html>
  );
}
