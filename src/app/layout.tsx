import type { Metadata } from "next";
import { Inter, DM_Serif_Display } from "next/font/google";
import "./globals.css";
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
  title: "Second Monitor Games",
  description:
    "A new game every day. Play free or subscribe for an ad-free experience.",
  openGraph: {
    title: "Second Monitor Games",
    description:
      "A new game every day. Play free or subscribe for an ad-free experience.",
    siteName: "Second Monitor Games",
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
        {/*
          Inline script runs before first paint to apply the saved theme
          and prevent a flash of the wrong theme on load.
        */}
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
      </head>
      <body className="antialiased flex flex-col min-h-screen">
        <ThemeProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
